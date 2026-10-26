const config = require("../config");
const commands = [];
const HANDLERS = config.HANDLERS == "null" ? "" : config.HANDLERS;
let handler = HANDLERS;
if (!handler.startsWith("^") && handler !== "") {
  handler = handler.replace("[", "").replace("]", "").replace(/\./g, "[.]");
} else if (new RegExp("\\p{Emoji_Presentation}", "gu").test(HANDLERS)) {
  handler = "^[.]";
}
config.HANDLERS = handler;
function wabot(commandObj, commandFunction) {
  const messageTypes = ["photo", "image", "text", "sticker", "message", "audio", "video"];
  const commandConfig = {
    "fromMe": commandObj.fromMe === void 0 ? true : commandObj.fromMe,
    "onlyGroup": commandObj.onlyGroup === void 0 ? false : commandObj.onlyGroup,
    "desc": commandObj.desc === void 0 ? "" : commandObj.desc,
    "dontAddCommandList": commandObj.dontAddCommandList === void 0 ? false : commandObj.dontAddCommandList,
    "type": commandObj.type === void 0 ? false : commandObj.type,
    "function": commandFunction
  };
  if (commandObj.on === void 0 && commandObj.pattern === void 0) {
    commandConfig.on = "message";
    commandConfig.fromMe = false;
  } else if (commandObj.on !== void 0 && messageTypes.includes(commandObj.on)) {
    commandConfig.on = commandObj.on;
    if (commandObj.pattern !== void 0) {
      commandConfig.pattern = new RegExp((commandObj.handler === void 0 || commandObj.handler === true ? config.HANDLERS : "") + commandObj.pattern, commandObj.flags !== void 0 ? commandObj.flags : "");
    }
  } else {
    commandConfig.pattern = new RegExp((handler.startsWith("^") ? handler : "^" + handler) + "(" + commandObj.pattern + "| " + commandObj.pattern + ")", "is");
  }
  commands.push(commandConfig);
  return commandConfig;
}
module.exports = {
  wabot,
  commands,
  PREFIX: (config.HANDLERS ? config.HANDLERS.startsWith("^") ? config.HANDLERS.match(/\[(\W*)\]/)?.[1]?.[0] : config.HANDLERS.replace(/\[/g, "").replace(/\]/g, "") : "").trim() || config.HANDLERS,
  mode: config.MODE == "public" ? false : true
};
