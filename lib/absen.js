const fs = require('fs')
const path = require('path')
const moment = require('moment-timezone')
const cron = require('node-cron')

const dbFile = path.join(__dirname, 'absen.json')

// 🔁 Auto reset absen tiap jam 00:00 WIB
cron.schedule('0 0 * * *', () => {
  if (!fs.existsSync(dbFile)) return
  const db = JSON.parse(fs.readFileSync(dbFile))
  for (const groupId in db) {
    db[groupId] = {} // reset semua absen
  }
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
  console.log('⏰ Absen harian direset otomatis.')
}, { timezone: 'Asia/Jakarta' })

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const name = msg.pushName || 'Tanpa Nama'
  const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD')

  // Baca database
  let db = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile)) : {}
  if (!db[from]) db[from] = {}
  if (!db[from][today]) db[from][today] = {}

  const action = args[0]?.toLowerCase()

  // 📋 Tampilkan list absen
  if (action === 'list') {
    const list = db[from]?.[today]
    if (!list || Object.keys(list).length === 0) {
      return sock.sendMessage(from, { text: '📭 Belum ada yang absen hari ini.' }, { quoted: msg })
    }

    const teks = Object.entries(list).map(([id, nama], i) =>
      `${i + 1}. @${id.split('@')[0]} - ${nama}`
    ).join('\n')

    return sock.sendMessage(from, {
      text: `📋 *List Absen Hari Ini:*\n\n${teks}`,
      mentions: Object.keys(list)
    }, { quoted: msg })
  }

  // ✅ Lakukan absen
  if (db[from][today][sender]) {
    return sock.sendMessage(from, { text: '✅ Kamu sudah absen hari ini.' }, { quoted: msg })
  }

  db[from][today][sender] = name
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))

  return sock.sendMessage(from, { text: `📌 Absen tercatat. Terima kasih, ${name}.` }, { quoted: msg })
}
