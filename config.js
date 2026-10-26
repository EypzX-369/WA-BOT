const { Sequelize } = require("sequelize");
const fs = require("fs");
require("dotenv").config();
if (fs.existsSync("config.env")) require("dotenv").config({ path: "./config.env", override: true });
function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
const toBool = (x) => x && x.toLowerCase() === "true" || false;
const DATABASE_URL = process.env.DATABASE_URL === void 0 ? "./database.db" : process.env.DATABASE_URL;
DEBUG = process.env.DEBUG === void 0 ? false : convertToBool(process.env.DEBUG);
module.exports = {
  HANDLERS: (process.env.PREFIX || "^[.,!]").trim(),
  BRANCH: "main",
  ADMIN_ACCESS: toBool(process.env.ADMIN_ACCESS) || false,
  MODE: (process.env.MODE || "private").toLowerCase(),
  ERROR_MSG: toBool(process.env.ERROR_MSG) || true,
  LOG_MSG: toBool(process.env.LOG_MSG) || true,
  READ_CMD: toBool(process.env.READ_CMD),
  ALWAYS_ONLINE: toBool(process.env.ALWAYS_ONLINE) || false,
  WARN_COUNT: process.env.WARN_COUNT || "3",
  AUTO_STATUS_VIEW: toBool(process.env.AUTO_STATUS_VIEW) || false,
  MENU_URL: process.env.MENU_URL || "https://files.catbox.moe/45n54r.png",
  MENU_TYPE: process.env.MENU_TYPE || "normal",
  CAPTION: process.env.CAPTION || "Made with \u{1F90D}",
  READ_MSG: toBool(process.env.READ_MSG),
  OWNER_NAME: process.env.OWNER_NAME || "Eypz",
  BOT_NAME: process.env.BOT_NAME || "WA-BOT",
  SUDO: process.env.SUDO || null,
  LANG: process.env.LANGUAGE === void 0 ? "EN" : process.env.LANGUAGE.toUpperCase(),
  STICKER_PACKNAME: process.env.STICKER_PACKNAME || "WA-BOT,Eypz",
  AUDIO_DATA: process.env.AUDIO_DATA || "Eypz;WA-BOT;https://files.catbox.moe/45n54r.png",
  PROCESSNAME: process.env.PROCESSNAME || "WA-BOT",
  AUTHOR: process.env.AUTHOR || "Eypz",
  PRESENCE: process.env.PRESENCE || "unavailable",
  //available, typing, recording
  DELETED_LOG_CHAT: process.env.DELETED_LOG_CHAT || false,
  DATABASE_URL,
  DATABASE: DATABASE_URL === "./database.db" ? new Sequelize({ dialect: "sqlite", storage: DATABASE_URL, logging: false }) : new Sequelize(DATABASE_URL, { dialect: "postgres", ssl: true, protocol: "postgres", dialectOptions: { native: true, ssl: { require: true, rejectUnauthorized: false } }, logging: false }),
  DEBUG
};
