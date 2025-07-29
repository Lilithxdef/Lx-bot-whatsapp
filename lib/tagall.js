module.exports = async (sock, msg) => {
  try {
    const from = msg.key.remoteJid
    if (typeof from !== 'string' || !from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: '❌ Hanya bisa digunakan di grup.' }, { quoted: msg })
    }

    const sender = msg.key.participant || msg.participant || msg.key.remoteJid
    const metadata = await sock.groupMetadata(from).catch(() => null)
    if (!metadata) {
      return sock.sendMessage(from, { text: '❌ Tidak bisa mengambil data grup.' }, { quoted: msg })
    }

    const isAdmin = metadata.participants.find(p =>
      p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin) {
      return sock.sendMessage(from, { text: '❌ Hanya admin yang bisa pakai .tagall' }, { quoted: msg })
    }

    const participants = metadata.participants.map(p => p.id)
    const groupName = metadata.subject

    // 🔍 Ambil teks argumen atau dari reply
    let body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
    const args = body.trim().split(' ').slice(1)
    let extraText = args.join(' ')

    // Kalau kosong, coba ambil dari reply
    const ctx = msg.message?.extendedTextMessage?.contextInfo
    const quotedMsg = ctx?.quotedMessage
    const quotedType = quotedMsg ? Object.keys(quotedMsg)[0] : null
    const quotedContent = quotedMsg?.[quotedType]
    if (!extraText && quotedContent) {
      extraText = quotedContent?.text || quotedContent?.caption || '[Tidak bisa baca isi pesan reply]'
    }

    if (!extraText) extraText = '(tidak ada pesan)'

    const teksMention = `📢 *Tag Semua Member*\n👥 Grup: *${groupName}*\n\n` +
      `${extraText}\n\n` +
      participants.map(p => `@${p.split('@')[0]}`).join(' ')

    await sock.sendMessage(from, {
      text: teksMention,
      mentions: participants
    }, { quoted: msg })

  } catch (err) {
    console.log('❌ Tagall error:', err)
    await sock.sendMessage(msg.key.remoteJid || 'status@broadcast', { text: '❌ Error saat tagall.' }, { quoted: msg })
  }
}
