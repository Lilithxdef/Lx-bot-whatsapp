// lib/info.js

const info = async (sock, msg) => {
  const from = msg.key.remoteJid

  const runtime = process.uptime()
  const jam = Math.floor(runtime / 3600)
  const menit = Math.floor((runtime % 3600) / 60)
  const detik = Math.floor(runtime % 60)

  const teks = `
*🤖 INFO BOT*

Nama Bot : Lx-bot
Runtime  : ${jam}j ${menit}m ${detik}s
Platform : ${process.platform}
NodeJS   : ${process.version}

Bot berjalan normal ✅
`

  await sock.sendMessage(from, { text: teks }, { quoted: msg })
}

module.exports = info
