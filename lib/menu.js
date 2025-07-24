module.exports = (prefix, runtime) => {
  return `╭───⌈  *✨ Lx-Bot Menu*  ⌋
│
│ ⏱️ *Runtime:* ${runtime}
│ 🔖 *Prefix:* "${prefix}"
│ 🧑🏻‍💻 *Owner:* Lilith
│
├───📁 *Main Commands*
│ ➤ ${prefix}menu
│ ➤ ${prefix}ping
│ ➤ ${prefix}owner
│ ➤ ${prefix}runtime
│ ➤ ${prefix}sc
│
├───🎵 *Music & Download*
│ ➤ ${prefix}play [judul/link]
│ ➤ ${prefix}ytmp3 [link]
│ ➤ ${prefix}ytmp4 [link]
│ ➤ ${prefix}tiktokdl [link]
│ ➤ ${prefix}instagram [link]
│
├───🖼️ *Media Tools*
│ ➤ ${prefix}sticker
│ ➤ ${prefix}toimg
│ ➤ ${prefix}brat
│ ➤ ${prefix}img
│ ➤ ${prefix}.q (membuka view once)
│
├───👥 *Group Tools* (Admin Only)
│ ➤ ${prefix}tagall
│ ➤ ${prefix}welcome [on/off]
│ ➤ ${prefix}kick @user
│ ➤ ${prefix}add <nomor>
│ ➤ ${prefix}promote @user
│ ➤ ${prefix}demote @user
│ ➤ ${prefix}leave
│
╰───⌈ 🛠️ Bot by Lilith • Baileys ⌋

📌 *Note:* Harap gunakan prefix "${prefix}" sebelum command.
📎 *Edit source?* Cantumkan nama author ya :)

🕒 *${new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta'
  })}*
`
}
