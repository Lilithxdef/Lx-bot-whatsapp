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
    // Pastikan folder sementara ada
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath)
    if (fs.existsSync(raw)) fs.unlinkSync(raw)
    if (fs.existsSync(final)) fs.unlinkSync(final)

    await sock.sendMessage(from, {
      text: '⏳ Video ditemukan...\nLilith sedang mengunduh video TikTok 🎬'
    }, { quoted })

    // ✅ Download video TikTok (format H.264 + AAC)
    const dlCommand = `yt-dlp -f "bv*[ext=mp4][vcodec*=avc1]+ba[ext=m4a]/mp4" --merge-output-format mp4 --no-part -o "${raw}" "${text}"`
    await new Promise((resolve, reject) => {
      exec(dlCommand, (err, stdout, stderr) => {
        if (err) return reject(stderr || stdout)
        resolve(stdout)
      })
    })

    // Validasi hasil
    if (!fs.existsSync(raw) || fs.statSync(raw).size < 50000) {
      throw '❌ Video gagal diunduh. Mungkin video private, region lock, atau link salah.'
    }

    await sock.sendMessage(from, {
      text: '🔄 Lilith sedang mengonversi video agar kompatibel dengan status WhatsApp...'
    }, { quoted })

    // ✅ Konversi video full kompatibel SW
    const convertCommand = `ffmpeg -i "${raw}" \
      -vf "scale='min(720,iw)':-2,fps=30" \
      -c:v libx264 -preset veryfast -profile:v main -level 3.1 \
      -pix_fmt yuv420p -b:v 1800k -movflags +faststart \
      -c:a aac -b:a 128k -t 00:00:29 -y "${final}"`

    await new Promise((resolve, reject) => {
      exec(convertCommand, (err, stdout, stderr) => {
        if (err) return reject(stderr || stdout)
        resolve(stdout)
      })
    })

    // Kirim hasil video ke user
    const buffer = fs.readFileSync(final)
    await sock.sendMessage(from, {
      video: buffer,
      mimetype: 'video/mp4',
      caption: '✅ Nih bwang, udah siap buat status WhatsApp 😎',
    }, { quoted })

    // Bersihkan file sementara
    fs.unlinkSync(raw)
    fs.unlinkSync(final)

  } catch (err) {
    const errorMessage = (err || '').toString().trim().slice(0, 500)
    await sock.sendMessage(from, {
      text: '❌ Lilith gagal mengunduh/mengonversi video TikTok:\n\n' + errorMessage
    }, { quoted })
  }
}
