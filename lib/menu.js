module.exports = (prefix, runtime) => {
  return `╭───⌈  *✨ Lx-Bot Menu*  ⌋
│
│ ⏱️ *Runtime:* ${runtime}
│ 🔖 *Prefix:* "${prefix}"
│ 🧑🏻‍💻 *Owner:* Lilithxdef
│
├───📁 *Main Commands*
│ ➤ ${prefix}menu
│ ➤ ${prefix}ping
│ ➤ ${prefix}owner
│ ➤ ${prefix}runtime
│ ➤ ${prefix}sc
│ ➤ ${prefix}tentang
├───🎵 *Music & Download*
│ ➤ ${prefix}play [judul/link]
│ ➤ ${prefix}ytmp3 [link]
│ ➤ ${prefix}ytmp4 [link]
│ ➤ ${prefix}tiktokmp3 [link]
│ ➤ ${prefix}tiktokdl [link]
│ ➤ ${prefix}insta [link]
│
├───🖼️ *Media Tools*
│ ➤ ${prefix}sticker
│ ➤ ${prefix}toimg
│ ➤ ${prefix}brat[teks]
│ ➤ ${prefix}img [judul gambar]
│ ➤ ${prefix}q (membuka view once)
│
├───👥 *Group Tools* (Admin Only)
│ ➤ ${prefix}absen
│ ➤ ${prefix}absen list
│ ➤ ${prefix}tagall
│ ➤ ${prefix}hidetag
│ ➤ ${prefix}welcome [on/off]
│ ➤ ${prefix}kick @user
│ ➤ ${prefix}add <nomor>
│ ➤ ${prefix}promote @user
│ ➤ ${prefix}demote @user
│ ➤ ${prefix}leave
│
╰───⌈ 🛠️ Bot by Lilith ⌋

📌 *Note:* Harap gunakan prefix "${prefix}" sebelum command.
🕒 *${new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta'
  })}*
`
}
