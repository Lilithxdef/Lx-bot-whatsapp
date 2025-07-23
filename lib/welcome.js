const fs = require('fs')
const path = './lib/database/welcome.json'

// Inisialisasi database jika belum ada
if (!fs.existsSync(path)) fs.writeFileSync(path, '{}')

// Load database
function loadDB() {
  return JSON.parse(fs.readFileSync(path))
}

// Simpan database
function saveDB(db) {
  fs.writeFileSync(path, JSON.stringify(db, null, 2))
}

// Cek status welcome
function isWelcomeOn(groupId) {
  const db = loadDB()
  return db[groupId] === true
}

// Set status welcome
function setWelcome(groupId, value) {
  const db = loadDB()
  db[groupId] = value
  saveDB(db)
}

// Handler command .welcome
async function handleWelcomeCommand(sock, msg, from, command, args, isGroup, sender, groupMetadata) {
  const isAdmin = isGroup && groupMetadata?.participants?.find(p => p.id === sender && p.admin)
  if (!isGroup) {
    return sock.sendMessage(from, { text: '❌ Hanya bisa digunakan di grup.' }, { quoted: msg })
  }
  if (!isAdmin) {
    return sock.sendMessage(from, { text: '❌ Hanya admin yang bisa mengatur welcome.' }, { quoted: msg })
  }

  if (!args[0]) {
    return sock.sendMessage(from, {
      text: `Penggunaan:\n.welcome on\n.welcome off\n\nStatus saat ini: ${isWelcomeOn(from) ? '*ON*' : '*OFF*'}`
    }, { quoted: msg })
  }

  if (args[0] === 'on') {
    setWelcome(from, true)
    sock.sendMessage(from, { text: '✅ Welcome telah *diaktifkan*!' }, { quoted: msg })
  } else if (args[0] === 'off') {
    setWelcome(from, false)
    sock.sendMessage(from, { text: '✅ Welcome telah *dimatikan*!' }, { quoted: msg })
  } else {
    sock.sendMessage(from, { text: '❌ Gunakan `.welcome on` atau `.welcome off`' }, { quoted: msg })
  }
}

// Handler event grup: join, leave, promote, demote
async function handleWelcomeEvent(sock, update) {
  try {
    const metadata = await sock.groupMetadata(update.id)
    const isWelcome = isWelcomeOn(update.id)
    const groupName = metadata.subject

    if (!['add', 'remove', 'promote', 'demote'].includes(update.action)) return

    for (let jid of update.participants) {
      let pp = 'https://telegra.ph/file/0d7d4431e3c5817f6f62b.jpg'
      try {
        pp = await sock.profilePictureUrl(jid, 'image')
      } catch {}

      const namaUser = metadata.participants.find(p => p.id === jid)?.notify || 'Pengguna'
      const username = `@${jid.split('@')[0]}`

      // Welcome
      if (update.action === 'add' && isWelcome) {
        const teks = `👋 Selamat datang ${username} di grup *${groupName}*!\nSemoga betah ya.`
        await sock.sendMessage(update.id, {
          image: { url: pp },
          caption: teks,
          mentions: [jid]
        })
      }

      // Farewell
      if (update.action === 'remove' && isWelcome) {
        const teks = `👋 Selamat tinggal ${username}.\nSemoga sukses di luar sana! 👋`
        await sock.sendMessage(update.id, {
          image: { url: pp },
          caption: teks,
          mentions: [jid]
        })
      }

      // Promote
      if (update.action === 'promote') {
        const teks = `✅ *Promote Admin*\n👤 ${namaUser} (${username})\n📍 Grup: ${groupName}`
        await sock.sendMessage(update.id, {
          text: teks,
          mentions: [jid]
        })
      }

      // Demote
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
}

// Export
module.exports = {
  handleWelcomeCommand,
  handleWelcomeEvent
}
