
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

// ===== LIBRARY BOT =====
const prefix = '.'
const hidetag = require('./lib/hidetag')
const getStats = require('./lib/stat')
const restartBot = require('./lib/restart')
const fbdl = require('./lib/fbdl')
const googleImg = require('./lib/img')
const viewonce = require('./lib/viewonce')
const antiView = require('./lib/antiview')
const { chatAI } = require('./lib/ai')
const owner = require('./lib/owner')
const handleAutoResponse = require('./lib/autoresponse')
const menu = require('./lib/menu')(prefix)
const { instaYTDLP } = require('./lib/instagram')
const play = require('./lib/play')
const ytmp4 = require('./lib/ytmp4')
const absen = require('./lib/absen')
const ytmp3 = require('./lib/ytmp3')
const sticker = require('./lib/sticker')
const toimg = require('./lib/toimg')
const bratifyMedia = require('./lib/brat')
const tiktokmp3 = require('./lib/tiktokmp3')
const tiktokdl = require('./lib/tiktokdl')
const tagAll = require('./lib/tagall')
const groupCommand = require('./lib/group')
const joinGroup = require('./lib/group/join')
const jadibot = require(`./lib/panduan`)
const leaveGroup = require('./lib/group/leave')
const { handleWelcomeCommand, handleWelcomeEvent } = require('./lib/welcome')
let aiAutoReplyEnabled = true;
async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
  version: await fetchLatestBaileysVersion().then(res => res.version),
  auth: state,
  logger: P({ level: 'silent' }),
  browser: ['Ubuntu', 'Firefox', '120.0.0'],
  patchMessageBeforeSending: (message) => {
   const needsPatch = !!(
     message.buttonsMessage ||
     message.templateButtons ||
     message.listMessage
   )
   if (needsPatch) {
     message = {
       viewOnceMessage: {
         message: {
           messageContextInfo: {},
           ...message
         }
       }
     }
   }
   return message
 }
})

sock.ev.on('creds.update', saveCreds)

