const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async function tiktokdl(sock, msg, text) {
  const from = msg.key.remoteJid
  const quoted = msg
  const tmpPath = './tmp'
  const raw = path.join(tmpPath, `tiktok_raw_${Date.now()}.mp4`)
  const final = path.join(tmpPath, `tiktok_ready_${Date.now()}.mp4`)

  if (!text || !text.includes('tiktok.com')) {
    return await sock.sendMessage(from, { text: '❌ Kirim link TikTok yang valid!' }, { quoted })
  }

  try {
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath)

    await sock.sendMessage(from, { text: '⏳ Video ditemukan...\nLilith sedang mengunduh video TikTok 🎬' }, { quoted })

    // ✅ Download video TikTok (codec aman)
    const dlCommand = `yt-dlp -f "bv*[ext=mp4][vcodec*=avc1]+ba[ext=m4a]/mp4" --merge-output-format mp4 --no-part -o "${raw}" "${text}"`
    await new Promise((resolve, reject) => {
      exec(dlCommand, { timeout: 180000 }, (err, stdout, stderr) => {
        if (err) return reject(stderr || stdout)
        resolve(stdout)
      })
    })

    if (!fs.existsSync(raw) || fs.statSync(raw).size < 80000) {
      throw '❌ Video gagal diunduh. Mungkin link salah atau video dibatasi region/private.'
    }

    await sock.sendMessage(from, { text: '🔄 Lilith sedang mengonversi video agar kompatibel dengan status WhatsApp...' }, { quoted })

    // ✅ Konversi video (max 720p, 30fps, durasi ≤29 detik)
    const convertCommand = `ffmpeg -y -i "${raw}" \
      -vf "scale='min(720,iw)':-2,fps=30" \
      -c:v libx264 -preset ultrafast -profile:v main -level 3.1 \
      -pix_fmt yuv420p -b:v 1500k -movflags +faststart \
      -c:a aac -b:a 128k -t 00:00:29 "${final}"`
    await new Promise((resolve, reject) => {
      exec(convertCommand, { timeout: 120000 }, (err, stdout, stderr) => {
        if (err) return reject(stderr || stdout)
        resolve(stdout)
      })
    })

    if (!fs.existsSync(final)) throw '❌ Gagal mengonversi video TikTok.'

    await sock.sendMessage(from, {
      video: fs.readFileSync(final),
      mimetype: 'video/mp4',
      caption: '✅ Nih bwang, udah siap buat status WhatsApp 😎',
    }, { quoted })

  } catch (err) {
    const errMsg = (err || '').toString().slice(0, 400)
    await sock.sendMessage(from, { text: `❌ Lilith gagal mengunduh/mengonversi video TikTok:\n\n${errMsg}` }, { quoted })
  } finally {
    // Hapus file sementara aman
    try {
      if (fs.existsSync(raw)) fs.unlinkSync(raw)
      if (fs.existsSync(final)) fs.unlinkSync(final)
    } catch {}
  }
}
