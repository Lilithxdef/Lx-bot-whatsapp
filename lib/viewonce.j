const fs = require('fs')
const path = require('path')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

// ⚠️ OWNER NUMBER (TANPA UBAH owner.js)
const OWNER_NUMBER = '62881023683976'
const OWNER_JID = OWNER_NUMBER + '@s.whatsapp.net'

module.exports = async (sock, msg) => {
  try {
    const from = msg.key.remoteJid
    const ctx = msg.message?.extendedTextMessage?.contextInfo

    // harus reply
    if (!ctx || !ctx.quotedMessage) {
      return await sock.sendMessage(
        from,
        { text: '❌ Balas pesan view-once yang ingin dibuka.' },
        { quoted: msg }
      )
    }

    // ambil view-once image / video
    const image =
      ctx.quotedMessage?.viewOnceMessage?.message?.imageMessage ||
      ctx.quotedMessage?.viewOnceMessageV2?.message?.imageMessage

    const video =
      ctx.quotedMessage?.viewOnceMessage?.message?.videoMessage ||
      ctx.quotedMessage?.viewOnceMessageV2?.message?.videoMessage

    if (!image && !video) {
      return await sock.sendMessage(
        from,
        { text: '❌ Itu bukan pesan view-once.' },
        { quoted: msg }
      )
    }

    const media = image || video
    const mediaType = image ? 'imageMessage' : 'videoMessage'
    const sendType = image ? 'image' : 'video'
    const ext = image ? 'jpg' : 'mp4'
    const tempFile = path.join(__dirname, '../tmp/' + Date.now() + '.' + ext)

    // download media
    const buffer = await downloadMediaMessage(
      { message: { [mediaType]: media } },
      'buffer',
      {},
      { reuploadRequest: sock.updateMediaMessage }
    )

    fs.writeFileSync(tempFile, buffer)

    // 🔥 KIRIM KE OWNER (TANPA quoted)
    await sock.sendMessage(OWNER_JID, {
      [sendType]: fs.readFileSync(tempFile),
      caption: `📥 VIEW-ONCE\n👤 Dari: ${from}`
    })

    // notif ke user (boleh quoted)
    await sock.sendMessage(
      from,
      { text: '✅ View-once berhasil dikirim ke owner.' },
      { quoted: msg }
    )

    fs.unlinkSync(tempFile)
  } catch (err) {
    console.error('[VIEWONCE ERROR]', err)
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: '❌ Gagal memproses view-once.' },
      { quoted: msg }
    )
  }
}
