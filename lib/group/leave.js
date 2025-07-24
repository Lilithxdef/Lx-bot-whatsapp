const { owner } = require('../data-owner')

module.exports = async function leaveGroup(sock, msg) {
  const from = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/@.+/, '')

  if (!owner.includes(senderNum)) {
    return sock.sendMessage(from, { text: '❌ Hanya owner yang bisa pakai perintah ini.' }, { quoted: msg })
  }

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ Hanya bisa dipakai di grup.' }, { quoted: msg })
  }

  await sock.sendMessage(from, { text: '👋 sayonara..' }, { quoted: msg })
  await sock.groupLeave(from)
}
