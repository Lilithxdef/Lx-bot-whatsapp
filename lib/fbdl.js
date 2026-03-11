const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')

const tmpdir = './tmp'

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid
  const quoted = msg
  const url = args[0]

  if (!url || !url.includes('facebook.com')) {
    return sock.sendMessage(from, { text: '❌ Masukkan link video Facebook yang valid!' }, { quoted })
  }

  if (!fs.existsSync(tmpdir)) fs.mkdirSync(tmpdir)

  const filename = `fb_${Date.now()}.mp4`
  const outputPath = path.join(tmpdir, filename)

  await sock.sendMessage(from, { text: '⏳ Mengunduh video dari Facebook, tunggu sebentar...' }, { quoted })

  // 1. Coba yt-dlp dengan preferensi HD <= 720p
  exec(`yt-dlp -f "mp4[height<=720]" -o "${outputPath}" "${url}"`, async (err) => {
    if (!err && fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath)
      const sizeMB = stats.size / 1024 / 1024

      // Jika terlalu besar untuk status WA, kirim peringatan
      if (sizeMB > 64) {
        await sock.sendMessage(from, { text: `⚠️ Video terlalu besar (${sizeMB.toFixed(1)} MB) untuk status WhatsApp. Tetap dikirim sebagai video biasa.` }, { quoted })
      }

      const buffer = fs.readFileSync(outputPath)
      await sock.sendMessage(from, { video: buffer, caption: '✅ Berikut videonya! (via yt-dlp)' }, { quoted })
      return fs.unlinkSync(outputPath)
    }

    // 2. Fallback ke SnapSave
    try {
      const res = await axios.post('https://snapsave.app/action.php?lang=id', new URLSearchParams({ url }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        }
      })

      const $ = cheerio.load(res.data)
      const snapUrl = $('a.download-button').first().attr('href')

      if (!snapUrl) throw '❌ Gagal ambil link dari snapsave.app'

      const vid = (await axios.get(snapUrl, { responseType: 'arraybuffer' })).data
      await sock.sendMessage(from, { video: vid, caption: '✅ Berikut videonya! (via snapsave.app)' }, { quoted })
    } catch (e) {
      console.error(e)
      await sock.sendMessage(from, { text: '❌ Gagal mengunduh video. Pastikan link publik & valid.' }, { quoted })
    }
  })
}
