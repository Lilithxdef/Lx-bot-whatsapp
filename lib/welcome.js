const fs = require('fs')
const path = './lib/database/welcome.json'

if (!fs.existsSync(path)) fs.writeFileSync(path, '{}')

function loadDB() {
  return JSON.parse(fs.readFileSync(path))
}
function saveDB(db) {
  fs.writeFileSync(path, JSON.stringify(db, null, 2))
}
function isWelcomeOn(groupId) {
  const db = loadDB()
  return db[groupId] === true
}
function setWelcome(groupId, value) {
  const db = loadDB()
  db[groupId] = value
  saveDB(db)
}

async function handleWelcomeCommand(sock, msg, from, command, args, isGroup, sender, groupMetadata) {
  const isAdmin = isGroup && groupMetadata?.participants?.find(p => p.id === sender && p.admin)
  if (!isGroup)
    return sock.sendMessage(from, { text: '❌ Hanya bisa di grup.' }, { quoted: msg })
  if (!isAdmin)
    return sock.sendMessage(from, { text: '❌ Hanya admin yang bisa mengatur welcome.' }, { quoted: msg })

  if (!args[0]) {
    return sock.sendMessage(from, {
      text: `Penggunaan:\n.welcome on\n.welcome off\n\nStatus: ${isWelcomeOn(from) ? '*ON*' : '*OFF*'}`
    }, { quoted: msg })
  }

  if (args[0] === 'on') {
    setWelcome(from, true)
    return sock.sendMessage(from, { text: '✅ Welcome telah *diaktifkan*!' }, { quoted: msg })
  } else if (args[0] === 'off') {
    setWelcome(from, false)
    return sock.sendMessage(from, { text: '✅ Welcome telah *dimatikan*!' }, { quoted: msg })
  } else {
    return sock.sendMessage(from, { text: '❌ Gunakan `.welcome on` atau `.welcome off`' }, { quoted: msg })
  }
}

async function handleWelcomeEvent(sock) {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      if (!['add', 'remove', 'promote', 'demote'].includes(update.action)) return
      if (!update.id || !update.participants) return

      const isWelcome = isWelcomeOn(update.id)
      if (!isWelcome) return

      let metadata = { subject: 'Grup', participants: [] }
      try {
        metadata = await sock.groupMetadata(update.id)
      } catch {
        console.log('⚠️ Gagal ambil metadata grup:', update.id)
      }

      const groupName = metadata.subject

      for (let jid of update.participants || []) {
        if (!jid) continue

        let pp = 'https://telegra.ph/file/0d7d4431e3c5817f6f62b.jpg'
        try {
          pp = await sock.profilePictureUrl(jid, 'image')
        } catch {}

        const username = `@${jid.split('@')[0]}`
        let namaUser = 'Pengguna'
        try {
          const found = metadata.participants?.find(p => p.id === jid)
          namaUser = found?.notify || 'Pengguna'
        } catch {}

        // WELCOME
        if (update.action === 'add') {
          const teks = `👋 Selamat datang ${username} di grup *${groupName}*!\nSemoga betah ya.`
          await sock.sendMessage(update.id, {
            image: { url: pp },
            caption: teks,
            mentions: [jid]
          })
        }

        // GOODBYE
        if (update.action === 'remove') {
          const teks = `👋 Selamat tinggal ${username}.\nSemoga sukses di luar sana! 👋`
          await sock.sendMessage(update.id, {
            image: { url: pp },
            caption: teks,
            mentions: [jid]
          })
        }

        // PROMOTE
        if (update.action === 'promote') {
          const teks = `✅ *Promote Admin*\n👤 ${namaUser} (${username})\n📍 Grup: ${groupName}`
          await sock.sendMessage(update.id, {
            text: teks,
            mentions: [jid]
          })
        }

        // DEMOTE
        if (update.action === 'demote') {
          const teks = `⚠️ *Demote Admin*\n👤 ${namaUser} (${username})\n📍 Grup: ${groupName}`
          await sock.sendMessage(update.id, {
            text: teks,
            mentions: [jid]
          })
        }
      }
    } catch (err) {
      console.log('❌ Welcome event error:', err)
    }
  })
}

module.exports = {
  handleWelcomeCommand,
  handleWelcomeEvent
}
