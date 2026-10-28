const { wabot, mode, getJson } = require("../lib");
const config = require("../config");
const animeSearch = require("../lib/animeSearch");
wabot({
  pattern: "searchanime (.*)$",
  fromMe: mode,
  desc: "Search for anime and display results",
  type: "Anime"
}, async (message, match, client) => {
  const myr = match;
  const [query, limit] = myr.split(",");
  const searchQuery = query.trim();
  const resultLimit = limit ? parseInt(limit) : 1;
  if (!searchQuery) {
    return message.client.sendMessage(message.jid, { text: "Please provide an anime name." });
  }
  try {
    const res = await animeSearch(searchQuery, resultLimit);
    const data = typeof res === "string" ? JSON.parse(res) : res;
    if (!data.results || data.results.length === 0) {
      await message.client.sendMessage(message.jid, { text: "No anime found." });
    } else {
      const results = data.results.slice(0, resultLimit);
      for (const anime of results) {
        const {
          title: { english, romaji, native },
          status = "Unknown",
          format = "Unknown",
          seasonYear,
          averageScore,
          episodes,
          genres = [],
          coverImage: { extraLarge, medium },
          id
        } = anime;
        const titleEnglish = english || "Unknown Title";
        const titleRomaji = romaji || "Unknown Romaji Title";
        const titleNative = native || "Unknown Native Title";
        const season = seasonYear ? `${anime.season} ${seasonYear}` : "Unknown";
        const score = averageScore ? `${averageScore}/100` : "No rating";
        const episodeCount = episodes ? `${episodes} Episodes` : "Unknown episodes";
        const genreList = genres.join(", ") || "No genres";
        const caption = `
*Anime Information*

*English Title:* ${titleEnglish}
*Romaji Title:* ${titleRomaji}
*Native Title:* ${titleNative}

*Status:* ${status}
*Format:* ${format}
*Season:* ${season}
*Score:* ${score}
*Episodes:* ${episodeCount}
*Genres:* ${genreList}
`;
        await client.sendMessage(message.jid, {
          image: { url: extraLarge },
          caption,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              title: titleEnglish,
              body: `Score: ${score}`,
              mediaType: 1,
              thumbnailUrl: medium,
              renderLargerThumbnail: false,
              mediaUrl: `https://anilist.co/anime/${id}`,
              sourceUrl: `https://anilist.co/anime/${id}`
            }
          }
        }, { quoted: message.data });
      }
    }
  } catch (error) {
    console.error(error);
    await message.client.sendMessage(message.jid, { text: "An error occurred while fetching anime information." });
  }
});
