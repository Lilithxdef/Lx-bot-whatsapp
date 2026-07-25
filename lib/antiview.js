const fs = require('fs')
const path = require('path')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = async (sock, msg) => {
  try {
    const from = msg.key.remoteJid
    const ctx = msg.message?.extendedTextMessage?.contextInfo

    if (!ctx?.quotedMessage) {
      return await sock.sendMessage(
        from,
        { text: '❌ Balas pesan view-once yang ingin dibuka.' },
        { quoted: msg }
      )
    }

    let quoted = ctx.quotedMessage

    // buka pembungkus view once
    if (quoted.viewOnceMessageV2) {
      quoted = quoted.viewOnceMessageV2.message
    } else if (quoted.viewOnceMessage) {
      quoted = quoted.viewOnceMessage.message
    }

    const image = quoted.imageMessage
    const video = quoted.videoMessage

    if (!image && !video) {
      return await sock.sendMessage(
        from,
        { text: '❌ Tidak menemukan media view-once.' },
        { quoted: msg }
      )
    }

    const mediaType = image ? 'imageMessage' : 'videoMessage'
    const extension = image ? 'jpg' : 'mp4'

    const tempDir = path.join(__dirname, '../tmp')

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempFile = path.join(
      tempDir,
      Date.now() + '.' + extension
    )

    const buffer = await downloadMediaMessage(
      {
        key: ctx.stanzaId ? {
          remoteJid: from,
          id: ctx.stanzaId
        } : msg.key,
        message: {
          [mediaType]: image || video
        }
      },
      'buffer',
      {},
      {
        reuploadRequest: sock.updateMediaMessage
      }
    )

    fs.writeFileSync(tempFile, buffer)

    await sock.sendMessage(
      from,
      {
        [mediaType.replace('Message', '')]: fs.readFileSync(tempFile),
        caption: '✅ Berhasil membuka *View-Once*'
      },
      { quoted: msg }
    )

    fs.unlinkSync(tempFile)

  } catch (err) {
    console.error('[ANTIVIEW ERROR]', err)

    await sock.sendMessage(
      msg.key.remoteJid,
      {
        text: '❌ Gagal membuka view-once.'
      },
      { quoted: msg }
    )
  }
}
