const passport = require("passport");

// Export JWT authentication middleware
exports.protect = (req, res, next) => {
  passport.authenticate("jwt", { session: false })(req, res, next);
};

// Middleware to check if user is an instructor
exports.instructorOnly = (req, res, next) => {
  if (req.user && req.user.role === "instructor") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Instructor role required.",
  });
};

// Middleware to check if user is a student
exports.studentOnly = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Student role required.",
  });
};

// Middleware to check if user owns the resource or is an instructor
exports.checkOwnership = (model, ownerField = "instructorId") => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${model}`);
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${model} not found`,
        });
      }

      // Check if user is the owner or an instructor
      const isOwner =
        resource[ownerField].toString() === req.user.id.toString();
      const isInstructor = req.user.role === "instructor";

      if (!isOwner && !isInstructor) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not own this resource.",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};
