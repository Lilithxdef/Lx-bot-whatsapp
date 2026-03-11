module.exports = async (sock, msg) => {
  // daftar owner kamu
  const owners = [
    {
      name: 'Lilith raja iblis',
      number: '62881023683976'
    }
    // Tambah owner lain di sini jika perlu
  ]

  // bikin format vcard
  const vcards = owners.map(owner => ({
    displayName: owner.name,
    vcard: `BEGIN:VCARD
VERSION:3.0
FN:${owner.name}
TEL;type=CELL;type=VOICE;waid=${owner.number}:+${owner.number}
END:VCARD`
  }))

  // pesan kontak WhatsApp
  const contactMessage = {
    contacts: {
      displayName: '👑 Owner Lx-bot',
      contacts: vcards
    }
  }

  // kirim ke chat yang minta
  await sock.sendMessage(msg.key.remoteJid, contactMessage, { quoted: msg })
}
