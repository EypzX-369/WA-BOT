const { wabot, mode } = require("../lib");
const os = require("os");
const packageJson = require("../package.json");
wabot(
  {
    pattern: "system$",
    fromMe: true,
    desc: "Get system information",
    type: "info"
  },
  async (message, match, client) => {
    const start = (/* @__PURE__ */ new Date()).getTime();
    await client.sendMessage(message.jid, { text: "Checking..." }, { quoted: message.data });
    const end = (/* @__PURE__ */ new Date()).getTime();
    const responseTime = ((end - start) / 1e3).toFixed(3);
    const uptimeSec = os.uptime();
    const sysDays = Math.floor(uptimeSec / (3600 * 24));
    const sysHours = Math.floor(uptimeSec % (3600 * 24) / 3600);
    const sysMinutes = Math.floor(uptimeSec % 3600 / 60);
    const sysSeconds = Math.floor(uptimeSec % 60);
    const sysUptime = `${sysDays}d ${sysHours}h ${sysMinutes}m ${sysSeconds}s`;
    const runtimeSec = Math.floor(process.uptime());
    const runDays = Math.floor(runtimeSec / (3600 * 24));
    const runHours = Math.floor(runtimeSec % (3600 * 24) / 3600);
    const runMinutes = Math.floor(runtimeSec % 3600 / 60);
    const runSeconds = Math.floor(runtimeSec % 60);
    const runtime = `${runDays}d ${runHours}h ${runMinutes}m ${runSeconds}s`;
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus().length;
    const cpuModel = os.cpus()[0].model;
    const cpuSpeed = os.cpus()[0].speed;
    const loadAvg = os.loadavg().map((avg) => avg.toFixed(2)).join(" / ");
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedMem = totalMem - freeMem;
    const memUsage = process.memoryUsage();
    const rssMB = (memUsage.rss / 1024 / 1024).toFixed(2);
    const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
    const nodeVersion = process.version;
    const version = packageJson.version || "N/A";
    const pid = process.pid;
    const ppid = process.ppid;
    const activeHandles = process._getActiveHandles().length;
    const lastRestart = new Date(Date.now() - process.uptime() * 1e3).toLocaleString();
    const hostname = os.hostname();
    const isRender = hostname.startsWith("srv-");
    const isKoyeb = hostname.length === 8 && /^[a-f0-9]+$/.test(hostname);
    const hostPlatform = isRender ? "Render" : isKoyeb ? "Koyeb" : "Unknown";
    const text = `
\u256D\u2500\u2500\u2500[ WA-BOT System Info ]
\u2502
\u2502 Platform       : ${platform}
\u2502 Architecture   : ${arch}
\u2502 Host Platform  : ${hostPlatform}
\u2502 CPU Cores      : ${cpus}
\u2502 CPU Model      : ${cpuModel}
\u2502 Load Average   : ${loadAvg}
\u2502
\u251C\u2500 Memory
\u2502 Used RAM       : ${usedMem} / ${totalMem} MB
\u2502 Heap Used      : ${heapUsed} / ${heapTotal} MB
\u2502 RSS Memory     : ${rssMB} MB
\u2502
\u251C\u2500 Status
\u2502 System Uptime  : ${sysUptime}
\u2502 Runtime        : ${runtime}
\u2502 Response Time  : ${responseTime} sec
\u2502 Last Restart   : ${lastRestart}
\u2502
\u251C\u2500 Process Info
\u2502 Node.js        : ${nodeVersion}
\u2502 Bot Version    : ${version}
\u2502 PID / PPID     : ${pid} / ${ppid}
\u2502 Active Handles : ${activeHandles}
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`;
    await client.sendMessage(
      message.jid,
      {
        video: { url: "https://files.catbox.moe/pev63m.mp4" },
        caption: text,
        gifPlayback: true,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363298577467093@newsletter",
            newsletterName: "\u{1D408}\u{1D433}\u{1D42E}\u{1D426}\u{1D422}-\u{1D426}\u{1D41D}",
            serverMessageId: -1
          }
        }
      },
      { quoted: message.data }
    );
  }
);
