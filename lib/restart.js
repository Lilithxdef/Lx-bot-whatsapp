async function restartBot(sock, msg, from, sender, ownerNumber) {
    if (!ownerNumber.includes(sender.split('@')[0])) {
        await sock.sendMessage(from, { text: '❌ Fitur ini hanya untuk Owner!' }, { quoted: msg })
        return
    }

    await sock.sendMessage(from, { text: '♻️ *Bot sedang direstart...*' }, { quoted: msg })
    setTimeout(() => {
        process.exit(1)
    }, 1000)
}

module.exports = restartBot
