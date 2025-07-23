const fs = require('fs')
const path = require('path')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = async (sock, msg) => {
  try {
    const from = msg.key?.remoteJid
    const ctx = msg.message?.extendedTextMessage?.contextInfo

    if (!ctx || !ctx.quotedMessage) {
      return await sock.sendMessage(from, { text: '❌ Balas pesan view-once yang ingin dibuka.' }, { quoted: msg })
    }

    const image = ctx.quotedMessage?.imageMessage
    const video = ctx.quotedMessage?.videoMessage

    if (!image && !video) {
      return await sock.sendMessage(from, { text: '❌ Tidak menemukan isi media view-once.' }, { quoted: msg })
    }

    const mediaType = image ? 'imageMessage' : 'videoMessage'
    const extension = image ? 'jpg' : 'mp4'
    const tempFile = path.join(__dirname, '../tmp/' + Date.now() + '.' + extension)

    // Download media langsung dari objek message
    const buffer = await downloadMediaMessage(
      { message: { [mediaType]: image || video } },
      'buffer',
      {},
      { reuploadRequest: sock.updateMediaMessage }
    )

    fs.writeFileSync(tempFile, buffer)

    await sock.sendMessage(
      from,
      {
        [mediaType.replace('Message', '')]: fs.readFileSync(tempFile),
        caption: ' ✅ berhasil membuka View-Once',
      },
      { quoted: msg }
    )

    fs.unlinkSync(tempFile)
  } catch (err) {
    console.error('[ANTIVIEW ERROR]', err)
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuka view-once.' }, { quoted: msg })
  }
}
