const { Telegraf, session } = require('telegraf');
const path = require('path');
require('dotenv').config();

const config = require('./src/config/config');
const { checkJoinMiddleware } = require('./src/handlers/joinHandler');
const { rateLimitMiddleware } = require('./src/handlers/rateLimitHandler');
const mainCommands = require('./src/commands/mainCommands');
const downloaderHandler = require('./src/handlers/downloaderHandler');
const uploaderHandler = require('./src/handlers/uploaderHandler');

if (!config.botToken) {
    console.error('[ERROR] BOT_TOKEN tidak ditemukan di file .env');
    process.exit(1);
}

const bot = new Telegraf(config.botToken);

// Middleware bawaan Telegraf untuk session tracking
bot.use(session());

// Custom Global Middlewares
bot.use(rateLimitMiddleware);
bot.use(checkJoinMiddleware);

// Inisialisasi Fitur & Command Router
mainCommands(bot);
downloaderHandler(bot);
uploaderHandler(bot);

// Global Error Handler
bot.catch((err, ctx) => {
    console.error(`[CRITICAL ERROR] Update ${ctx.update.update_id} menimbulkan error:`, err);
    ctx.reply('❌ Terjadi kesalahan internal pada server bot. Hubungi Developer jika masalah berlanjut.').catch(() => {});
});

// Booting Process
bot.launch().then(() => {
    console.log('==================================================');
    console.log('🤖 RAFZ MD BOT TELAH AKTIF DAN SIAP DIGUNAKAN');
    console.log(`🔗 Owner: ${config.ownerUrl}`);
    console.log(`📢 Group Target: ${config.groupUrl}`);
    console.log('==================================================');
}).catch((err) => {
    console.error('[ERROR] Gagal menyalakan bot:', err);
});

// Graceful Shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
