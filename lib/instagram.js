const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid
  const quoted = msg

  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link Instagram!' }, { quoted })

  await sock.sendMessage(from, { text: '⏳ Mengunduh dari Instagram (HD)...' }, { quoted })

  try {
    const id = Date.now()
    const rawOutput = `./tmp/ig_raw_${id}.%(ext)s`
    const fixedOutput = `./tmp/ig_snap_${id}.mp4`

    const link = args[0]

    // Download format terbaik (biarkan yt-dlp memilih otomatis kualitas tertinggi)
    const cmd1 = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" -o "${rawOutput}" --merge-output-format mp4 --print after_move:filepath "${link}"`
    exec(cmd1, (err, stdout) => {
      if (err) {
        console.error('Download error:', err)
        return sock.sendMessage(from, { text: '❌ Gagal download.' }, { quoted })
      }

      const downloadedPath = stdout.trim()
      if (!fs.existsSync(downloadedPath)) {
        console.error('File tidak ditemukan:', downloadedPath)
        return sock.sendMessage(from, { text: '❌ File tidak ditemukan.' }, { quoted })
      }

      // Encode ulang tanpa menurunkan resolusi
      const ffmpegCmd = `ffmpeg -i "${downloadedPath}" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 192k -y "${fixedOutput}"`
      exec(ffmpegCmd, async (err2) => {
        if (err2) {
          console.error('FFmpeg error:', err2)
          return sock.sendMessage(from, { text: '❌ Gagal konversi video.' }, { quoted })
        }

        const buffer = fs.readFileSync(fixedOutput)

        await sock.sendMessage(from, {
          video: buffer,
          mimetype: 'video/mp4',
          caption: '✅ Berhasil mengunduh dari Instagram (HD)!',
        }, { quoted })

        // Kirim ke Snap WA
        await sock.sendMessage('status@broadcast', {
          video: buffer,
          mimetype: 'video/mp4',
          caption: '📥 IG Snap HD by Lx-Bot',
        }, {
          statusJid: 'status@broadcast',
          sendEphemeral: true,
        })

        // Cleanup
        fs.unlinkSync(downloadedPath)
        fs.unlinkSync(fixedOutput)
      })
    })
  } catch (e) {
    console.error('System error:', e)
    sock.sendMessage(from, { text: '❌ Error sistem.' }, { quoted })
  }
}
