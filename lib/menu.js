const { PREFIX, mode, commands } = require("./events");
const version = require("../package.json").version;
const { getJson } = require("./utils");
const config = require("../config");
const { getMenu, setMenu } = require("./database/menu");
async function sendMenu(message, match) {
  if (match) {
    for (let i of commands) {
      if (i.pattern instanceof RegExp && i.pattern.test(`${PREFIX}` + match)) {
        const cmdName = i.pattern.toString().split(/\W+/)[1];
        message.reply(`\`\`\`\u{1F916}Command: ${PREFIX}${cmdName.trim()}
Description: ${i.desc}\`\`\``);
      }
    }
  } else {
    const link = config.MENU_URL;
    const hrs = (/* @__PURE__ */ new Date()).getHours({ timeZone: "Asia/Kolkata" });
    const { result } = await getJson("https://api.maskser.me/api/quote?apikey=izumi-v3");
    const type = mode ? "\u{1D5E3}\u{1D5E5}\u{1D5DC}\u{1D5E9}\u{1D5D4}\u{1D5E7}\u{1D5D8}" : "\u{1D5E3}\u{1D5E8}\u{1D5D5}\u{1D5DF}\u{1D5DC}\u{1D5D6}";
    var msg = await getMenu();
    let wish = "";
    if (hrs < 12) wish = "\u26C5\u{1D642}\u{1D664}\u{1D664}\u{1D659} \u{1D648}\u{1D664}\u{1D667}\u{1D663}\u{1D65E}\u{1D663}\u{1D65C} ";
    else if (hrs >= 12 && hrs <= 16) wish = "\u{1F31E}\u{1D642}\u{1D664}\u{1D664}\u{1D659} \u{1D63C}\u{1D65B}\u{1D669}\u{1D65A}\u{1D667}\u{1D663}\u{1D664}\u{1D664}\u{1D663}";
    else if (hrs >= 16 && hrs <= 20) wish = "\u{1F506}\u{1D642}\u{1D664}\u{1D664}\u{1D659} \u{1D640}\u{1D66B}\u{1D65A}\u{1D663}\u{1D65E}\u{1D663}\u{1D65C}";
    else if (hrs >= 20 && hrs <= 24) wish = "\u{1F319}\u{1D642}\u{1D664}\u{1D664}\u{1D659} \u{1D649}\u{1D65E}\u{1D65C}\u{1D65D}\u{1D669}";
    if (msg.value === "button") {
      const url = await message.ParseButtonMedia(link);
      let buttonArray = [
        { type: "reply", params: { display_text: "DOWNLOADER", id: `${PREFIX}.downloader` } },
        { type: "reply", params: { display_text: "INFO", id: `${PREFIX}.info` } },
        { type: "reply", params: { display_text: "GROUP", id: `${PREFIX}.group` } },
        { type: "reply", params: { display_text: "MEDIA", id: `${PREFIX}.media` } },
        { type: "reply", params: { display_text: "AnimeVideo", id: `${PREFIX}.AnimeVideo` } },
        { type: "reply", params: { display_text: "USER", id: `${PREFIX}.user` } },
        { type: "reply", params: { display_text: "GENERATOR", id: `${PREFIX}.generator` } },
        { type: "reply", params: { display_text: "AnimeImage", id: `${PREFIX}.AnimeImage` } }
      ];
      const taxt = `\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E
*_\u{1F33B}\u01EB\u1D1C\u1D0F\u1D1B\u1D07 \u1D0F\u0493 \u1D1B\u029C\u1D07 \u1D05\u1D00\u028F \u{1F33B}_*
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F
\u{1F4D6} *${result.quoteText}* \u{1F58B}\uFE0F

${wish} ${message.pushName.replace(/[\r\n]+/gm, "")}`;
      buttonArray.sort((a, b) => a.params.display_text.localeCompare(b.params.display_text));
      let data = {
        jid: message.jid,
        button: buttonArray,
        header: {
          title: taxt,
          subtitle: taxt,
          hasMediaAttachment: true
        },
        footer: {
          text: `\u{1D5E0}\u{1D5E2}\u{1D5D7}\u{1D5D8} : ${type}
\u{1D5E9}\u{1D5D8}\u{1D5E5}\u{1D5E6}\u{1D5DC}\u{1D5E2}\u{1D5E1} : ${version}
${config.BOT_NAME}`
        },
        body: {
          text: ""
        }
      };
      if (link.endsWith(".mp4")) {
        data.header.videoMessage = url;
      } else {
        data.header.imageMessage = url;
      }
      return await message.sendMessage(message.jid, data, {}, "interactive");
    } else if (msg.value === "list") {
      const url = await message.ParseButtonMedia(link);
      let sections = [
        {
          title: "WA-BOT Commands",
          rows: [
            { title: "DOWNLOADER", id: `${PREFIX}.downloader` },
            { title: "INFO", id: `${PREFIX}.info` },
            { title: "GROUP", id: `${PREFIX}.group` },
            { title: "MEDIA", id: `${PREFIX}.media` },
            { title: "AnimeVideo", id: `${PREFIX}.AnimeVideo` },
            { title: "USER", id: `${PREFIX}.user` },
            { title: "GENERATOR", id: `${PREFIX}.generator` },
            { title: "AnimeImage", id: `${PREFIX}.AnimeImage` }
          ]
        }
      ];
      const taxt = `\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E
*_\u{1F33B}\u01EB\u1D1C\u1D0F\u1D1B\u1D07 \u1D0F\u0493 \u1D1B\u029C\u1D07 \u1D05\u1D00\u028F \u{1F33B}_*
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F
\u{1F4D6} *${result.quoteText}* \u{1F58B}\uFE0F

${wish} ${message.pushName.replace(/[\r\n]+/gm, "")}`;
      let data = {
        jid: message.jid,
        button: [
          {
            type: "list",
            params: {
              title: "WA-BOT Menu",
              sections
            }
          }
        ],
        header: {
          title: taxt,
          subtitle: taxt,
          hasMediaAttachment: true
        },
        footer: {
          text: `\u{1D5E0}\u{1D5E2}\u{1D5D7}\u{1D5D8} : ${type}
\u{1D5E9}\u{1D5D8}\u{1D5E5}\u{1D5E6}\u{1D5DC}\u{1D5E2}\u{1D5E1} : ${version}
${config.BOT_NAME}`
        },
        body: {
          text: ""
        }
      };
      if (link.endsWith(".mp4")) {
        data.header.videoMessage = url;
      } else {
        data.header.imageMessage = url;
      }
      return await message.sendMessage(message.jid, data, {}, "interactive");
    } else if (msg.value === "text") {
      const readMore = String.fromCharCode(8206).repeat(4001);
      let menu = `
\u256D\u2501\u2501\u2501\u3014 ${config.BOT_NAME} \u3015\u2501\u2501\u2501\u2508
            \u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
            \u2756 \u2502  *OWNER*: ${config.OWNER_NAME}
            \u2756 \u2502  *COMMANDS*: ${commands.filter((command) => command.pattern).length}
            \u2756 \u2502  *MODE*: ${mode ? "\u{1D5E3}\u{1D5E5}\u{1D5DC}\u{1D5E9}\u{1D5D4}\u{1D5E7}\u{1D5D8}" : "\u{1D5E3}\u{1D5E8}\u{1D5D5}\u{1D5DF}\u{1D5DC}\u{1D5D6}"}
            \u2756 \u2502  *PREFIX*: ${PREFIX}
            \u2756 \u2502  *VERSION*: ${version}
            \u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
            \u2570\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2508
 ${readMore}`;
      let cmnd = [];
      let cmd;
      let category = [];
      commands.forEach((command, num) => {
        if (command.pattern instanceof RegExp) {
          cmd = String(command.pattern).split(/\W+/)[1];
        }
        if (!command.dontAddCommandList && command.pattern) {
          let type2 = command.type ? command.type.toLowerCase() : "misc";
          cmnd.push({ cmd, type: type2 });
          if (!category.includes(type2)) category.push(type2);
        }
      });
      cmnd.sort();
      category.sort().forEach((cmmd) => {
        menu += `
 \u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2508\u2686`;
        menu += `
  \u2502 \u300C *${cmmd.toUpperCase()}* \u300D`;
        menu += `
 \u2570\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2508\u2686`;
        menu += `
 \u256D\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2508\u2686`;
        let comad = cmnd.filter(({ type: type2 }) => type2 == cmmd);
        comad.forEach(({ cmd: cmd2 }) => {
          menu += `
\u2746  ${cmd2.trim()}`;
        });
        menu += `
 \u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2508\u2686`;
      });
      menu += `

${config.BOT_NAME}`;
      let mediaUrl = config.MENU_URL;
      return await message.sendFromUrl(mediaUrl, { fileLength: "5555544444", gifPlayback: true, caption: menu }, { quoted: message });
    }
  }
}
async function sendSegMenu(message, match, type) {
  let msg = " *HERE ARE THE AVAILABLE COMMANDS:* \n\n";
  let no = 1;
  commands.map((command) => {
    if (command.type === type && !command.dontAddCommandList && command.pattern) {
      const commandName = command.pattern.toString().match(/(\W*)([A-Za-z0-9_ğüşiö ç]*)/)[2].trim();
      msg += `\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2508\u2686
`;
      msg += `\u2502  *${no++}. ${commandName}*
`;
      msg += `\u2502\u2500\u2556
`;
      msg += `\u2502 ${command.desc}
`;
      msg += `\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2508\u2686

`;
    }
  });
  await message.reply(msg.trim());
}
async function setMenuType(message, match) {
  const link = config.MENU_URL;
  const url = await message.ParseButtonMedia(link);
  const menuType = await getMenu();
  const menutyp = menuType.value;
  const menuvalue = menutyp === "text" ? "v1" : menutyp === "button" ? "v2" : "v3";
  if (!match) {
    const buttonArray = [
      { type: "reply", params: { display_text: "V1", id: `${PREFIX}setmenu v1` } },
      { type: "reply", params: { display_text: "V2", id: `${PREFIX}setmenu v2` } },
      { type: "reply", params: { display_text: "V3", id: `${PREFIX}setmenu v3` } }
    ];
    const footerText = `MENU TYPE: ${menuvalue}`;
    const data = {
      jid: message.jid,
      button: buttonArray,
      header: { title: "*WA-BOT Menu Control panel*", subtitle: "_WA-BOT Menu Control panel_", hasMediaAttachment: true },
      footer: { text: footerText },
      body: { text: "" }
    };
    if (link.endsWith(".mp4")) {
      data.header.videoMessage = url;
    } else {
      data.header.imageMessage = url;
    }
    return await message.sendMessage(message.jid, data, {}, "interactive");
  }
  if (match === "v1") {
    await setMenu({ value: "text" });
    return await message.send("> Menu type changed to v1");
  } else if (match === "v2") {
    await setMenu({ value: "button" });
    return await message.send("> Menu type changed to v2");
  } else if (match === "v3") {
    await setMenu({ value: "list" });
    return await message.send("> Menu type changed to v3");
  }
}
module.exports = { sendMenu, sendSegMenu, setMenuType };
