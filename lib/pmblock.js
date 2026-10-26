const { getPmb, setPmb } = require("./database/pmb");
const { saveWarn, resetWarn } = require("./database/warn");
const { PREFIX } = require("./events");
const config = require("../config");
async function pmb(message, match) {
  const link = config.MENU_URL;
  const url = await message.ParseButtonMedia(link);
  const msg = await getPmb();
  if (!match) {
    const buttonArray = [
      { type: "reply", params: { display_text: "ON", id: `${PREFIX}pmblocker on` } },
      { type: "reply", params: { display_text: "OFF", id: `${PREFIX}pmblocker off` } },
      { type: "reply", params: { display_text: "GET", id: `${PREFIX}pmblocker get` } }
    ];
    const footerText = `PM BLOCKER: ${msg.isEnable ? "ON" : "OFF"}`;
    const data = {
      jid: message.jid,
      button: buttonArray,
      header: { title: "_Pm Block manager_", subtitle: "_Pm Block manager_", hasMediaAttachment: true },
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
  if (match === "get") {
    return await message.send(msg.value || "No pmblock reply set");
  } else if (match === "on") {
    await setPmb({ isEnable: true });
    return await message.send("_Pm Blocker activated_");
  } else if (match === "off") {
    await setPmb({ isEnable: false });
    return await message.send("_Pm Blocker deactivated_");
  } else {
    await setPmb({ value: match });
    return await message.reply("Successfully updated Pm blocker message: " + match);
  }
}
async function pmBlock(message) {
  if (message.isSudo || message.jid.includes("917902624272") || message.jid.includes("917994489493")) {
    return;
  }
  if (!message.isGroup) {
    var status = await getPmb();
    var enabled = status.isEnable;
    if (!enabled) {
      return;
    }
    var text = status ? status.value : null;
    await message.reply(text || "_personal message aren't allowed_");
    await message.block(message.jid);
  }
}
async function setWarn(message, match, WARN_COUNT) {
  const userId = message.mention?.[0] || message.reply_message?.sender || message.reply_message?.jid;
  if (!userId) return message.reply("_Mention or reply to someone_");
  let reason = message?.reply_message?.text || match || "";
  reason = reason.replace(/@(\d+)/g, "").trim();
  if (!reason || reason.length <= 1) reason = "Reason not Provided";
  const warnInfo = await saveWarn(userId, reason);
  let userWarnCount = warnInfo?.warnCount || 0;
  userWarnCount++;
  await message.client.sendMessage(message.jid, {
    text: `_User_ @${userId.split("@")[0]} _warned._
_Warn Count: ${userWarnCount}_
_Reason: ${reason}_`,
    mentions: [userId]
  });
  if (userWarnCount > WARN_COUNT) {
    await message.reply("Warn limit exceeded. Kicking user...");
    return await message.client.groupParticipantsUpdate(message.jid, [userId], "remove");
  }
}
async function removeWarn(message) {
  const userId = message.mention?.[0] || message.reply_message?.sender || message.reply_message?.jid;
  if (!userId) return message.reply("_Mention or reply to someone_");
  await resetWarn(userId);
  return await message.client.sendMessage(message.jid, { text: `_Warnings for @${userId.split("@")[0]} reset_`, mentions: [userId] });
}
module.exports = { pmBlock, pmb, setWarn, removeWarn };
