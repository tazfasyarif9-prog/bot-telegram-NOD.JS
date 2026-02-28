const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.TOKEN;

console.log("TOKEN ENV:", process.env.TOKEN);

const bot = new TelegramBot(token, { polling: true });

const USERS_FILE = './users.json';
const KEYS_FILE = './keys.json';

/* ================= DATABASE ================= */

function loadData(file) {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file));
}

function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let users = loadData(USERS_FILE);
let keys = loadData(KEYS_FILE);

/* ================= HELPER ================= */

function generateKey(days) {
    const code = "ATTA-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    keys[code] = { days: days, used: false };
    saveData(KEYS_FILE, keys);
    return code;
}

function checkExpired(userId) {
    if (users[userId] && users[userId].status === "premium") {
        const now = new Date();
        const exp = new Date(users[userId].expired);
        if (now > exp) {
            users[userId].status = "free";
            users[userId].expired = "-";
            saveData(USERS_FILE, users);
        }
    }
}

/* ================= MAIN HANDLER ================= */

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id.toString();

    if (!text) return;

    // Register user
    if (!users[userId]) {
        users[userId] = {
            username: msg.from.username || "-",
            status: "free",
            expired: "-"
        };
        saveData(USERS_FILE, users);
    }

    checkExpired(userId);

    if (!text.startsWith("/") && !text.startsWith(".")) return;

    const command = text.slice(1).split(" ")[0].toLowerCase();

    /* ================= START ================= */

    if (command === "start") {
    bot.sendMessage(chatId, `
✨ Selamat datang,
🤖 Saya adalah asisten pintar yang akan membantu Anda membuat userbot dengan mudah dan cepat.

━━━━━━━━━━━━━━━━━━━━━━
🔑 PANEL PRODYTICAL
🛒 BUY PACKAGE
🛒 BOT UNTUK GROUP
📊 ACCOUNT STATUS
🔑 ACTIVATE LICENSE
📦 MY LICENSE
📅 CHECK EXPIRED
💳 PAYMENT METHOD
📜 PRICE LIST
🎁 CLAIM BONUS
🔥 BEST SELLER
🛠 SUPPORT CENTER
📢 PROMO & DISCOUNT
🤝 RESELLER PROGRAM
📈 AFFILIATE SYSTEM
💼 PARTNER PROGRAM
⚙️ ACCOUNT SETTINGS
🧾 ORDER HISTORY
📤 DOWNLOAD UBOT
🔄 RENEW LICENSE

━━━━━━━━━━━━━━
⚡ PLAN LITE
⚡ PLAN BASIC
⚡ PLAN PREMIUM
⚡ PLAN PRO
⚡ PLAN VIP
⚡ PLAN ULTIMATE
⚡ PLAN ENTERPRISE
♾ LIFETIME ACCESS

𝑭𝑰𝑻𝑼𝑹 𝑷𝑹𝑶 𝑯𝑼𝑩𝑼𝑵𝑮𝑰 𝑨𝑫𝑴𝑰𝑵 𝑩𝑼𝒀 𝑼𝑩𝑶𝑻

━━━━━━━━━━━━━━━━━━━━━━
🏪 𝐀𝐓𝐓𝐀 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋 𝐔𝐁𝐎𝐓 𝐒𝐓𝐎𝐑𝐄
⚡ 𝐅𝐚𝐬𝐭 • 𝐒𝐞𝐜𝐮𝐫𝐞 • 𝐓𝐫𝐮𝐬𝐭𝐞𝐝
📞 𝐇𝐔𝐁𝐔𝐍𝐆𝐈 𝐀𝐃𝐌𝐈𝐍 : @bytzqw

Silakan lanjut.
👑 Owner: Atta
    `);
}

    /* ================= STATUS ================= */

    else if (command === "status") {
        bot.sendMessage(chatId, `
📊 STATUS AKUN

👤 @${users[userId].username}
Status: ${users[userId].status.toUpperCase()}
Expired: ${users[userId].expired}
        `);
    }

    /* ================= BUY ================= */

    else if (command === "buy") {
    bot.sendMessage(chatId, `
💎 DAFTAR PAKET UBOT 💎

🔰 TRIAL
• 7 Hari  - Rp 15.000
• 14 Hari - Rp 25.000

🥉 BASIC
• 30 Hari - Rp 50.000
• 60 Hari - Rp 90.000

🥈 PREMIUM
• 90 Hari  - Rp 120.000
• 180 Hari - Rp 200.000

🥇 VIP
• 365 Hari (1 Tahun) - Rp 350.000

♾ LIFETIME UNLIMITED
• Permanent Access - Rp 500.000
• PERPANJANG PERBULAN Rp.25.000

━━━━━━━━━━━━━━━━━
💳 Payment:
• Transfer Bank
• E-Wallet
• QRIS

📩 Kirim bukti transfer ke admin.
📞 𝐇𝐔𝐁𝐔𝐍𝐆𝐈 𝐀𝐃𝐌𝐈𝐍 : @bytzqw
    `);
}

    /* ================= REDEEM ================= */

    else if (command === "redeem") {
        const args = text.split(" ");
        if (args.length < 2) {
            return bot.sendMessage(chatId, "Gunakan: /redeem KEY");
        }

        const keyInput = args[1];

        if (!keys[keyInput]) {
            return bot.sendMessage(chatId, "❌ Key tidak valid.");
        }

        if (keys[keyInput].used) {
            return bot.sendMessage(chatId, "❌ Key sudah digunakan.");
        }

        const days = keys[keyInput].days;
        const exp = new Date();
        exp.setDate(exp.getDate() + days);

        users[userId].status = "premium";
        users[userId].expired = exp.toISOString().split("T")[0];
        keys[keyInput].used = true;

        saveData(USERS_FILE, users);
        saveData(KEYS_FILE, keys);

        bot.sendMessage(chatId, `✅ Premium aktif ${days} hari!\nExpired: ${users[userId].expired}`);
    }

    /* ================= OWNER INFO ================= */

