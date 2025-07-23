// menu.js
module.exports = (prefix, runtime) => {
  return `╭───❖ *Lx-Bot Menu*

📦 *Main Commands*
├ .menu
├ .ping
├ .owner
├ .runtime

🎵 *Music & Download*
├ .play [judul/link]
├ .ytmp3 [link]
├ .ytmp4 [link]
├ .tiktokdl [link]

🖼️ *Media Tools*
├ .sticker
├ .toimg
├ .brat
├ .qc

🧰 *group*
├ .tagall
├ .welcome[ON,OFF)
╰─────❖
*harap gunakan prefix = (.)*
─────────────────────
❗bot masih dalam pengembangan mohon bersabar saat menunggu media dikirim.

🔧 _Bot by Lilith • Baileys_ 
*recode/edit source code  harap cantumkan nama author*\n\n*-Lx-bot-whatsapp*
🕒 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
`
}
