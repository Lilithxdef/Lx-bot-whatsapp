module.exports = async function groupCommand(sock, msg, command, args) {
  const from = msg.key.remoteJid
  const sender = msg.key.participant || msg.participant

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ Perintah ini hanya untuk grup!' }, { quoted: msg })
  }

  const groupMetadata = await sock.groupMetadata(from)

  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin)
  const isSenderAdmin = groupMetadata.participants.some(p => p.id === sender && p.admin)

  if (!isBotAdmin) {
    return sock.sendMessage(from, { text: '❌ Bot bukan admin!' }, { quoted: msg })
  }

  if (!isSenderAdmin) {
    return sock.sendMessage(from, { text: '❌ Kamu bukan admin!' }, { quoted: msg })
  }

  let target
  if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
    target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (msg.message.extendedTextMessage?.contextInfo?.participant) {
    target = msg.message.extendedTextMessage.contextInfo.participant
  } else {
    return sock.sendMessage(from, { text: '❌ Tag atau reply pengguna yang ingin diproses.' }, { quoted: msg })
  }

  try {
    if (command === '.kick') {
      await sock.groupParticipantsUpdate(from, [target], 'remove')
      await sock.sendMessage(from, { text: `✅ Berhasil mengeluarkan @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg })

    } else if (command === '.add') {
      await sock.groupParticipantsUpdate(from, [target], 'add')
      await sock.sendMessage(from, { text: `✅ Berhasil menambahkan @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg })

    } else if (command === '.promote') {
      await sock.groupParticipantsUpdate(from, [target], 'promote')
      await sock.sendMessage(from, { text: `✅ Berhasil menjadikan @${target.split('@')[0]} sebagai admin`, mentions: [target] }, { quoted: msg })

    } else if (command === '.demote') {
      await sock.groupParticipantsUpdate(from, [target], 'demote')
      await sock.sendMessage(from, { text: `✅ Berhasil mencabut admin dari @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg })
    }

  } catch (err) {
    console.error('Group command error:', err)
    sock.sendMessage(from, { text: '❌ Gagal memproses perintah grup.' }, { quoted: msg })
  }
}
