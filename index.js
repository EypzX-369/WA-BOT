require("dotenv").config({ path: "./config.env" });
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const credsPath = path.join(__dirname, "lib", "auth", "creds.json");
if (fs.existsSync(credsPath)) {
  console.log("creds.json found. Starting bot...");
  execSync("node bot.js", { stdio: "inherit" });
} else {
  console.log("No session found. Starting pairing...");
  execSync("node pair.js", { stdio: "inherit" });
}
