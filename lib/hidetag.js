const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ Hanya bisa digunakan di grup!' }, { quoted: msg })
  }

  const groupMetadata = await sock.groupMetadata(from)
  const participants = groupMetadata.participants.map(p => p.id)
  const sender = msg.key.participant || msg.key.remoteJid
  const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin

  if (!isAdmin) {
    return sock.sendMessage(from, { text: '❌ Fitur ini hanya bisa digunakan oleh admin grup!' }, { quoted: msg })
  }

  const text = args.join(' ')
  let caption = text

  // 🔍 Cek isi reply langsung dari msg.message
  const ctx = msg.message?.extendedTextMessage?.contextInfo
  const quotedMsg = ctx?.quotedMessage
  const quotedType = quotedMsg ? Object.keys(quotedMsg)[0] : null
  const quotedContent = quotedMsg?.[quotedType]

  // Ambil caption dari reply (jika tidak ada argumen)
  if (!caption && quotedContent) {
    caption = quotedContent?.text || quotedContent?.caption || '[Tidak bisa baca isi pesan reply]'
  }

  // Kalau reply ke media
  if (quotedType && ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(quotedType)) {
    try {
      const buffer = await downloadMediaMessage(
        { message: quotedMsg },
        'buffer',
        {},
        { reuploadRequest: sock }
      )

      const type = quotedType.includes('image') ? 'image'
                 : quotedType.includes('video') ? 'video'
                 : quotedType.includes('audio') ? 'audio'
                 : quotedType.includes('document') ? 'document'
                 : quotedType.includes('sticker') ? 'sticker'
                 : null

      if (!type) throw '❌ Media tidak didukung'

      const send = {
        mentions: participants
      }

      send[type] = buffer
      if (type !== 'audio' && type !== 'sticker') send.caption = caption || ''

      return sock.sendMessage(from, send, { quoted: msg })
    } catch (e) {
      return sock.sendMessage(from, { text: '❌ Gagal ambil media yang direply.' }, { quoted: msg })
    }
  }

  // Kalau teks (argumen atau reply teks)
  if (caption) {
    return sock.sendMessage(from, {
      text: caption,
      mentions: participants
    }, { quoted: msg })
  }

  return sock.sendMessage(from, { text: '❌ Masukkan teks atau reply ke pesan!' }, { quoted: msg })
}
