
const fs = require('fs')
const { exec } = require('child_process')
const path = require('path')

module.exports = async function ytmp3(sock, msg, url) {
  const from = msg.key.remoteJid

  try {
    await sock.sendMessage(from, { text: '⏳Lilith  Sedang memproses audio...' }, { quoted: msg })

    const filename = `ytmp3_${Date.now()}.mp3`
    const filepath = path.join('./tmp', filename)

    const command = `yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`

    exec(command, async (err, stdout, stderr) => {
      if (err) {
        console.error('[YTMP3 ERROR]', err)
        return sock.sendMessage(from, { text: '❌ Gagal mengunduh audio.' }, { quoted: msg })
      }

      if (!fs.existsSync(filepath)) {
        return sock.sendMessage(from, { text: '❌ File audio tidak ditemukan.' }, { quoted: msg })
      }

      const audio = fs.readFileSync(filepath)

      await sock.sendMessage(from, {
        audio,
        mimetype: 'audio/mp4',
        ptt: false
      }, { quoted: msg })

      fs.unlinkSync(filepath)
    })

  } catch (e) {
    console.error('[YTMP3 ERROR]', e)
    await sock.sendMessage(from, { text: '❌ Terjadi kesalahan.' }, { quoted: msg })
  }
}
