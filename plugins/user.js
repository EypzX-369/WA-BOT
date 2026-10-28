const { wabot, mode, isAdmin, formatTime, parsedJid } = require("../lib");
const { downloadContentFromMessage } = require("baileys");
const config = require("../config");
wabot(
  {
    pattern: "block ?(.*)",
    fromMe: true,
    desc: "Block a person",
    type: "user"
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply to a person or mention_");
      await message.block(jid);
      return await message.sendMessage(
        `_@${jid.split("@")[0]} Blocked_`,
        {
          mentions: [jid]
        }
      );
    } else {
      await message.block(message.jid);
      return await message.reply("_User blocked_");
    }
  }
);
wabot(
  {
    pattern: "unblock",
    fromMe: true,
    desc: "Unblock a person",
    type: "user"
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply to a person or mention_");
      await message.unblock(jid);
      return await message.sendMessage(
        message.jid,
        `_@${jid.split("@")[0]} unblocked_`,
        {
          mentions: [jid]
        }
      );
    } else {
      await message.unblock(message.jid);
      return await message.reply("_User unblocked_");
    }
  }
);
wabot(
  {
    pattern: "forward ?(.*)",
    fromMe: true,
    desc: "Forwards the replied Message",
    type: "user"
  },
  async (message, match) => {
    if (!message.quoted) return message.reply("Reply to something");
    let jids = parsedJid(match);
    for (let i of jids) {
      const eypz = {
        text: message.quoted ? message.quoted.message : "Replied message",
        contextInfo: {
          isForwarded: false
        }
      };
      await message.forwardMessage(i, message.reply_message.data, eypz);
    }
  }
);
wabot({
  pattern: "ping",
  fromMe: mode,
  desc: "Bot response in second.",
  type: "info"
}, async (message, match, client) => {
  let thumbnail = "https://i.im.ge/2024/05/23/KdOx1z.alexa.png";
  let vcardMessage = {
    key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
    message: {
      contactMessage: {
        displayName: config.BOT_NAME,
        vcard: `BEGIN:VCARD
VERSION:3.0
N:;a,;;;
FN:WA-BOT
item1.TEL;waid=${message.sender.split("@")[0]}:${message.sender.split("@")[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
      }
    }
  };
  const start = (/* @__PURE__ */ new Date()).getTime();
  let pingMsg = await client.sendMessage(message.jid, { text: "Pinging..." }, { quoted: vcardMessage });
  const end = (/* @__PURE__ */ new Date()).getTime();
  const ms = end - start;
  await client.relayMessage(
    message.jid,
    {
      protocolMessage: {
        key: pingMsg.key,
        type: 14,
        editedMessage: {
          conversation: `Pong ${ms}ms`
        }
      }
    },
    {}
  );
});
wabot({
  pattern: "jid ?(.*)",
  fromMe: mode,
  desc: "To get remoteJid",
  type: "info"
}, async (message) => {
  await message.send(message.mention[0] ? message.mention[0] : message.quoted ? message.quoted.sender : message.chat);
});
wabot({
  pattern: "runtime$",
  fromMe: mode,
  desc: "Get bots runtime",
  type: "info"
}, async (message, match, client) => {
  await message.reply(formatTime(process.uptime()));
});
wabot(
  {
    pattern: "save ?(.*)",
    fromMe: mode,
    desc: "forward replied msg to u",
    type: "misc"
  },
  async (message, match) => {
    if (!message.reply_message)
      return await message.send("*Reply to a message*");
    await message.forwardMessage(message.sender, message.quoted.data);
  }
);
wabot({
  pattern: "pinmsg$",
  fromMe: true,
  desc: "pin message",
  type: "user"
}, async (message, match, client) => {
  if (!message.quoted) {
    return await message.reply("_*Reply to any message.*_");
  }
  await message.client.sendMessage(
    message.jid,
    {
      pin: {
        type: 1,
        time: 2592e3,
        key: message.quoted.data.key
      }
    }
  );
});
wabot({
  pattern: "edit ?(.*)",
  fromMe: true,
  desc: "edit a text message",
  type: "user"
}, async (message, match, client) => {
  if (!message.quoted) {
    return await message.reply("_*Reply to any message.*_");
  }
  if (!match || match.trim() === "") {
    return await message.reply("_*Please provide the new text to update.*_ Example: .edit hello world!");
  }
  await client.sendMessage(message.jid, {
    text: match.trim(),
    edit: message.quoted.data.key
  });
});
wabot({
  pattern: "lastseen ?(.*)",
  fromMe: true,
  desc: "Update last seen privacy",
  type: "user"
}, async (message, match, client) => {
  const value = match.trim();
  if (!["all", "contacts", "contact_blacklist", "none"].includes(value)) {
    return await message.reply("Use: all | contacts | contact_blacklist | none");
  }
  await client.updateLastSeenPrivacy(value);
  await message.reply(`Last seen privacy updated to *${value}*.`);
});
wabot({
  pattern: "onlineprivacy ?(.*)",
  fromMe: true,
  desc: "Update online privacy",
  type: "user"
}, async (message, match, client) => {
  const value = match.trim();
  if (!["all", "match_last_seen"].includes(value)) {
    return await message.reply("Use: all | match_last_seen");
  }
  await client.updateOnlinePrivacy(value);
  await message.reply(`Online privacy updated to *${value}*.`);
});
wabot({
  pattern: "ppprivacy ?(.*)",
  fromMe: true,
  desc: "Update profile picture privacy",
  type: "user"
}, async (message, match, client) => {
  const value = match.trim();
  if (!["all", "contacts", "contact_blacklist", "none"].includes(value)) {
    return await message.reply("Use: all | contacts | contact_blacklist | none");
  }
  await client.updateProfilePicturePrivacy(value);
  await message.reply(`Profile picture privacy updated to *${value}*.`);
});
wabot({
  pattern: "statusprivacy ?(.*)",
  fromMe: true,
  desc: "Update status privacy",
  type: "user"
}, async (message, match, client) => {
  const value = match.trim();
  if (!["all", "contacts", "contact_blacklist", "none"].includes(value)) {
    return await message.reply("Use: all | contacts | contact_blacklist | none");
  }
  await client.updateStatusPrivacy(value);
  await message.reply(`Status privacy updated to *${value}*.`);
});
wabot({
  pattern: "readprivacy ?(.*)",
  fromMe: true,
  desc: "Update read receipts privacy",
  type: "user"
}, async (message, match, client) => {
  const value = match.trim();
  if (!["all", "none"].includes(value)) {
    return await message.reply("Use: all | none");
  }
  await client.updateReadReceiptsPrivacy(value);
  await message.reply(`Read receipts privacy updated to *${value}*.`);
});
wabot({
  pattern: "groupprivacy ?(.*)",
  fromMe: true,
  desc: "Update group add privacy",
  type: "user"
}, async (message, match, client) => {
  const value = match.trim();
  if (!["all", "contacts", "contact_blacklist"].includes(value)) {
    return await message.reply("Use: all | contacts | contact_blacklist");
  }
  await client.updateGroupsAddPrivacy(value);
  await message.reply(`_Group add privacy updated to *${value}*._`);
});
