const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

module.exports = async (sock, msg) => {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const mime = quoted ? Object.keys(quoted)[0] : Object.keys(msg.message)[0]

    if (!/image/.test(mime)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Kirim atau reply gambar dengan caption .sticker',
      }, { quoted: msg })
    }

    const media = quoted ? quoted : msg.message
    const buffer = await downloadMediaMessage(
      { message: media },
      'buffer',
      {},
      { logger: console, reuploadRequest: sock.updateMediaMessage }
    )

    const id = Date.now()
    const input = `./tmp/${id}.jpg`
    const output = `./tmp/${id}.webp`
    const final = `./tmp/${id}_final.webp`
    const exif = `./tmp/${id}.exif`

    fs.writeFileSync(input, buffer)

    // Buat EXIF packname
    const json = {
      "sticker-pack-id": "com.lxbot",
      "sticker-pack-name": "LxBot",
      "sticker-pack-publisher": "LilithXdef",
      "emojis": ["🔥"]
    }
    const exifAttr = Buffer.concat([
      Buffer.from([0x49, 0x49, 0x2A, 0x00]),
      Buffer.from(JSON.stringify(json))
    ])
    fs.writeFileSync(exif, exifAttr)

    // Gunakan ffmpeg dengan kualitas tinggi dan sesuaikan pad dan scale
    exec(`ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -vcodec libwebp -lossless 1 -q:v 90 -preset default -loop 0 -an -vsync 0 ${output}`, (err) => {
      if (err) {
        console.error('❌ ffmpeg error:', err)
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal konversi ke stiker.' }, { quoted: msg })
      }

      // Tambah EXIF packname
      exec(`webpmux -set exif ${exif} ${output} -o ${final}`, async (err2) => {
        if (err2) {
          console.error('❌ webpmux error:', err2)
          return sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal menambahkan packname.' }, { quoted: msg })
        }

        await sock.sendMessage(msg.key.remoteJid, {
          sticker: fs.readFileSync(final)
        }, { quoted: msg })

        // Bersihkan file
        for (let file of [input, output, final, exif]) {
          if (fs.existsSync(file)) fs.unlinkSync(file)
        }
      })
    })

  } catch (err) {
    console.error('❌ Error sticker handler:', err)
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Gagal membuat stiker.'
    }, { quoted: msg })
  }
}
