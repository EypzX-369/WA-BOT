# WA-BOT

A lightweight, open-source multi-device WhatsApp bot.


## Powered by
[Baileys](https://www.npmjs.com/package/@whiskeysockets/baileys) (`@whiskeysockets/baileys`, MIT) by WhiskeySockets. See [NOTICE.md](NOTICE.md).

## Requirements
- Node.js 18+
- ffmpeg (for sticker and media commands)

## Setup
```bash
npm install
npm start
```
First run: `node pair.js`, enter the number when asked, then link with the pairing code in WhatsApp (Linked devices). Session files are saved in `lib/auth/`.

## Configuration
Copy `config.env.example` to `config.env` and edit it:

| Variable | Description | Default |
|---|---|---|
| `PREFIX` | Command prefix regex | `^[.,!]` |
| `MODE` | `private` or `public` | `private` |
| `SUDO` | Extra admin numbers, comma separated | – |
| `BOT_NAME` | Bot name | `WA-BOT` |
| `OWNER_NAME` | Owner name | `Eypz` |
| `STICKER_PACKNAME` | Sticker pack name | `WA-BOT,Eypz` |
| `ALWAYS_ONLINE` | Always show online | `false` |
| `AUTO_STATUS_VIEW` | Auto view statuses | `false` |
| `WARN_COUNT` | Warns before kick | `3` |

## Commands
Send `.menu` in WhatsApp for the full list.

## Disclaimer
Unofficial bot. Using it may violate WhatsApp's terms and can get an account banned. Use at your own risk.

## License
GPL-3.0-or-later. See [LICENSE](LICENSE). Copyright (C) 2026 Eypz.
