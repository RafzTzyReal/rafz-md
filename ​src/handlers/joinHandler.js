const config = require('../config/config');

async function checkJoinMiddleware(ctx, next) {
    // Abaikan check jika update tidak memiliki properti chat/from
    if (!ctx.from || !ctx.chat) return next();

    // Izinkan command callback / cek_lagi masuk agar tidak looping stuck
    if (ctx.callbackQuery && ctx.callbackQuery.data === 'cek_lagi') {
        return next();
    }

    try {
        const member = await ctx.telegram.getChatMember(config.groupId, ctx.from.id);
        const allowedStatus = ['creator', 'administrator', 'member'];

        if (allowedStatus.includes(member.status)) {
            return next();
        } else {
            return sendJoinRequest(ctx);
        }
    } catch (error) {
        console.error('[ERROR CHECK JOIN]', error.message);
        // Jika bot belum masuk grup atau salah ID, loloskan sementara agar tidak crash namun beri log
        return next();
    }
}

function sendJoinRequest(ctx) {
    const text = `❌ *Akses Ditolak!*\n\nAnda harus bergabung ke grup resmi terlebih dahulu untuk menggunakan seluruh fitur bot *RAFZ MD*.`;
    const keyboard = {
        inline_keyboard: [
            [{ text: '📢 Join Group', url: config.groupUrl }],
            [{ text: '🔄 Cek Lagi', callback_data: 'cek_lagi' }]
        ]
    };

    if (ctx.callbackQuery) {
        return ctx.answerCbQuery('❌ Anda belum join grup!', { show_alert: true });
    } else {
        return ctx.replyWithMarkdownV2(text.replace(/[-_.*+?^${}()|[\]\\]/g, '\\$&'), { reply_markup: keyboard });
    }
}

module.exports = { checkJoinMiddleware, sendJoinRequest };
