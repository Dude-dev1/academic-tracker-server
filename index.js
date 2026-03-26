require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
// Error handler - must have 4 params for Express to recognize it as error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

// Load passport configuration
require("./config/passport")(passport);

// Route files
const authRoutes = require("./routes/authRoutes");
const classRoutes = require("./routes/classRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const calendarEventRoutes = require("./routes/calendarEventRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

const app = express();

// Connect to database
connectDB();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
// Note: We don't use sessions for JWT-based auth, but passport requires initialization

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/calendar-events", calendarEventRoutes);
app.use("/api/announcements", announcementRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler - must be last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Store active connections
const classConnections = {};

// Socket.IO middleware to authenticate users
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  // Token validation can be added here if needed
  next();
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a class chat room
  socket.on("joinClass", (data) => {
    const { classId, userId, userName } = data;
    socket.join(`class_${classId}`);

    if (!classConnections[classId]) {
      classConnections[classId] = [];
    }
    classConnections[classId].push({ socketId: socket.id, userId, userName });

    // Notify others in the class
    io.to(`class_${classId}`).emit("userJoined", {
      userId,
      userName,
      message: `${userName} joined the chat`,
      timestamp: new Date(),
    });

    console.log(`User ${userName} joined class ${classId}`);
  });

  // Handle incoming chat messages
  socket.on("sendMessage", async (data) => {
    const { classId, userId, userName, message } = data;

    try {
      const Chat = require("./models/Chat");

      // Save message to database
      const newMessage = await Chat.create({
        classId,
        userId,
        userName,
        message,
      });

      // Broadcast to all users in the class
      io.to(`class_${classId}`).emit("receiveMessage", {
        _id: newMessage._id,
        userId,
        userName,
        message,
        createdAt: newMessage.createdAt,
        isEdited: false,
      });
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to save message" });
    }
  });

  // Handle message editing
  socket.on("editMessage", async (data) => {
    const { classId, messageId, userId, newMessage } = data;

    try {
      const Chat = require("./models/Chat");

      const message = await Chat.findByIdAndUpdate(
        messageId,
        {
          message: newMessage,
          isEdited: true,
          editedAt: new Date(),
        },
        { new: true }
      );

      // Broadcast edited message to all users in the class
      io.to(`class_${classId}`).emit("messageEdited", {
        _id: message._id,
        message: message.message,
        isEdited: true,
        editedAt: message.editedAt,
      });
    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("error", { message: "Failed to edit message" });
    }
  });

  // Handle message deletion
  socket.on("deleteMessage", async (data) => {
    const { classId, messageId } = data;

    try {
      const Chat = require("./models/Chat");
      await Chat.findByIdAndDelete(messageId);

      // Broadcast deletion to all users in the class
      io.to(`class_${classId}`).emit("messageDeleted", { messageId });
    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  // User leaves a class chat room
  socket.on("leaveClass", (data) => {
    const { classId, userId, userName } = data;
    socket.leave(`class_${classId}`);

    if (classConnections[classId]) {
      classConnections[classId] = classConnections[classId].filter(
        (conn) => conn.socketId !== socket.id
      );
    }

    io.to(`class_${classId}`).emit("userLeft", {
      userId,
      userName,
      message: `${userName} left the chat`,
      timestamp: new Date(),
    });

    console.log(`User ${userName} left class ${classId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Clean up connections
    for (const classId in classConnections) {
      classConnections[classId] = classConnections[classId].filter(
        (conn) => conn.socketId !== socket.id
      );
    }
  });

  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
