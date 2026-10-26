const { wabot, mode, setWarn, removeWarn } = require("../lib/");
const { WARN_COUNT } = require("../config");
wabot({
  pattern: "warn",
  fromMe: true,
  desc: "warn user",
  type: "group"
}, async (message, match) => {
  await setWarn(message, match, WARN_COUNT);
});
wabot({
  pattern: "resetwarn",
  fromMe: true,
  desc: "warn user",
  type: "group"
}, async (message, match) => {
  await removeWarn(message);
});
wabot(
  {
    pattern: "vv",
    fromMe: true,
    desc: "Forwards The View once messsage",
    type: "misc"
  },
  async (message, match) => {
    if (!message.quoted) return;
    let buff = await message.quoted.download("buffer");
    return await message.sendFile(buff);
  }
);
