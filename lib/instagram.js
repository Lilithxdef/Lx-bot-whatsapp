const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid
  const quoted = msg

  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link Instagram!' }, { quoted })

  await sock.sendMessage(from, { text: '⏳ Mengunduh dari Instagram...' }, { quoted })

  try {
    const id = Date.now()
    const rawOutput = `./tmp/ig_raw_${id}.%(ext)s`
    const fixedOutput = `./tmp/ig_snap_${id}.mp4`

    const link = args[0]

    // 1. Download format terbaik dulu (biarkan yt-dlp memilih)
    const cmd1 = `yt-dlp -o "${rawOutput}" --print after_move:filepath "${link}"`
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

      // 2. Konversi dengan ffmpeg agar bisa jadi Snap WhatsApp
      const ffmpegCmd = `ffmpeg -i "${downloadedPath}" -vf "scale=480:-2" -c:v libx264 -c:a aac -b:v 500k -b:a 128k -y "${fixedOutput}"`
      exec(ffmpegCmd, async (err2) => {
        if (err2) {
          console.error('FFmpeg error:', err2)
          return sock.sendMessage(from, { text: '❌ Gagal konversi video.' }, { quoted })
        }

        const buffer = fs.readFileSync(fixedOutput)

        // Kirim ke chat
        await sock.sendMessage(from, {
          video: buffer,
          mimetype: 'video/mp4',
          caption: '✅ Berhasil mengunduh dari Instagram!',
        }, { quoted })

        // Kirim ke Snap WA
        await sock.sendMessage('status@broadcast', {
          video: buffer,
          mimetype: 'video/mp4',
          caption: '📥 IG Snap by Lx-Bot',
        }, {
          statusJid: 'status@broadcast',
          sendEphemeral: true,
        })

        // Hapus file sementara
        fs.unlinkSync(downloadedPath)
        fs.unlinkSync(fixedOutput)
      })
    })
  } catch (e) {
    console.error('System error:', e)
    sock.sendMessage(from, { text: '❌ Error sistem.' }, { quoted })
  }
}
