const { owner } = require('../data-owner')

module.exports = async function joinGroup(sock, msg, args) {
  const from = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/@.+/, '')

  if (!owner.includes(senderNum)) {
    return sock.sendMessage(from, { text: '❌ Hanya owner yang bisa menggunakan perintah ini.' }, { quoted: msg })
  }

  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com/')) {
    return sock.sendMessage(from, { text: '❌ Masukkan link undangan grup yang valid.' }, { quoted: msg })
  }

  let code = link.split('chat.whatsapp.com/')[1]
  code = code.split('?')[0].trim() // 🛠️ hapus query seperti ?mode=r_c

  if (!code || code.length < 20) {
    return sock.sendMessage(from, { text: '❌ Kode undangan tidak valid.' }, { quoted: msg })
  }

  try {
    console.log('[JOIN DEBUG] Cleaned code:', code)
    const res = await sock.groupAcceptInvite(code)
    console.log('[JOIN SUCCESS] Bot joined group ID:', res)
    await sock.sendMessage(from, { text: `✅ Berhasil join grup!\n🆔 ID Grup: ${res}` }, { quoted: msg })
  } catch (err) {
    console.error('[JOIN ERROR]', err)
    const reason = err?.message || 'unknown error'
    await sock.sendMessage(from, { text: `❌ Gagal join grup. Alasan: *${reason}*` }, { quoted: msg })
  }
}
