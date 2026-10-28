const axios = require("axios");
const yts = require("yt-search");
const config = require("../config");
const { wabot, mode, play, ytd, spotify } = require("../lib/");
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
async function downloadAndSendVideo(message, client, videoUrl) {
  try {
    const video = await ytd(videoUrl);
    if (!video?.url) return await message.reply("Failed to get video link.");
    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/)|v=)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    const jpegThumbnail = thumbnailUrl ? await axios.get(thumbnailUrl, { responseType: "arraybuffer" }).then((res) => res.data) : null;
    await client.sendMessage(message.jid, {
      video: { url: video.url },
      mimetype: "video/mp4",
      caption: `*${video.title}*`
    }, { quoted: quotedMessage });
    await client.sendMessage(message.jid, {
      document: { url: video.url },
      fileName: `${video.title}.mp4`,
      mimetype: "video/mp4",
      caption: `*${video.title}*`,
      jpegThumbnail
    }, { quoted: quotedMessage });
  } catch (err) {
    console.error("Video Error:", err);
    await message.reply("Failed to process video.\n" + err.message);
  }
}
async function downloadAndSendAudio(message, client, videoUrl) {
  try {
    const video = await ytd(videoUrl);
    if (!video?.url) return await message.reply("Failed to get audio link.");
    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/)|v=)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    const jpegThumbnail = thumbnailUrl ? await axios.get(thumbnailUrl, { responseType: "arraybuffer" }).then((res) => res.data) : null;
    const artist = config.BOT_NAME;
    await client.sendMessage(message.jid, {
      audio: { url: video.url },
      mimetype: "audio/mp4",
      ptt: false,
    }, { quoted: quotedMessage });
    await client.sendMessage(message.jid, {
      document: { url: video.url },
      fileName: `${video.title}.mp3`,
      mimetype: "audio/mp3",
      caption: `*${video.title}*`,
      jpegThumbnail
    }, { quoted: quotedMessage });
  } catch (err) {
    console.error("Audio Error:", err);
    await message.reply("Failed to process audio.\n" + err.message);
  }
}
wabot({
  pattern: "video ?(.*)",
  fromMe: mode,
  desc: "Download YouTube video (search)",
  type: "downloader"
}, async (message, match, client) => {
  if (!match) return await message.reply("Please provide a search query.");
  const { videos } = await yts(match);
  if (!videos.length) return await message.reply("No videos found.");
  const video = videos[0];
  await message.reply(`_*Downloading: ${video.title}...*_`);
  await downloadAndSendVideo(message, client, video.url);
});
wabot({
  pattern: "ytv ?(.*)",
  fromMe: mode,
  desc: "Download YouTube video by URL",
  type: "downloader"
}, async (message, match, client) => {
  if (!match) return await message.reply("Please provide a video URL.");
  await downloadAndSendVideo(message, client, match);
});
wabot({
  pattern: "song ?(.*)",
  fromMe: mode,
  desc: "Download YouTube audio (search)",
  type: "downloader"
}, async (message, match, client) => {
  if (!match) return await message.reply("Please provide a search query.");
  const { videos } = await yts(match);
  if (!videos.length) return await message.reply("No songs found.");
  const video = videos[0];
  await message.reply(`_*Downloading: ${video.title}...*_`);
  await downloadAndSendAudio(message, client, video.url);
});
wabot({
  pattern: "yta ?(.*)",
  fromMe: mode,
  desc: "Download YouTube audio by URL",
  type: "downloader"
}, async (message, match, client) => {
  if (!match) return await message.reply("Please provide a URL.");
  await downloadAndSendAudio(message, client, match);
});
wabot({
  pattern: "yts ?(.*)",
  fromMe: mode,
  desc: "Search YouTube videos",
  type: "search"
}, async (message, match, client) => {
  if (!match) return await message.reply("Please provide a search query.");
  const fek = await yts(match);
  if (!fek.videos.length) {
    return await client.sendMessage(message.jid, { text: "No videos found." }, { quoted: message.data });
  }
  let formattedMessage = "";
  fek.videos.slice(0, 10).forEach((video, i) => {
    formattedMessage += `*${i + 1}. ${video.title}*
Channel: ${video.author.name}
URL: ${video.url}

`;
  });
  const firstVideo = fek.videos[0];
  const thumbnailUrl = firstVideo.thumbnail;
  await client.sendMessage(message.jid, {
    text: formattedMessage
  }, { quoted: quotedMessage });
});
