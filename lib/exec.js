
const { exec } = require('child_process')

module.exports = async (sock, m, text, isOwner) => {
  const reply = (msg) => sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m })

  if (!isOwner) return reply('❌ Khusus owner.')
  if (!text) return reply('💻 Contoh: .exec ls -lh')

  const blacklist = ['rm', 'reboot', 'shutdown', 'mkfs', 'kill', 'dd', 'wget', 'curl']
  if (blacklist.some(cmd => text.toLowerCase().includes(cmd)))
    return reply('❌ Command berbahaya diblokir.')

  exec(text, (err, stdout, stderr) => {
    if (err) return reply(`❌ Error:\n${err.message}`)
    if (stderr) return reply(`⚠️ Stderr:\n${stderr}`)

    let output = stdout.trim()
    if (output.length > 4000) output = output.slice(0, 4000) + '\n\n[Output terlalu panjang, dipotong...]'
    reply(`📤 Output:\n\n${output || '✅ Berhasil, tapi tidak ada output.'}`)
  })
}
