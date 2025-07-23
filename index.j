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
const execShell = require('./lib/exec')
const antiView = require('./lib/antiview')
const owner = require('./lib/owner')
const handleAutoResponse = require('./lib/autoresponse')
const menu = require('./lib/menu')
const play = require('./lib/play')
const ytmp3 = require('./lib/ytmp3')
const sticker = require('./lib/sticker')
const toimg = require('./lib/toimg')
const ai = require('./lib/ai')
const bratifyMedia = require('./lib/brat')
const tiktokdl = require('./lib/tiktokdl')

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    version: await fetchLatestBaileysVersion().then(res => res.version),
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['Ubuntu', 'Firefox', '120.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

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

  if (!from.endsWith('@s.whatsapp.net') && !from.endsWith('@g.us')) {
    console.log('⛔ Diblokir: Pesan dari non-user atau channel:', from)
    return
  }

  const isGroup = from.endsWith('@g.us')
  const type = Object.keys(msg.message)[0]
  const body =
    msg.message.conversation ||
    msg.message[type]?.text ||
    msg.message[type]?.caption ||
    msg.message[type]?.message?.conversation ||
    ''
  const isCmd = body.startsWith('.')
  const command = isCmd ? body.trim().split(/ +/).shift().toLowerCase() : ''
  const args = body.trim().split(/ +/).slice(1)

  console.log(`📩 ${isGroup ? 'Group' : 'Private'} from ${from}: ${body}`)

  // Auto Response
  await handleAutoResponse(sock, msg, from, isCmd)

    // Handler command
    if (isCmd) {
  switch (command) {
    case '.menu': {
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
      break
    }

    case '.play':
      if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan judul atau link YouTube.' }, { quoted: msg })
      await play(sock, msg, args.join(' '))
      break

    case '.ytmp3':
      if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link YouTube!' }, { quoted: msg })
      await ytmp3(sock, msg, args[0])
      break

    case '.tiktokdl':
      if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link TikTok!' }, { quoted: msg })
      await tiktokdl(sock, msg, args[0])
      break

    case '.sticker':
    case '.stker':
    case '.s':
      await sticker(sock, msg)
      break

    case '.ai':
      if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan pertanyaan!' }, { quoted: msg })
      await ai(sock, msg, args.join(' '))
      break

    case '.ping': {
      const now = new Date().getTime()
      const latency = now - msg.messageTimestamp * 1000
      await sock.sendMessage(from, { text: `🏓 *Pong!*\n📶 Respon: *${latency} ms*` }, { quoted: msg })
      break
    }

    case '.runtime': {
      const os = require('os')
      const uptime = process.uptime()
      const pad = (s) => s.toString().padStart(2, '0')
      const h = Math.floor(uptime / 3600)
      const m = Math.floor((uptime % 3600) / 60)
      const d = Math.floor(h / 24)
      const runtime = `${d}d ${pad(h % 24)}h ${pad(m)}m`

      const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0)
      const freeMem = (os.freemem() / 1024 / 1024).toFixed(0)
      const usedMem = totalMem - freeMem

      const platform = os.platform()
      const arch = os.arch()
      const nodev = process.version

      const info = `
⏱ *Runtime:* ${runtime}
📱 *Device:* ${platform} ${arch}
🧠 *RAM:* ${usedMem} MB / ${totalMem} MB
🧩 *Node.js:* ${nodev}

Dijalankan oleh: *Lilith*
`.trim()

      await sock.sendMessage(from, { text: info }, { quoted: msg })
      break
    }

    case '.img':
      await googleImg(sock, msg)
      break

    case '.toimg':
      await toimg(sock, msg)
      break

    case '.ytsearch':
      await ytSearch(sock, msg)
      break

    case '.brat':
      await bratifyMedia(sock, msg, args.join(' '))
      break

    case '.ban':
    case '.unban':
      await banUser(sock, msg, sender, from, command, ownerNumber)
      break

    case '.q':
      await antiView(sock, msg)
      break

    case '.exec':
      await execShell(sock, msg, text, isOwner)
      break

    case '.listban':
      await listBanHandler(sock, msg)
      break

    case '.sc':
      await sock.sendMessage(from, {
        text: `📦 *Source Code Lx-bot*\n\n📁 GitHub:\nhttps://github.com/lilithxdef\n\n🧠 Dibuat oleh *LilithXdef* menggunakan *Baileys*.\n📌 Jangan lupa kasih star ya!`
      }, { quoted: msg })
      break

    case '.owner':
      await owner(sock, msg)
      break
  }
}
