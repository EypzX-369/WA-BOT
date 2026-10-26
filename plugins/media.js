const config = require("../config");
const { wabot, mode, toAudio, blackVideo, getFfmpegBuffer, audioCut, videoTrim } = require("../lib/");
const fs = require("fs");
const FormData = require("form-data");
const crypto = require("crypto");
const mime = require("mime-types");
const FileType = require("file-type");
wabot(
  {
    pattern: "mediaInfo",
    fromMe: mode,
    desc: "Get media info",
    type: "info"
  },
  async (message, match, client) => {
    if (!message.quoted) return await message.reply("Reply to a media message.");
    const buffer = await message.quoted.download("buffer");
    const type = await FileType.fromBuffer(buffer);
    const mimetype = type?.mime || "unknown";
    const ext = type?.ext || "unknown";
    const size = (buffer.length / 1024).toFixed(2);
    let extra = "";
    if (message.quoted.mtype === "imageMessage") {
      const img = message.quoted.msg.imageMessage;
      extra = `Resolution: ${img.width}x${img.height}`;
    } else if (message.quoted.mtype === "videoMessage") {
      const vid = message.quoted.msg.videoMessage;
      extra = `Resolution: ${vid.width}x${vid.height}
Duration: ${vid.seconds || vid.duration || "unknown"} sec`;
    } else if (message.quoted.mtype === "audioMessage") {
      const aud = message.quoted.msg.audioMessage;
      extra = `Duration: ${aud.seconds || aud.duration || "unknown"} sec`;
    }
    const caption = `*Media Info:*
- Type: ${message.quoted.mtype}
- MIME: ${mimetype}
- Extension: .${ext}
- Size: ${size} KB
` + `${extra}`.trim();
    await message.reply(caption);
  }
);
wabot(
  {
    pattern: "photo",
    fromMe: mode,
    desc: "Converts sticker to photo",
    type: "media"
  },
  async (message, match, client) => {
    if (!message.reply_message || !message.reply_message.sticker) {
      return await message.reply("Reply to a sticker");
    }
    const buff = await message.quoted.download("buffer");
    return await message.sendMessage(message.jid, buff, {}, "image");
  }
);
wabot({
  pattern: "voice",
  fromMe: mode,
  desc: "converts video/mp3 to voice note",
  type: "converter"
}, async (message, match) => {
  try {
    let buff = await message.quoted.download("buffer");
    buff = await toAudio(buff, "mp3");
    return await message.sendMessage(
      message.jid,
      buff,
      { mimetype: "audio/mpeg", ptt: true },
      // ptt: true for voice note
      "audio"
    );
  } catch (error) {
    console.error("Error:", error);
    return await message.sendMessage("An error occurred while processing your request.");
  }
});
wabot({
  pattern: "toDoc",
  fromMe: mode,
  desc: "convert video to ptv",
  type: "converter"
}, async (message, client) => {
  if (!message.reply_message) {
    return await message.reply("*Reply to any media!*");
  }
  const mediaBuffer = await message.quoted.download("buffer");
  let mimeType = message.quoted.msg?.[message.quoted.mtype]?.mimetype;
  if (!mimeType) {
    const type = await FileType.fileTypeFromBuffer(mediaBuffer);
    mimeType = type?.mime || "application/octet-stream";
  }
  let extension = mime.extension(mimeType) || "bin";
  const random = crypto.randomBytes(3).toString("hex");
  const filename = `wabot-${random}.${extension}`;
  fs.writeFileSync(filename, mediaBuffer);
  await message.client.sendMessage(message.jid, {
    document: fs.readFileSync(filename),
    fileName: filename,
    mimetype: mimeType
  }, { quoted: message.data });
  fs.unlinkSync(filename);
});
wabot({
  pattern: "toPtv",
  fromMe: mode,
  desc: "convert video to ptv",
  type: "converter"
}, async (message, client) => {
  if (!message.reply_message || !message.reply_message.video) {
    return await message.reply("*Reply to an video!*");
  }
  const mediaBuffer = await message.quoted.download("buffer");
  const ext = "mp4";
  const filename = "temp.mp4";
  fs.writeFileSync(filename, mediaBuffer);
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", fs.createReadStream(filename), {
    filename,
    contentType: "video/mp4"
  });
  await message.client.sendMessage(message.jid, {
    video: fs.readFileSync(filename),
    mimetype: "video/mp4",
    ptv: true,
    gifPlayback: true
  }, { quoted: message.data });
  fs.unlinkSync(filename);
});
wabot({
  pattern: "toGif",
  fromMe: mode,
  desc: "convert video to ptv",
  type: "converter"
}, async (message, client) => {
  if (!message.reply_message || !message.reply_message.video) {
    return await message.reply("*Reply to an video!*");
  }
  const mediaBuffer = await message.quoted.download("buffer");
  const ext = "mp4";
  const filename = "temp.mp4";
  fs.writeFileSync(filename, mediaBuffer);
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", fs.createReadStream(filename), {
    filename,
    contentType: "video/mp4"
  });
  await message.client.sendMessage(message.jid, {
    video: fs.readFileSync(filename),
    mimetype: "video/mp4",
    gifPlayback: true
  }, { quoted: message.data });
  fs.unlinkSync(filename);
});
wabot({
  pattern: "mp3",
  fromMe: mode,
  desc: "converts video/voice to mp3",
  type: "converter"
}, async (message, match) => {
  try {
    let buff = await message.quoted.download("buffer");
    console.log(typeof buff);
    buff = await toAudio(buff, "mp3");
    console.log(typeof buff);
    return await message.sendMessage(
      message.jid,
      buff,
      { mimetype: "audio/mpeg" },
      "audio"
    );
  } catch (error) {
    console.error("Error:", error);
    return await message.sendMessage("An error occurred while processing your request.");
  }
});
wabot(
  { pattern: "black", fromMe: mode, desc: "Audio to black screen video.", type: "converter" },
  async (message, match) => {
    if (!message.reply_message || !message.reply_message.audio) {
      return await message.reply("*Reply to an audio!*");
    }
    try {
      const audioPath = await message.quoted.download();
      const videoBuffer = await blackVideo(audioPath);
      await message.sendFile(videoBuffer, { quoted: message.data });
    } catch (error) {
      console.error("Error processing black video:", error);
      await message.reply(`Failed to create black video. Error: ${error.message}`);
    }
  }
);
wabot({ pattern: "avec", fromMe: mode, desc: "audio editor", type: "media" }, async (message, match) => {
  if (!message.reply_message || !message.reply_message.audio)
    return await message.send("*Reply to a audio.*");
  return await message.sendFile(
    await getFfmpegBuffer(
      await message.reply_message.download(),
      "avec.mp4",
      "avec"
    ),
    { quoted: message.data }
  );
});
wabot({ pattern: "pitch", fromMe: mode, desc: "audio editor", type: "media" }, async (message, match) => {
  if (!message.reply_message || !message.reply_message.audio)
    return await message.send("*Reply to a audio.*");
  return await message.sendMsg(
    await getFfmpegBuffer(
      await message.reply_message.download(),
      "lowmp3.mp3",
      "lowmp3"
    ),
    { filename: "lowmp3.mp3", mimetype: "audio/mpeg", quoted: message.data },
    "audio"
  );
});
wabot({ pattern: "low", fromMe: mode, desc: "audio editor", type: "media" }, async (message, match) => {
  if (!message.reply_message || !message.reply_message.audio)
    return await message.send("*Reply to a audio.*");
  return await message.sendMsg(
    await getFfmpegBuffer(
      await message.reply_message.download(),
      "lowmp3.mp3",
      "pitch"
    ),
    { filename: "lowmp3.mp3", mimetype: "audio/mpeg", quoted: message.data },
    "audio"
  );
});
wabot({ pattern: "vector", fromMe: mode, desc: "video editor", type: "media" }, async (message, match) => {
  if (!message.reply_message || !message.reply_message.audio)
    return await message.send("*Reply to a audio.*");
  return await message.sendMsg(
    await getFfmpegBuffer(
      await message.reply_message.download(),
      "vector.mp4",
      "vector"
    ),
    { mimetype: "video/mp4", quoted: message.data },
    "video"
  );
});
wabot(
  { pattern: "compress ?(.*)", fromMe: mode, desc: "video compressor", type: "media" },
  async (message, match) => {
    if (!message.reply_message || !message.reply_message.video)
      return await message.send("*Reply to a video*");
    return await message.sendMsg(
      await getFfmpegBuffer(
        await message.reply_message.download(),
        "ocompress.mp4",
        "compress"
      ),
      { quoted: message.data },
      "video"
    );
  }
);
wabot(
  { pattern: "bass ?(.*)", fromMe: mode, desc: "audio editor", type: "media" },
  async (message, match) => {
    if (!message.reply_message || !message.reply_message.audio)
      return await message.send("*Reply to a audio.*");
    return await message.sendMsg(
      await getFfmpegBuffer(
        await message.reply_message.download(),
        "bass.mp3",
        `bass,${match == "" ? 10 : match}`
      ),
      { mimetype: "audio/mpeg", quoted: message.data },
      "audio"
    );
  }
);
wabot(
  { pattern: "treble ?(.*)", fromMe: mode, desc: "audio editor", type: "media" },
  async (message, match) => {
    if (!message.reply_message || !message.reply_message.audio)
      return await message.send("*Reply to a audio.*");
    return await message.sendMsg(
      await getFfmpegBuffer(
        await message.reply_message.download(),
        "treble.mp3",
        `treble,${match == "" ? 10 : match}`
      ),
      { mimetype: "audio/mpeg", quoted: message.data },
      "audio"
    );
  }
);
wabot({ pattern: "histo", fromMe: mode, desc: "audio editor", type: "media" }, async (message, match) => {
  if (!message.reply_message || !message.reply_message.audio)
    return await message.send("*Reply to a audio.*");
  return await message.sendMsg(
    await getFfmpegBuffer(
      await message.reply_message.download(),
      "histo.mp4",
      "histo"
    ),
    { mimetype: "video/mp4", quoted: message.data },
    "video"
  );
});
wabot({ pattern: "reverse", fromMe: mode, desc: "reverse video or audio", type: "media" }, async (message, match) => {
  if (!message.reply_message.audio && !message.reply_message.video && !message.reply_message)
    return await message.send("*Reply to video/audio*");
  const location = await message.reply_message.download();
  if (message.reply_message.video == true) {
    return await message.sendMsg(
      await getFfmpegBuffer(location, "revered.mp4", "videor"),
      { mimetype: "video/mp4", quoted: message.data },
      "video"
    );
  } else if (message.reply_message.audio == true) {
    return await message.sendMsg(
      await getFfmpegBuffer(location, "revered.mp3", "audior"),
      {
        filename: "revered.mp3",
        mimetype: "audio/mpeg",
        ptt: false,
        quoted: message.data
      },
      "audio"
    );
  }
});
wabot({ pattern: "cut ?(.*)", fromMe: mode, desc: "cut audio", type: "media" }, async (message, match) => {
  if (!message.reply_message || !message.reply_message.audio)
    return await message.send("*Reply to a audio.*");
  if (!match) return await message.send("*Example : cut 0;30*");
  const [start, duration] = match.split(";");
  if (!start || !duration || isNaN(start) || isNaN(duration))
    return await message.send("*Example : cut 10;30*");
  return await message.sendMsg(
    await audioCut(
      await message.reply_message.download(),
      start.trim(),
      duration.trim()
    ),
    {
      filename: "cut.mp3",
      mimetype: "audio/mpeg",
      ptt: false,
      quoted: message.data
    },
    "audio"
  );
});
wabot({ pattern: "trim ?(.*)", fromMe: mode, desc: "trim videos", type: "media" }, async (message, match) => {
  if (!message.reply_message || !message.reply_message.video)
    return await message.send("*Reply to a video*");
  if (!match) return await message.reply("*Example : trim 10;30*");
  const [start, duration] = match.split(";");
  if (!start || !duration || isNaN(start) || isNaN(duration))
    return await message.reply("*Example : trim 60;30*");
  return await message.sendMsg(
    await videoTrim(
      await message.reply_message.download(),
      start,
      duration
    ),
    { mimetype: "video/mp4", quoted: message.data },
    "video"
  );
});
