const fs = require('fs')
const { exec } = require('child_process')
const path = require('path')

module.exports = async (sock, msg, url) => {
  const chatId = msg.key.remoteJid

  await sock.sendMessage(chatId, { text: '🔎 *Lilith sedang Mencari video...*' }, { quoted: msg })

  const id = Date.now()
  const outputPath = `./tmp/${id}.mp4`

  exec(`yt-dlp -f mp4 -o "${outputPath}" "${url}"`, async (err, stdout, stderr) => {
    if (err) {
      console.error('❌ yt-dlp error:', err)
      return sock.sendMessage(chatId, { text: '❌ Gagal download video.' }, { quoted: msg })
    }

    await sock.sendMessage(chatId, { text: '✅ *Video ditemukan!*\n⏳ *Lilith sedang Mengirim, tunggu sebentar...*' }, { quoted: msg })

    const buffer = fs.readFileSync(outputPath)
    await sock.sendMessage(chatId, {
      video: buffer,
      caption: '_©Lilith-bot_'
    }, { quoted: msg })

    fs.unlinkSync(outputPath)
  })
}
