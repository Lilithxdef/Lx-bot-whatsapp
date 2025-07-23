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

    const teksMention = `📢 *Tag Semua Member*\n👥 Grup: *${groupName}*\n\n` +
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