handleWelcomeEvent(sock)

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
sock.ev.on('messages.upsert', async ({ messages, type }) => {

  // ⛔ Skip pesan lama saat bot mati
  if (type !== 'notify') return

  const msg = messages[0]
  if (!msg.message || !msg.key || !msg.key.remoteJid) return

  const from = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const isGroup = from.endsWith('@g.us')
  const groupMetadata = isGroup ? await sock.groupMetadata(from) : null

  // ✅ Ganti nama supaya tidak tabrakan
  const msgType = Object.keys(msg.message)[0]

  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message[msgType]?.text ||
    msg.message[msgType]?.caption ||
    msg.message[msgType]?.message?.conversation ||
    ''
  const prefix = '.'
  const isCmd = body.startsWith(prefix)
  const runtime = (() => {
    const uptime = process.uptime()
    const pad = s => s.toString().padStart(2,'0')
    const h = Math.floor(uptime / 3600)
    const m = Math.floor((uptime % 3600) / 60)
    const d = Math.floor(h / 24)
    return `${d}d ${pad(h % 24)}h ${pad(m)}m`
  })()
  const command = isCmd
    ? body.slice(prefix.length).trim().split(/ +/)[0].toLowerCase()
    : ''

  const args = isCmd
    ? body.slice(prefix.length).trim().split(/ +/).slice(1)
    : []

  const q = args.join(' ')

  console.log(`📩 ${isGroup ? 'Group' : 'Private'} from ${from}: ${body}`)

  if (!from.endsWith('@s.whatsapp.net') && !from.endsWith('@lid')) {
    console.log('⛔ Auto-respon diblokir (bukan user/grup):', from)
    return
  }

// Auto Response hanya untuk pesan biasa (non-command) (hapus tanda // dibawah ini sebelum if untuk mengaktifkan)
 await handleAutoResponse(sock, msg, from, isCmd)
if (isCmd) {
if (command === 'menu') {
  const from = msg.key.remoteJid
  const sender = msg.key.fromMe ? sock.user.id : (msg.key.participant || msg.key.remoteJid)
  const senderName = msg.pushName || 'Kak'

  let profilePic
  try {
    profilePic = await sock.profilePictureUrl(sender, 'image')
  } catch {
    profilePic = 'https://telegra.ph/file/265c672094dfa87caea19.jpg'
  }

  const menuText = require('./lib/menu')(prefix, runtime)

  const caption = `
╭───❖ *Lx-Bot Menu* ❖───╮
│ 👋 Halo kak *${senderName}*!
│ *Gunakan prefix ${prefix} sebelum perintah*
╰──────────────────────╯

${menuText}
`.trim()

  await sock.sendMessage(from, {
    image: { url: profilePic },
    caption
  }, { quoted: msg })
} else if (command === 'aion') {
  aiAutoReplyEnabled = true
  await sock.sendMessage(from, { text: '✅ AI Auto Reply diaktifkan!' }, { quoted: msg })
} else if (command === 'aioff') {
  aiAutoReplyEnabled = false
  await sock.sendMessage(from, { text: '❌ AI Auto Reply dimatikan!' }, { quoted: msg })
} else if (command === 'ai') {
  if (!args[0]) return await sock.sendMessage(from, { text: '💬 Contoh: .ai siapa presiden indonesia?' }, { quoted: msg })

  const textnya = args.join(' ')
  await sock.sendMessage(from, { text: '💬 LX-AI sedang berpikir...' }, { quoted: msg })
  const hasil = await chatAI(textnya)
  await sock.sendMessage(from, { text: hasil }, { quoted: msg })
} else if (command === 'info' || command === 'stats') {
    const statusText = await getStats()
    await sock.sendMessage(from, { text: statusText }, { quoted: msg })
} else if (command === 'restart') {
  try {
    const fs = require('fs')
    const path = require('path')

    const ownerFile = fs.readFileSync(path.join(__dirname, 'lib/owner.js'), 'utf8')
    const ownerNumbers = Array.from(ownerFile.matchAll(/\b\d{10,15}\b/g)).map(m => m[0])
    const senderNumber = sender.split('@')[0]
       if (!ownerNumbers.includes(senderNumber)) {
      await sock.sendMessage(from, { text: '❌ Hanya owner yang bisa restart bot!' }, { quoted: msg })
      console.log(`[BLOCK] ${senderNumber} mencoba restart bot.`)
      return
    }

    console.log(`[RESTART] Diminta oleh owner ${senderNumber}`)
    await sock.sendMessage(from, { text: '♻️ Restarting koneksi bot...' }, { quoted: msg })

    try {
      await sock.ws.close()
      sock.ev.removeAllListeners()
      console.log('[SOCKET] Koneksi lama ditutup dan event listener dibersihkan.')
    } catch (err) {
      console.error('[WARN] Gagal menutup socket lama:', err.message)
    }

    global.sock = null

      setTimeout(async () => {
      try {
        console.log('[SOCKET] Membuat koneksi baru...')
        const newSock = await startSock() // buat koneksi ulang
        global.sock = newSock
        console.log('[SOCKET] Bot berhasil direstart & reconnect!')

        // Kirim konfirmasi ke WA
        await newSock.sendMessage(from, { text: '✅ Bot berhasil direstart & aktif kembali!' })
        console.log('[INFO] Konfirmasi restart terkirim ke WhatsApp.')
      } catch (e) {
        console.error('[ERR] Gagal reconnect:', e.message)
      }
    }, 5000)

  } catch (err) {
    console.error(`[ERR] .restart → ${err.message}`)
    await sock.sendMessage(from, { text: `⚠️ Gagal restart: ${err.message}` }, { quoted: msg })
  }
} else if (command === 'play') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan judul atau link YouTube.' }, { quoted: msg })
  await play(sock, msg, args.join(' '))
} else if (command === 'tagall') {
  await tagAll(sock, msg, args)
} else if (command === 'ytmp4') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link YouTube!' }, { quoted: msg })
  await ytmp4(sock, msg, args[0])
} else if (command === 'ytmp3') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link YouTube!' }, { quoted: msg })
  await ytmp3(sock, msg, args[0])
} else if (command === 'welcome') {
  await handleWelcomeCommand(sock, msg, from, command, args, isGroup, sender, groupMetadata)
} else if (['kick', 'add', 'promote', 'demote'].includes(command)) {
  await groupCommand(sock, msg, command, args)
} else if (command === 'tiktokdl') {
  if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link TikTok!' }, { quoted: msg })
  await tiktokdl(sock, msg, args[0])
} else if (command === "tiktokmp3") {
  await tiktokmp3(sock, msg, args);
} else if (command === 'runtime') {
  await sock.sendMessage(from, { text: `⏱️ Bot sudah berjalan: ${runtime}` })
} else if (command === 'sticker' || command === '.stker' || command === '.s') {
  await sticker(sock, msg)
} else if (command === 'ping') {
  const now = new Date().getTime()
  const latency = now - msg.messageTimestamp * 1000
  await sock.sendMessage(from, { text: `🏓 *Pong!*\n📶 Respon: *${latency} ms*` }, { quoted: msg })
} else if (command === 'insta' | command === 'igdl') {
  await require('./lib/instagram')(sock, msg, args)
} else if (command === 'hidetag') {
  await hidetag(sock, msg, args)
} else if (command === 'tagall') {
  await tagAll(sock, msg, from, sender, groupMetadata, args)
} else if (command === 'absen') {
  await absen(sock, msg, args)
} else if (command === 'img') {
  await googleImg(sock, msg, q)
} else if (command === 'Rk') {
  await joinGroup(sock, msg, args)
} else if (command === 'leave') {
  await leaveGroup(sock, msg)
} else if (command === 'toimg') {
  await toimg(sock, msg)
} else if (command === 'fbdl') {
  await fbdl(sock, msg, args)
} else if (command === "tentang") {
  await jadibot(sock, msg)
} else if (command === 'brat') {
  await bratifyMedia(sock, msg, args.join(' '))
} else if (command === 'runtime') {
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
🧩 *Node.js:* ${nodev}\n\n di jalankan oleh: *lilith*
`.trim()

  await sock.sendMessage(from, { text: info }, { quoted: msg })
} else if (command === 'q' || command === 'viewonce') {
  await antiView(sock, msg)
} else if (command === 'viewonce' || command === 'qr') {
  await antiView(sock, msg, store)
} else if (command === 'sc') {
        await sock.sendMessage(from, {
          text: `📦 *Source Code Lx-bot*\n\n📁 GitHub:\nhttps://github.com/lilithxdef/Lx-bot-whatsapp`
        }, { quoted: msg })
} else if (command === 'owner') {
  await owner(sock, msg)

    }
    }
  })
}

startSock()
