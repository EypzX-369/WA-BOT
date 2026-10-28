const { wabot, mode, blackVideo, parsedUrl } = require("../lib/");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const crypto = require("crypto");
wabot({
  pattern: "url ?(.*)",
  fromMe: mode,
  desc: "Upload files to Catbox.moe (fallback to personal CDN)",
  type: "generator"
}, async (m, text) => {
  if (!m.quoted || !(m.quoted.image || m.quoted.video || m.quoted.audio)) {
    return m.reply("Please reply to an image, video, or audio.");
  }
  try {
    let mediaBuffer;
    let ext;
    let filename;
    let formData = new FormData();
    if (m.quoted.audio) {
      const audioPath = await m.quoted.download();
      mediaBuffer = await blackVideo(audioPath);
      fs.unlinkSync(audioPath);
      ext = "mp4";
      filename = "temp.mp4";
      fs.writeFileSync(filename, mediaBuffer);
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", fs.createReadStream(filename), {
        filename,
        contentType: "video/mp4"
      });
    } else {
      mediaBuffer = await m.quoted.download("buffer");
      if (m.quoted.image) {
        ext = "png";
        filename = "upload.png";
        formData.append("fileToUpload", mediaBuffer, {
          filename,
          contentType: "image/png"
        });
      } else {
        ext = "mp4";
        filename = "video.mp4";
        formData.append("fileToUpload", mediaBuffer, {
          filename,
          contentType: "video/mp4"
        });
      }
      formData.append("reqtype", "fileupload");
    }
    try {
      const catboxRes = await axios.post("https://catbox.moe/user/api.php", formData, {
        headers: formData.getHeaders()
      });
      const fileUrl = catboxRes.data.trim();
      if (!fileUrl.startsWith("http")) {
        throw new Error("Catbox error: " + fileUrl);
      }
      await m.reply(fileUrl);
    } catch (catboxErr) {
      const hash = crypto.createHash("sha256").update(mediaBuffer).digest("hex");
      const fallbackFilename = `${hash}.${ext}`;
      const base64Content = mediaBuffer.toString("base64");
      const res = await axios.post("https://cdn.eypz.ct.ws/upload", {
        base64: base64Content,
        ext,
        filename: fallbackFilename
      });
      if (res.data?.url) {
        await m.reply(res.data.url);
      } else {
        await m.reply("Fallback upload failed: No URL returned.");
      }
    }
    if (fs.existsSync("temp.mp4")) fs.unlinkSync("temp.mp4");
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || "Upload failed.";
    await m.reply(`Upload failed`);
  }
});
wabot(
  {
    pattern: "upload ?(.*)",
    fromMe: mode,
    desc: "send files from multiple URLs",
    type: "misc"
  },
  async (message, match) => {
    match = match || message.quoted?.text;
    if (!match) {
      return await message.send("_reply to a url_");
    }
    await message.sendFromUrl(parsedUrl(match));
  }
);
