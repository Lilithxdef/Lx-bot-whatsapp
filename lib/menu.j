// lib/menuCatalog.js
module.exports = (prefix, runtime, senderName) => {
  return {
    productMessage: {
      product: {
        productImage: {
          url: 'https://raw.githubusercontent.com/Lilithxdef/Lx-bot-whatsapp/main/Lx-bot.png'
        },
        title: '✨ Lx-Bot Menu',
        description: `
Halo kak *${senderName}*!
Gunakan prefix "${prefix}" sebelum perintah
Runtime: ${runtime}

📁 Main Commands:
${prefix}menu, ${prefix}ping, ${prefix}owner, ${prefix}runtime, ${prefix}sc, ${prefix}tentang

🎵 Music & Download:
${prefix}play, ${prefix}ytmp3, ${prefix}ytmp4, ${prefix}tiktokmp3, ${prefix}tiktokdl, ${prefix}insta

🖼️ Media Tools:
${prefix}sticker, ${prefix}toimg, ${prefix}brat, ${prefix}img, ${prefix}q (view once)

👥 Group Tools:
${prefix}absen, ${prefix}absen list, ${prefix}tagall, ${prefix}hidetag, ${prefix}welcome, ${prefix}kick, ${prefix}add, ${prefix}promote, ${prefix}demote, ${prefix}leave

Bot by Lilith
        `.trim(),
        retailerId: 'lx-bot'
      },
      businessOwnerJid: '62881023683976@s.whatsapp.net' // owner WA
    }
  }
}
