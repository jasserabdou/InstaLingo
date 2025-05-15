const { spawn } = require("child_process");
const path = require("path");

// Start React development server
const reactProcess = spawn("npm", ["start"], {
  stdio: "inherit",
  shell: true,
});

// Start Flask backend
const flaskProcess = spawn("python", ["../translation-app/app.py"], {
  stdio: "inherit",
  shell: true,
});

// Handle cleanup
const cleanup = () => {
  reactProcess.kill();
  flaskProcess.kill();
};

// Handle termination signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
