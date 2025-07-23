// lib/img.js
const fetch = require('node-fetch')
const cheerio = require('cheerio')

module.exports = async (sock, msg, q) => {
  if (!q) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan kata kunci pencarian gambar.' }, { quoted: msg })

  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=1&tsc=ImageHoverTitle`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36'
      }
    })
    const html = await res.text()
    const $ = cheerio.load(html)

    const imageLinks = []
    $('a.iusc').each((i, el) => {
      const m = $(el).attr('m')
      if (m) {
        const json = JSON.parse(m)
        if (json && json.murl) imageLinks.push(json.murl)
      }
    })

    if (imageLinks.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ Gambar tidak ditemukan.' }, { quoted: msg })
    }

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: imageLinks[0] },
      caption: `🔍 Gambar hasil pencarian: *${q}*`
    }, { quoted: msg })

  } catch (err) {
    console.error('❌ Error .img:', err)
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Gagal mencari gambar.'
    }, { quoted: msg })
  }
}
