const { wabot, mode, PREFIX, commands } = require("../lib/");
const config = require("../config");
const now = /* @__PURE__ */ new Date();
const date = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
const time = now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
const version = require("../package.json").version;
wabot({
  pattern: "menu ?(.*)",
  desc: "WA-BOT user manual",
  fromMe: mode,
  type: "misc"
}, async (message, match, client) => {
  const fancyFont = (text) => {
    const style = {
      a: "\u1D00",
      b: "\u0299",
      c: "\u1D04",
      d: "\u1D05",
      e: "\u1D07",
      f: "\uA730",
      g: "\u0262",
      h: "\u029C",
      i: "\u026A",
      j: "\u1D0A",
      k: "\u1D0B",
      l: "\u029F",
      m: "\u1D0D",
      n: "\u0274",
      o: "\u1D0F",
      p: "\u1D18",
      q: "\u01EB",
      r: "\u0280",
      s: "\uA731",
      t: "\u1D1B",
      u: "\u1D1C",
      v: "\u1D20",
      w: "\u1D21",
      x: "x",
      y: "\u028F",
      z: "\u1D22"
    };
    return text.toLowerCase().split("").map((c) => style[c] || c).join("");
  };
  let menu = `
*${config.BOT_NAME.toUpperCase()}*

  \u1D0F\u1D21\u0274\u1D07\u0280   : ${config.OWNER_NAME}
  \u1D18\u0280\u1D07\u0493\u026Ax  : ${PREFIX}
  \u1D05\u1D00\u1D1B\u1D07    : ${date}
  \u1D1B\u026A\u1D0D\u1D07    : ${time}
  \u1D0D\u1D0F\u1D05\u1D07    : ${mode ? "\u1D18\u0280\u026A\u1D20\u1D00\u1D1B\u1D07" : "\u1D18\u1D1C\u0299\u029F\u026A\u1D04"}
  \u1D20\u1D07\u0280\uA731\u026A\u1D0F\u0274 : \u1D20${version}

*\u1D04\u1D0F\u1D0D\u1D0D\u1D00\u0274\u1D05 \u029F\u026A\uA731\u1D1B*`;
  const categories = {};
  commands.forEach((cmd) => {
    if (!cmd.pattern || cmd.dontAddCommandList) return;
    const type = cmd.type || "misc";
    const name = String(cmd.pattern).split(/\W+/)[1] || "";
    if (!categories[type]) categories[type] = [];
    categories[type].push(name);
  });
  Object.entries(categories).sort().forEach(([type, cmds]) => {
    menu += `

*${type.toUpperCase()}*`;
    cmds.sort().forEach((cmd) => {
      menu += `
> ${fancyFont(cmd)}`;
    });
  });
  menu += `

${fancyFont(config.BOT_NAME)} \xA9 ${now.getFullYear()}`;
 const quotedMessage = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "0@s.whatsapp.net"
    },
    message: {
      productMessage: {
        product: {
          title: config.BOT_NAME,
          description: "",
          priceAmount1000: 77777777777e-3,
          currencyCode: "AED",
          retailerId: "",
          url: "myr.in",
          productImageCount: 0
        },
        businessOwnerJid: "917994489493@s.whatsapp.net"
      }
    },
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true
    }
  };
  await message.client.sendMessage(
    message.jid,
    {
      text: menu,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363298577467093@newsletter",
          newsletterName: config.BOT_NAME,
          serverMessageId: -1
        }
      }
    },
    { quoted: quotedMessage }
  );
});
