const { wabot, pmBlock, pmb } = require("../lib/");
wabot({
  pattern: "pmblocker ?(.*)",
  fromMe: true,
  desc: "personal message controller",
  type: "user"
}, async (message, match) => {
  await pmb(message, match);
});
wabot(
  {
    on: "message",
    fromMe: false
  },
  async (message) => {
    await pmBlock(message);
  }
);
