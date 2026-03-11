const { downloadContentFromMessage } = require('@whiskeysockets/baileys')

module.exports = async (sock, msg, store) => {
  try {
    const ctx = msg.message?.extendedTextMessage?.contextInfo
    if (!ctx?.stanzaId) return

    const quoted = await store.loadMessage(msg.key.remoteJid, ctx.stanzaId)
    if (!quoted?.message?.viewOnceMessageV2) return

    const vo = quoted.message.viewOnceMessageV2.message
    const media = vo.imageMessage || vo.videoMessage
    const type = vo.imageMessage ? 'image' : 'video'

    const stream = await downloadContentFromMessage(media, type)
    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const ownerJid = '62881023683976@s.whatsapp.net'

    await sock.sendMessage(ownerJid, {
      [type]: buffer,
      caption: '📩 View Once dari user'
    })

  } catch (e) {
    console.error('❌ Anti ViewOnce error:', e)
  }
}
