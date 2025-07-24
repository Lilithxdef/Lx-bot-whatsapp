const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid
  const quoted = msg

  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link Instagram!' }, { quoted })

  await sock.sendMessage(from, { text: '⏳ Mengunduh dari Instagram...' }, { quoted })

  try {
    const filename = 'ig_' + Date.now()
    const output = path.join('./tmp', `${filename}.%(ext)s`)
    const cmd = `yt-dlp -o "${output}" "${args[0]}"`

    exec(cmd, (err, stdout) => {
      if (err) return sock.sendMessage(from, { text: '❌ Gagal download.' }, { quoted })

      const match = stdout.match(/Destination: (.+)/)
      if (!match || !fs.existsSync(match[1]))
        return sock.sendMessage(from, { text: '❌ File tidak ditemukan.' }, { quoted })

      const filePath = match[1]
      const buffer = fs.readFileSync(filePath)
      const isVideo = filePath.endsWith('.mp4')

      sock.sendMessage(from, {
        [isVideo ? 'video' : 'image']: buffer,
        mimetype: isVideo ? 'video/mp4' : 'image/jpeg',
        caption: '✅ Instagram media',
      }, { quoted })

      fs.unlinkSync(filePath)
    })
  } catch (e) {
    sock.sendMessage(from, { text: '❌ Error sistem.' }, { quoted })
  }
}
