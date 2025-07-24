module.exports = async (sock, msg) => {
  const owners = [
    {
      name: 'Lilith raja iblis',
      number: '62881023683976'
    },
    {
      name: 'lilith juga:v',
      number: '6282182336561'
    }
    // Tambah owner lain di sini jika perlu
  ]

  const vcards = owners.map(owner => ({
    displayName: owner.name,
    vcard: `BEGIN:VCARD
VERSION:3.0
FN:${owner.name}
TEL;type=CELL;type=VOICE;waid=${owner.number}:+${owner.number.replace(/^62/, '62 ')}
END:VCARD`
  }))

  const contactMessage = {
    contacts: {
      displayName: 'Lilith kemren',
      contacts: vcards
    }
  }

  await sock.sendMessage(msg.key.remoteJid, contactMessage, { quoted: msg })
}
