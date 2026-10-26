const config = require("../config");
const { wabot, mode, toAudio, webp2mp4, addExif, AddMp3Meta, getBuffer } = require("../lib/");
const fs = require("fs");
const { Image } = require("node-webpmux");
wabot(
  {
    pattern: "exif$",
    fromMe: true,
    desc: "get sticker data",
    type: "converter"
  },
  async (message, match, client) => {
    if (!message.reply_message || !message.reply_message.sticker)
      return await message.reply("*_Reply to sticker_*");
    let img = new Image();
    await img.load(await message.quoted.download());
    const exif = JSON.parse(img.exif.slice(22).toString());
    const get = (val) => val && val !== "" ? val : "_not available_";
    const text = `*PACK-ID*           : ${get(exif["sticker-pack-id"])}
*PACK-NAME*         : ${get(exif["sticker-pack-name"])}
*PACK-PUBLISHER*    : ${get(exif["sticker-pack-publisher"])}
*EMOJIS*            : ${get(exif["emojis"])}
*ANDROID APP LINK*  : ${get(exif["android-app-store-link"])}
*IOS APP LINK*      : ${get(exif["ios-app-store-link"])}`;
    await message.reply(text);
  }
);
wabot(
  {
    pattern: "sticker$",
    fromMe: mode,
    desc: "Converts Photo/video/text to sticker",
    type: "converter"
  },
  async (message, match, client) => {
    if (!(message.reply_message.video || message.reply_message.image || message.reply_message.text))
      return await message.reply("Reply to photo/video/text");
    let buff = await message.quoted.download("buffer");
    await message.sendMessage(
      message.jid,
      buff,
      { packname: config.PACKNAME, author: config.AUTHOR },
      "sticker"
    );
  }
);
wabot({
  pattern: "take ?(.*)",
  fromMe: mode,
  desc: "Change audio title, album/sticker author, packname",
  type: "converter"
}, async (message, match) => {
  if (!message.reply_message || !(message.reply_message.video || message.reply_message.audio || message.reply_message.sticker)) {
    return await message.reply("*_Reply to sticker/audio/voice/video!_*");
  }
  if (message.reply_message.audio || message.reply_message.video) {
    let media = await toAudio(await message.quoted.download("buffer"));
    let matchParts = match ? match.match(/[^,;]+/g) : [];
    let configParts = config.AUDIO_DATA.match(/[^,;]+/g);
    let url = matchParts[2] ? matchParts[2] : configParts[2] ? configParts[2] : "";
    let cover = await getBuffer(url);
    let title = matchParts[0] ? matchParts[0] : configParts[0] ? configParts[0] : config.AUDIO_DATA;
    let artist = matchParts[1] ? matchParts[1] : configParts[1] ? configParts[1] : config.AUDIO_DATA;
    artist = [artist];
    const res = await AddMp3Meta(media, cover, {
      title,
      artist
    });
    return await message.client.sendMessage(message.jid, {
      audio: res,
      mimetype: "audio/mpeg"
    }, {
      quoted: message.data
    });
  } else if (message.reply_message.sticker) {
    let q = await message.reply_message.download("buffer");
    let exif;
    if (match !== "") {
      const splitMatch = match.split(/[,;]/);
      exif = {
        author: splitMatch[1] ? splitMatch[1] : "",
        packname: splitMatch[0] ? splitMatch[0] : "",
        categories: config.STICKER_PACKNAME.split(";")[2] || "",
        android: "t.me/eypzOfc",
        ios: "t.me/eypzOfc"
      };
    } else {
      exif = {
        author: config.STICKER_PACKNAME.split(/[,;]/)[1] || "",
        packname: config.STICKER_PACKNAME.split(/[,;]/)[0] || "",
        categories: config.STICKER_PACKNAME.split(";")[2] || "",
        android: "t.me/eypzOfc",
        ios: "t.me/eypzOfc"
      };
    }
    let stickerBuffer = await addExif(q, exif);
    return await message.client.sendMessage(message.jid, { sticker: fs.readFileSync(stickerBuffer) }, { quoted: message.data });
  }
});
