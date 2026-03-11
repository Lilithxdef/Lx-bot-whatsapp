// lib/tiktokmp3.js
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const q = args[0];

  if (!q) {
    return sock.sendMessage(from, { text: "❌ Kirim link TikTok!\n\nContoh: .tiktokmp3 https://vt.tiktok.com/xxxx" }, { quoted: msg });
  }

  const output = path.join(__dirname, "../tmp", `tiktok_${Date.now()}.mp3`);

  sock.sendMessage(from, { text: "⏳ Sedang mengambil audio dari TikTok..." }, { quoted: msg });

  exec(`yt-dlp -x --audio-format mp3 -o "${output}" "${q}"`, async (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error:", err);
      return sock.sendMessage(from, { text: "❌ Gagal mengunduh audio TikTok." }, { quoted: msg });
    }

    try {
      const audio = fs.readFileSync(output);
      await sock.sendMessage(from, {
        audio,
        mimetype: "audio/mpeg",
        ptt: false,
      }, { quoted: msg });

      fs.unlinkSync(output); // hapus file setelah dikirim
    } catch (e) {
      console.error("❌ Gagal kirim audio:", e);
      sock.sendMessage(from, { text: "❌ Error saat mengirim audio." }, { quoted: msg });
    }
  });
};