else if (command === "owner") {
    bot.sendMessage(chatId, `
👑 OFFICIAL OWNER INFORMATION 👑

Nama Owner : Atta
Founder     : ATTA OFFICIAL UBOT STORE
Status      : Verified Developer
Reputasi    : ⭐⭐⭐⭐⭐ Trusted Seller

━━━━━━━━━━━━━━━━━━━━━━
🏪 ATTA OFFICIAL UBOT STORE
⚡ Fast • Secure • Professional
🔐 Sistem Aman & Terpercaya
📈 Ratusan User Aktif

📞 Hubungi Owner Resmi:
👉 @bytzqw

⚠️ Hati-hati penipuan!
Owner hanya menggunakan username di atas.
━━━━━━━━━━━━━━━━━━━━━━
    `);
}

    /* ================= GENKEY (OWNER) ================= */

    else if (command === "genkey") {
        if (msg.from.id !== OWNER_ID) {
            return bot.sendMessage(chatId, "🚫 Owner Only.");
        }

        const args = text.split(" ");
        if (args.length < 2) {
            return bot.sendMessage(chatId, "Gunakan: /genkey 30");
        }

        const days = parseInt(args[1]);
        const newKey = generateKey(days);

        bot.sendMessage(chatId, `🔑 Key dibuat:\n${newKey}\nDurasi: ${days} hari`);
    }

    /* ================= ID ================= */

    else if (command === "id") {
        bot.sendMessage(chatId, `
🆔 USER DETAIL
👤 Username: @${msg.from.username || "-"}
🔢 User ID: ${msg.from.id}
💬 Chat ID: ${chatId}
        `);
    }

    /* ================= HELP ================= */

    else if (command === "help") {
        bot.sendMessage(chatId,
            "Gunakan /buy untuk membeli ubot.\nGunakan /redeem KEY untuk aktifkan premium."
        );
    }
});

console.log("🚀 ATTA UBOT STORE RUNNING...");
