const axios = require("axios");
const config = require("../config");

const API_URL = "https://audx.eypz.in/";
const API_KEY = "";
const { wabot, mode } = require("../lib/");

wabot({
  pattern: "spotify ?(.*)",
  fromMe: mode,
  desc: "Download a Spotify song by URL",
  type: "downloader"
}, async (message, match, client) => {
  const url = (match || message.reply_message?.text || "").trim();
  if (!/open\.spotify\.com\/(intl-[a-z]+\/)?track\//i.test(url)) {
    return await message.reply("Send a Spotify track URL.\nExample: .spotify https://open.spotify.com/track/...");
  }
  try {
    await message.reply("_*Downloading...*_");
    const { data } = await axios.post(
      `${API_URL.replace(/\/$/, "")}/api/spotify`,
      { url },
      { headers: { "x-api-key": API_KEY, "Content-Type": "application/json" }, params: API_KEY ? { apikey: API_KEY } : {}, timeout: 120000 }
    );
    if (!data?.status || !data.result?.audio) return await message.reply(data?.message || "Song not found.");
    const r = data.result;
    const thumb = r.thumb ? await axios.get(r.thumb, { responseType: "arraybuffer" }).then((x) => x.data).catch(() => null) : null;
    const quotedMessage = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "0@s.whatsapp.net"
    },
    message: {
      productMessage: {
        product: {
          title:  r.title,
          description: "",
          priceAmount1000: 77777777777e-3,
          currencyCode: "AED",
          retailerId: "",
          url: "myr.in",
          productImageCount: 0
        },
        businessOwnerJid: "7994489493@s.whatsapp.net"
      }
    },
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true
    }
  };
    await client.sendMessage(message.jid, {
      audio: { url: r.audio },
      mimetype: "audio/mpeg",
      fileName: `${r.title || "song"}.mp3`,
      
    }, { quoted: quotedMessage });
  } catch (e) {
    await message.reply("Failed: " + (e.response?.data?.message || e.message));
  }
});