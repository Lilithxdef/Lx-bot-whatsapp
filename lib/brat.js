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
    const words = caption.split(/\s+/).slice(0, 10) // maksimal 10 kata
    const wordCount = words.length

    // Gunakan font dan jarak sesuai jumlah kata
    let font, spacing
    if (wordCount <= 3) {
      font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK)
      spacing = 130
    } else if (wordCount <= 5) {
      font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
      spacing = 80
    } else {
      font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
      spacing = 45
    }

    const image = new Jimp(512, 512, '#ffffff')
    let y = 30

    for (const word of words) {
      image.print(font, 20, y, word)
      y += spacing
    }

    image.resize(512, 512)
    await image.writeAsync(pngPath)

    await new Promise((resolve, reject) => {
      exec(`cwebp -q 80 "${pngPath}" -o "${webpPath}"`, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    const buffer = fs.readFileSync(webpPath)

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
