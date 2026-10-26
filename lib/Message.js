const {
  getContentType,
  jidNormalizedUser,
  generateWAMessageFromContent,
  generateWAMessage,
  generateForwardMessageContent,
  downloadMediaMessage,
  prepareWAMessageMedia
} = require("@whiskeysockets/baileys");
const { prepareMessage } = require("./sendMessage");
const Jimp = new Proxy({}, { get: (_, k) => require("jimp")[k] });
const { decodeJid } = require("./functions");
const Base = require("./Base");
const ReplyMessage = require("./ReplyMessage");
const config = require("../config");
const fileType = require("file-type");
const axios = require("axios");
const { getFile, GetBuffer } = require("./utils");
const { getBuffer } = require("./functions");
const { serialize } = require("./serialize");
const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
  writeExifWebp
} = require("./sticker");
const { createInteractiveMessage, Interactive } = require("./functions");
class Message extends Base {
  constructor(client2, data) {
    super(client2);
    if (data) {
      this.patch(data);
    }
  }
  patch(data) {
    this.id = data.key?.id;
    this.jid = this.chat = data.key?.remoteJid;
    this.fromMe = data.key?.fromMe;
    this.user = decodeJid(this.client.user.id);
    this.sender = jidNormalizedUser(
      this.fromMe && this.client.user.id || this.participant || data.key.participant || this.chat || ""
    );
    this.pushName = data.pushName || this.client.user.name || "";
    this.message = this.text = data.message?.extendedTextMessage?.text || data.message?.imageMessage?.caption || data.message?.videoMessage?.caption || data.message?.listResponseMessage?.singleSelectReply?.selectedRowId || data.message?.buttonsResponseMessage?.selectedButtonId || data.message?.templateButtonReplyMessage?.selectedId || data.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || data.message?.conversation || JSON.parse(data.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || "{}")?.id || null;
    this.data = data;
    this.type = getContentType(data.message);
    this.msg = data.message[this.type];
    this.reply_message = this.quoted = this.msg?.contextInfo?.quotedMessage ? new ReplyMessage(this.client, {
      chat: this.chat,
      msg: this.msg,
      ...this.msg.contextInfo
    }) : false;
    this.mention = this.msg?.contextInfo?.mentionedJid || false;
    this.isGroup = this.chat.endsWith("@g.us");
    this.isPm = this.chat.endsWith("@s.whatsapp.net");
    this.isBot = this.id.startsWith("BAE5") && this.id.length === 16;
    const sudo = config.SUDO ? config.SUDO.split(",") || [config.SUDO, "0"] : [];
    this.isSudo = [jidNormalizedUser(this.client.user.id), ...sudo].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(this.sender);
    const contextInfo = data.message.extendedTextMessage?.contextInfo;
    this.mention = contextInfo?.mentionedJid || false;
    return super.patch(data);
  }
  async sendMsg(content, options = {}, type = "text") {
    content = { [type]: content };
    await prepareMessage(this.jid, {
      ...content,
      ...options
    }, options, type, this.client);
  }
  async reply(text, options) {
    const message = await this.client.sendMessage(
      this.jid,
      { text },
      { quoted: this.data, ...options }
    );
    return new Message(this.client, message);
  }
  async isAdmin(jid2) {
    const groupMetadata = await this.client.groupMetadata(this.jid);
    const groupAdmins = groupMetadata.participants.filter((participant) => participant.admin !== null).map((participant) => participant.id);
    return groupAdmins.includes(decodeJid(jid2));
  }
  async send(content, opt = { packname: "mask ser", author: "Mask ser" }, type = "text") {
    switch (type.toLowerCase()) {
      case "text":
        {
          return this.client.sendMessage(
            this.jid,
            {
              text: content,
              ...opt
            },
            { ...opt }
          );
        }
        break;
      case "image":
        {
          if (Buffer.isBuffer(content)) {
            return this.client.sendMessage(
              this.jid,
              { image: content, ...opt },
              { ...opt }
            );
          } else if (isUrl(content)) {
            return this.client.sendMessage(
              this.jid,
              { image: { url: content }, ...opt },
              { ...opt }
            );
          }
        }
        break;
      case "video": {
        if (Buffer.isBuffer(content)) {
          return this.client.sendMessage(
            jid,
            { video: content, ...opt },
            { ...opt }
          );
        } else if (isUrl(content)) {
          return this.client.sendMessage(
            this.jid,
            { video: { url: content }, ...opt },
            { ...opt }
          );
        }
      }
      case "audio":
        {
          if (Buffer.isBuffer(content)) {
            return this.client.sendMessage(
              this.jid,
              { audio: content, ...opt },
              { ...opt }
            );
          } else if (isUrl(content)) {
            return this.client.sendMessage(
              this.jid,
              { audio: { url: content }, ...opt },
              { ...opt }
            );
          }
        }
        break;
      case "template":
        let optional = await generateWAMessage(jid, content, opt);
        let message = {
          viewOnceMessage: {
            message: {
              ...optional.message
            }
          }
        };
        await this.client.relayMessage(this.jid, message, {
          messageId: optional.key.id
        });
        break;
      case "interactive":
        const genMessage = createInteractiveMessage(content);
        await this.client.relayMessage(this.jid, genMessage.message, {
          messageId: genMessage.key.id
        });
        break;
        break;
      case "quotedButton":
        const msgg = Interactive(content);
        await this.client.relayMessage(this.jid, msgg.message, {
          messageId: genMessage.key.id
        });
        break;
      case "sticker":
        {
          let { data, mime } = await getFile(content);
          if (mime == "image/webp") {
            let buff = await writeExifWebp(data, opt);
            await this.client.sendMessage(
              this.jid,
              { sticker: { url: buff }, ...opt },
              opt
            );
          } else {
            mime = await mime.split("/")[0];
            if (mime === "video") {
              await this.client.sendVideoAsSticker(this.jid, content, opt);
            } else if (mime === "image") {
              await this.client.sendImageAsSticker(this.jid, content, opt);
            }
          }
        }
        break;
    }
  }
  async sendFile(content, options = {}) {
    const { data } = await getFile(content);
    const type = await fileType.fromBuffer(data);
    return this.client.sendMessage(
      this.jid,
      { [type.mime.split("/")[0]]: data },
      options
    );
  }
  async delete() {
    return await this.client.sendMessage(this.jid, {
      delete: { ...this.data.key, participant: this.sender }
    });
  }
  async edit(conversation) {
    return await this.client.relayMessage(
      this.jid,
      {
        protocolMessage: {
          key: this.data.key,
          type: 14,
          editedMessage: { conversation }
        }
      },
      {}
    );
  }
  async forSend(url) {
    let options = { quoted: this.quoted };
    let { buffer, mimetype, name, error, size } = await GetBuffer(url);
    if (!buffer && error) {
      return await this.sendMsg(error, options);
    }
    if (!buffer || size > 99) {
      return await this.sendMsg("Size is " + size, options);
    }
    if (!buffer) {
      return;
    }
    let type = mimetype.split("/")[0];
    switch (mimetype.split("/")[1]) {
      case "gif":
        type = "video";
        break;
      case "webp":
        type = "sticker";
        break;
    }
    switch (type) {
      case "sticker":
      case "image":
      case "video":
      case "audio":
        options.fileName = name;
        options.mimetype = mimetype;
        break;
      case "gif":
        options.video = buffer;
        options.fileName = name;
        options.gifPlayback = true;
        break;
      default:
        options.mimetype = mimetype;
        options.fileName = name;
        type = "document";
        break;
    }
    if (buffer) {
      return await this.sendMsg(buffer, options, type);
    }
  }
  async sendFromLink(urlArray) {
    if (Array.isArray(urlArray)) {
      for (const url of urlArray) {
        await this.forSend(url);
      }
    } else {
      await this.forSend(urlArray);
    }
  }
  async sendFromUrl(url, options = {}) {
    let mime = "";
    let res = await axios.head(url);
    mime = res.headers["content-type"];
    if (mime.split("/")[1] === "gif") {
      return this.client.sendMessage(this.jid, { video: { url }, gifPlayback: true, ...options }, { quoted: this.data });
    }
    let type = mime.split("/")[0] + "Message";
    if (mime === "application/pdf") {
      return this.client.sendMessage(this.jid, { document: { url }, mimetype: "application/pdf", ...options }, { quoted: this.data });
    }
    if (mime.split("/")[0] === "image") {
      return this.client.sendMessage(this.jid, { image: { url }, ...options }, { quoted: this.data });
    }
    if (mime.split("/")[0] === "video") {
      return this.client.sendMessage(this.jid, { video: { url }, ...options }, { quoted: this.data });
    }
    if (mime.split("/")[0] === "audio") {
      return this.client.sendMessage(this.jid, { audio: { url }, mimetype: "audio/mpeg", ...options }, { quoted: this.data });
    }
  }
  async sendMessage(jid2, content, opt = { packname: "mask ser", author: "Mask ser" }, type = "text") {
    switch (type.toLowerCase()) {
      case "text":
        {
          return this.client.sendMessage(
            jid2,
            {
              text: content,
              ...opt
            },
            { ...opt }
          );
        }
        break;
      case "image":
        {
          if (Buffer.isBuffer(content)) {
            return this.client.sendMessage(
              jid2,
              { image: content, ...opt },
              { ...opt }
            );
          } else if (isUrl(content)) {
            return this.client.sendMessage(
              jid2,
              { image: { url: content }, ...opt },
              { ...opt }
            );
          }
        }
        break;
      case "video": {
        if (Buffer.isBuffer(content)) {
          return this.client.sendMessage(
            jid2,
            { video: content, ...opt },
            { ...opt }
          );
        } else if (isUrl(content)) {
          return this.client.sendMessage(
            jid2,
            { video: { url: content }, ...opt },
            { ...opt }
          );
        }
      }
      case "audio":
        {
          if (Buffer.isBuffer(content)) {
            return this.client.sendMessage(
              jid2,
              { audio: content, ...opt },
              { ...opt }
            );
          } else if (isUrl(content)) {
            return this.client.sendMessage(
              jid2,
              { audio: { url: content }, ...opt },
              { ...opt }
            );
          }
        }
        break;
      case "template":
        let optional = await generateWAMessage(jid2, content, opt);
        let message = {
          viewOnceMessage: {
            message: {
              ...optional.message
            }
          }
        };
        await this.client.relayMessage(jid2, message, {
          messageId: optional.key.id
        });
        break;
      case "interactive":
        const genMessage = createInteractiveMessage(content);
        await this.client.relayMessage(jid2, genMessage.message, {
          messageId: genMessage.key.id
        });
        break;
      case "sticker":
        {
          let { data, mime } = await getFile(content);
          if (mime == "image/webp") {
            let buff = await writeExifWebp(data, opt);
            await this.client.sendMessage(
              jid2,
              { sticker: { url: buff }, ...opt },
              opt
            );
          } else {
            mime = await mime.split("/")[0];
            if (mime === "video") {
              await this.client.sendVideoAsSticker(this.jid, content, opt);
            } else if (mime === "image") {
              await this.client.sendImageAsSticker(this.jid, content, opt);
            }
          }
        }
        break;
    }
  }
  async forward(jid2, message, options = {}) {
    const m = generateWAMessageFromContent(jid2, message, {
      ...options,
      userJid: this.client.user.id
    });
    await this.client.relayMessage(jid2, m.message, {
      messageId: m.key.id,
      ...options
    });
    return m;
  }
  async forwardMessage(targetJid, message, options = {}) {
    let contentType;
    let content = message;
    if (options.readViewOnce) {
      content = content && content.ephemeralMessage && content.ephemeralMessage.message ? content.ephemeralMessage.message : content || void 0;
      const viewOnceKey = Object.keys(content)[0];
      delete (content && content.ignore ? content.ignore : content || void 0);
      delete content.viewOnceMessage.message[viewOnceKey].viewOnce;
      content = { ...content.viewOnceMessage.message };
    }
    if (options.mentions) {
      content[contentType].contextInfo.mentionedJid = options?.mentions;
    }
    const forwardContent = generateForwardMessageContent(content, false);
    contentType = getContentType(forwardContent);
    if (options.ptt) forwardContent[contentType].ptt = options?.ptt;
    if (options.audiowave) forwardContent[contentType].waveform = options?.audiowave;
    if (options.seconds) forwardContent[contentType].seconds = options?.seconds;
    if (options.fileLength) forwardContent[contentType].fileLength = options?.fileLength;
    if (options.caption) forwardContent[contentType].caption = options?.caption;
    if (options.contextInfo) forwardContent[contentType].contextInfo = options?.contextInfo;
    if (options.mentions) forwardContent[contentType].contextInfo.mentionedJid = options.mentions;
    let contextInfo = {};
    if (contentType != "conversation") {
      contextInfo = message.message[contentType]?.contextInfo;
    }
    forwardContent[contentType].contextInfo = { ...contextInfo, ...forwardContent[contentType]?.contextInfo };
    const waMessage = generateWAMessageFromContent(targetJid, forwardContent, options ? { ...forwardContent[contentType], ...options, ...options?.contextInfo ? { "contextInfo": { ...forwardContent[contentType].contextInfo, ...options?.contextInfo } } : {} } : {});
    return await this.client.relayMessage(targetJid, waMessage.message, { "messageId": waMessage.key.id });
  }
  async ParseButtonMedia(url) {
    if (url.endsWith(".mp4")) {
      let video = await prepareWAMessageMedia({ video: { url } }, { upload: this.client.waUploadToServer });
      return video.videoMessage || null;
    } else if (url.endsWith(".png") || url.endsWith(".jpeg")) {
      let image = await prepareWAMessageMedia({ image: { url } }, { upload: this.client.waUploadToServer });
      return image.imageMessage || null;
    } else {
      return null;
    }
  }
  async PresenceUpdate(status) {
    await sock.sendPresenceUpdate(status, this.jid);
  }
  async delete(key) {
    await this.client.sendMessage(this.jid, { delete: key });
  }
  async updateName(name) {
    await this.client.updateProfileName(name);
  }
  async getPP(jid2) {
    return await this.client.profilePictureUrl(jid2, "image");
  }
  async setPP(jid2, pp) {
    if (Buffer.isBuffer(pp)) {
      await this.client.updateProfilePicture(jid2, pp);
    } else {
      await this.client.updateProfilePicture(jid2, { url: pp });
    }
  }
  /**
   *
   * @param {string} jid
   * @returns
   */
  async block(jid2) {
    await this.client.updateBlockStatus(jid2, "block");
  }
  /**
   *
   * @param {string} jid
   * @returns
   */
  async unblock(jid2) {
    await this.client.updateBlockStatus(jid2, "unblock");
  }
  /**
   *
   * @param {array} jid
   * @returns
   */
  async add(jid2) {
    return await this.client.groupParticipantsUpdate(this.jid, jid2, "add");
  }
  /**
   *
   * @param {array} jid
   * @returns
   */
  async kick(jid2) {
    return await this.client.groupParticipantsUpdate(this.jid, jid2, "remove");
  }
  /**
   *
   * @param {array} jid
   * @returns
   */
  async promote(jid2) {
    return await this.client.groupParticipantsUpdate(this.jid, jid2, "promote");
  }
  /**
   *
   * @param {array} jid
   * @returns
   */
  async demote(jid2) {
    return await this.client.groupParticipantsUpdate(this.jid, jid2, "demote");
  }
  async mute(jid2) {
    return await this.client.groupSettingUpdate(jid2, "announcement");
  }
  async unmute(jid2) {
    return await this.client.groupSettingUpdate(jid2, "not_announcement");
  }
  async revoke(inviteCode) {
    await this.client.groupRevokeInvite(inviteCode);
  }
  async accept(inviteCode) {
    await this.client.groupAcceptInvite(inviteCode);
  }
  async groupSettingsChange(isAnnouncement, groupJid) {
    await this.client.groupSettingUpdate(groupJid, isAnnouncement ? "announcement" : "not_announcement");
  }
  async left(groupJid) {
    this.client.groupLeave(groupJid);
  }
  async invite(groupJid) {
    return "https://chat.whatsapp.com/" + await this.client.groupInviteCode(groupJid);
  }
  async groupMetadata(groupJid) {
    const { participants } = await this.client.groupMetadata(groupJid);
    return participants;
  }
  async clearChat(chatId) {
    await this.client.chatModify(
      {
        delete: true,
        lastMessages: [{ key: this.data.key, messageTimestamp: this.data.messageTimestamp }]
      },
      chatId
    );
  }
  async react(text) {
    if (!text) return;
    const reactionMessage = {
      react: {
        text,
        key: this.quoted.data.key
      }
    };
    return await this.client.sendMessage(this.jid, reactionMessage);
  }
  async addParticipants(participantString, groupContext) {
    let groupParticipants = (await groupContext.client.groupMetadata(groupContext.jid)).participants.map((participant) => participant.id);
    let newParticipants = (await Promise.all(participantString.split(",").map((idString) => idString.replace(/[^0-9]/g, "")).filter((id) => id.length > 4 && id.length < 20 && !groupParticipants.includes(id + "@s.whatsapp.net")).map(async (id) => [id, await groupContext.client.onWhatsApp(id + "@s.whatsapp.net")]))).filter((pair) => pair[0][0]?.["exists"]).map((pair) => pair[0] + "@c.us");
    const response = await groupContext.client.query({
      "tag": "iq",
      "attrs": {
        "type": "set",
        "xmlns": "w:g2",
        "to": groupContext.jid
      },
      "content": newParticipants.map((id) => ({
        "tag": "add",
        "attrs": {},
        "content": [{
          "tag": "participant",
          "attrs": {
            "jid": id
          }
        }]
      }))
    });
    const groupProfilePicUrl = await groupContext.client.profilePictureUrl(groupContext.jid)["catch"]((error) => null);
    const thumbnailBuffer = groupProfilePicUrl ? await getBuffer(groupProfilePicUrl) : Buffer.alloc(0);
    const addRequestObjects = response.map((addResponse) => client.Message.fromObject({
      "add_request": client.Message.AddRequest.fromObject({
        "code": addResponse.attrs.code,
        "expiration": addResponse.attrs.expiration
      })
    }));
    for (const addRequest of addRequestObjects.filter((addRequest2) => addRequest2.attrs.error == 403)) {
      const participantId = addRequest.attrs.jid;
      const inviteObject = client.Message.fromObject({
        "groupInviteMessage": client.Message.GroupInviteMessage.fromObject({
          "inviteCode": addRequest.attrs.code,
          "inviteExpiration": addRequest.attrs.expiration,
          "groupJid": groupContext.jid,
          "groupName": (await groupContext.client.groupMetadata(groupContext.jid)).subject,
          "jpegThumbnail": thumbnailBuffer,
          "caption": "Invitation to join WhatsApp group"
        })
      });
      await groupContext.send("_Can't add, Invite sent!_");
      return await inviteToGroup(groupContext, participantId, addRequest.attrs.code, addRequest.attrs.expiration, "Invitation to join WhatsApp group", thumbnailBuffer);
    }
  }
}
module.exports = Message;
