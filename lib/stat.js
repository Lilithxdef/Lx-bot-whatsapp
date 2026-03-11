const os = require('os')
const process = require('process')

function formatTime(seconds) {
    const pad = (s) => (s < 10 ? '0' : '') + s
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
}

async function getStats() {
    const uptime = process.uptime()
    const usedMem = (os.totalmem() - os.freemem()) / (1024 * 1024)
    const totalMem = os.totalmem() / (1024 * 1024)
    const cpuLoad = os.loadavg()[0].toFixed(2)
    const platform = os.platform()
    const arch = os.arch()
    const nodeVer = process.version
    const username = os.userInfo().username

    return `
📊 *Bot Status*

⏱️ *Uptime:* ${formatTime(uptime)}
💾 *RAM:* ${usedMem.toFixed(2)} MB / ${totalMem.toFixed(2)} MB
🧠 *CPU Load:* ${cpuLoad}
💻 *Platform:* ${platform} (${arch})
🔩 *NodeJS:* ${nodeVer}
👤 *User:* ${username}
✅ *Status:* Online & Aktif
`.trim()
}

module.exports = getStats
