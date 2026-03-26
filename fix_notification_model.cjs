const fs = require('fs');
const file = 'models/Notification.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/enum: \["assignment", "grade", "class", "task"\],/, 'enum: ["assignment", "grade", "class", "task", "announcement", "calendar", "notification"],');

fs.writeFileSync(file, content);
