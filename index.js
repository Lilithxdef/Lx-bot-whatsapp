const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')
const qrcode = require('qrcode-terminal')
const fetch = require('node-fetch')

// Import fitur
const googleImg = require('./lib/img')
const antiView = require('./lib/antiview')
const owner = require('./lib/owner')
const handleAutoResponse = require('./lib/autoresponse')
const menu = require('./lib/menu')
const play = require('./lib/play')
const ytmp4 = require('./lib/ytmp4')
const ytmp3 = require('./lib/ytmp3')
const sticker = require('./lib/sticker')
const toimg = require('./lib/toimg')
const bratifyMedia = require('./lib/brat')
const tiktokdl = require('./lib/tiktokdl')
const tagAll = require('./lib/tagall')
const { handleWelcomeCommand, handleWelcomeEvent } = require('./lib/welcome')
//const groupCmd = require('./lib/group')

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
  version: await fetchLatestBaileysVersion().then(res => res.version),
  auth: state,
  logger: P({ level: 'silent' }),
  browser: ['Ubuntu', 'Firefox', '120.0.0']
})

// Update kredensial saat terjadi perubahan
sock.ev.on('creds.update', saveCreds)

// ⬇️ PASANG di sini: Aktifkan fitur welcome
handleWelcomeEvent(sock)

// Tangani koneksi (QR code, reconnect, status)
sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
  if (qr) {
    console.log('📲 Scan QR berikut:')
    qrcode.generate(qr, { small: true })
  }

  if (connection === 'close') {
    console.log('❌ Koneksi terputus.')
    console.log('📛 Detail error:', lastDisconnect?.error)
    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    if (shouldReconnect) startSock()
  } else if (connection === 'open') {
    console.log('✅ Bot siap! Terhubung sebagai:', sock.user.id)
  }
})
sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0]
  if (!msg.message || !msg.key || !msg.key.remoteJid) return

  const from = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const isGroup = from.endsWith('@g.us')
  const groupMetadata = isGroup ? await sock.groupMetadata(from) : null

  const type = Object.keys(msg.message)[0]
  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message[type]?.text ||
    msg.message[type]?.caption ||
    msg.message[type]?.message?.conversation ||
    ''

  const isCmd = body.startsWith('.')
  const command = isCmd ? body.trim().split(/ +/)[0].toLowerCase() : ''
  const args = body.trim().split(/ +/).slice(1)
  const q = args.join(' ')

console.log(`📩 ${isGroup ? 'Group' : 'Private'} from ${from}: ${body}`)

// Hindari channel/saluran
if (!from.endsWith('@s.whatsapp.net') && !from.endsWith('@g.us')) {
  console.log('⛔ Auto-respon diblokir (bukan user/grup):', from)
  return
}

// Auto Response hanya untuk pesan biasa (non-command)
if (!isCmd) await handleAutoResponse(sock, msg, from, isCmd)
    // Handler command
    if (isCmd) {
if (command === '.menu') {
  const from = msg.key.remoteJid
  const sender = msg.key.fromMe ? sock.user.id : (msg.key.participant || msg.key.remoteJid)
  const senderName = msg.pushName || 'Kak'

  let profilePic
  try {
    profilePic = await sock.profilePictureUrl(sender, 'image')
  } catch {
    profilePic = 'https://telegra.ph/file/265c672094dfa87caea19.jpg'
  }

  const menuText = await require('./lib/menu')('.')

  const caption = `
╭───❖ *Lx-Bot Menu* ❖───╮
│ 👋 Halo kak *${senderName}*!
│ *Gunakan prefix (.) sebelum perintah*
╰──────────────────────╯

${menuText}
`.trim()

  await sock.sendMessage(from, {
    image: { url: profilePic },
    caption
  }, { quoted: msg })
} else if (command === '.play') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan judul atau link YouTube.' }, { quoted: msg })
  await play(sock, msg, args.join(' '))
} else if (command === '.tagall') {
  await tagAll(sock, msg, args)
} else if (command === '.ytmp4') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link YouTube!' }, { quoted: msg })
  await ytmp4(sock, msg, args[0])
} else if (command === '.ytmp3') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link YouTube!' }, { quoted: msg })
  await ytmp3(sock, msg, args[0])
} else if (command === '.welcome') {
  await handleWelcomeCommand(sock, msg, from, command, args, isGroup, sender, groupMetadata)
} else if (command === '.tiktokdl') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link TikTok!' }, { quoted: msg })
  await tiktokdl(sock, msg, args[0])
} else if (command === '.sticker' || command === '.stker' || command === '.s') {
  await sticker(sock, msg)
} else if (command === '.ping') {
  const now = new Date().getTime()
  const latency = now - msg.messageTimestamp * 1000
  await sock.sendMessage(from, { text: `🏓 *Pong!*\n📶 Respon: *${latency} ms*` }, { quoted: msg })
} else if (command === '.tagall') {
  await tagAll(sock, msg, from, sender, groupMetadata, args)
} else if (command === '.img') {
  await googleImg(sock, msg, q)
} else if (command === '.toimg') {
  await toimg(sock, msg)
} else if (command === '.brat') {
  await bratifyMedia(sock, msg, args.join(' '))
} else if (command === '.ban' || command === '.unban') {
  return await banUser(sock, msg, sender, from, command, ownerNumber)
} else if (command === '.runtime') {
  const os = require('os')

  // Runtime
  const uptime = process.uptime()
  const pad = (s) => s.toString().padStart(2, '0')
  const h = Math.floor(uptime / 3600)
  const m = Math.floor((uptime % 3600) / 60)
  const d = Math.floor(h / 24)
  const runtime = `${d}d ${pad(h % 24)}h ${pad(m)}m`

  // RAM
  const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0)
  const freeMem = (os.freemem() / 1024 / 1024).toFixed(0)
  const usedMem = totalMem - freeMem

  // Device info
  const platform = os.platform()      // contoh: linux, android
  const arch = os.arch()              // contoh: arm64
  const nodev = process.version       // Node.js version

  // Format message
  const info = `
⏱ *Runtime:* ${runtime}
📱 *Device:* ${platform} ${arch}
🧠 *RAM:* ${usedMem} MB / ${totalMem} MB
🧩 *Node.js:* ${nodev}\n\n di jalankan oleh: *lilith*
`.trim()

  await sock.sendMessage(from, { text: info }, { quoted: msg })
} else if (command === '.q') {
  await antiView(sock, msg)
} else if (command === '.sc') {
        await sock.sendMessage(from, {
          text: `📦 *Source Code Lx-bot*\n\n📁 GitHub:\nhttps://github.com/lilithxdef\n\n🧠 Dibuat oleh *LilithXdef* menggunakan *Baileys*.\n📌 Jangan lupa kasih star kalau suka ya ⭐`
        }, { quoted: msg })
} else if (command === '.owner') {
  await owner(sock, msg)

    }
    }
  })
}

startSock()
