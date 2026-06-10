const userTimestamps = new Map();
const COOLDOWN_TIME = 2000; // 2 Detik Anti-Spam

function rateLimitMiddleware(ctx, next) {
    if (!ctx.from) return next();

    const userId = ctx.from.id;
    const now = Date.now();

    if (userTimestamps.has(userId)) {
        const lastSeen = userTimestamps.get(userId);
        if (now - lastSeen < COOLDOWN_TIME) {
            if (ctx.callbackQuery) {
                return ctx.answerCbQuery('⚠️ Jangan spam! Tunggu beberapa saat.', { show_alert: true });
            }
            return ctx.reply('⚠️ *Anti-Spam Mode:* Mohon beri jeda 2 detik antar instruksi.', { parse_mode: 'Markdown' });
        }
    }

    userTimestamps.set(userId, now);
    return next();
}

module.exports = { rateLimitMiddleware };
