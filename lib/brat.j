const fs = require('fs')
const path = require('path')
const Jimp = require('jimp')
const { exec } = require('child_process')

async function bratifyMedia(sock, msg, text) {
  try {
    const baseName = Date.now()
    const pngPath = path.join(__dirname, '../tmp', `${baseName}.png`)
    const webpPath = path.join(__dirname, '../tmp', `${baseName}.webp`)

    const caption = (text || '').trim() || 'Brat 💅'
    const words = caption.split(/\s+/).slice(0, 5) // maksimal 5 kata
    const image = new Jimp(512, 512, '#ffffff') // background putih
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK) // font besar

    let y = 30
    for (const word of words) {
      image.print(font, 20, y, word) // tulis dari kiri atas
      y += 80 // jarak antar baris
    }

    image.resize(512, 512) // pastikan ukuran fix
    await image.writeAsync(pngPath)

    // konversi PNG → WebP
    await new Promise((resolve, reject) => {
      exec(`cwebp -q 80 "${pngPath}" -o "${webpPath}"`, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    const buffer = fs.readFileSync(webpPath)

    // kirim sebagai stiker
    await sock.sendMessage(msg.key.remoteJid, {
      sticker: buffer
    }, { quoted: msg })

    fs.unlinkSync(pngPath)
    fs.unlinkSync(webpPath)

  } catch (err) {
    console.error('❌ Gagal buat brat stiker:', err)
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Gagal buat brat stiker.'
    }, { quoted: msg })
  }
}

module.exports = bratifyMedia
