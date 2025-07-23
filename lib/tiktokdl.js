const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async function tiktokdl(sock, msg, text) {
  const from = msg.key.remoteJid
  const quoted = msg
  const tmpPath = './tmp'
  const raw = path.join(tmpPath, 'tiktok_raw.mp4')
  const final = path.join(tmpPath, 'tiktok_ready.mp4')

  if (!text || !text.includes('tiktok.com')) {
    return await sock.sendMessage(from, { text: '❌ Kirim link TikTok yang valid!' }, { quoted })
  }

  try {
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath)
    if (fs.existsSync(raw)) fs.unlinkSync(raw)
    if (fs.existsSync(final)) fs.unlinkSync(final)

    await sock.sendMessage(from, { text: '⏳ video ditemukan Sedang mengunduh video TikTok...' }, { quoted })

    // Unduh video TikTok
    const dlCommand = `yt-dlp -f "bestvideo+bestaudio/best" --recode-video mp4 -o "${raw}" "${text}"`
    await new Promise((resolve, reject) => {
      exec(dlCommand, (err, stdout, stderr) => {
        if (err) return reject(stderr || stdout)
        resolve(stdout)
      })
    })

    // Konversi agar cocok buat WA Story
    await sock.sendMessage(from, { text: '🔄 video sedang di konversi...' }, { quoted })
    const convertCommand = `ffmpeg -i "${raw}" -vf "scale='min(720,iw)':-2,fps=30" -c:v libx264 -preset veryfast -c:a aac -b:a 128k -y "${final}"`
    await new Promise((resolve, reject) => {
      exec(convertCommand, (err, stdout, stderr) => {
        if (err) return reject(stderr || stdout)
        resolve(stdout)
      })
    })

    // Kirim hasil akhir
    const buffer = fs.readFileSync(final)
    await sock.sendMessage(from, {
      video: buffer,
      mimetype: 'video/mp4',
      caption: '✅ nih bwang!',
    }, { quoted })

    // Hapus file sementara
    fs.unlinkSync(raw)
    fs.unlinkSync(final)
  } catch (err) {
    const errorMessage = (err || '').toString().trim().slice(0, 500)
    await sock.sendMessage(from, {
      text: '❌ Gagal unduh/konversi video TikTok:\n\n' + errorMessage
    }, { quoted })
  }
}
