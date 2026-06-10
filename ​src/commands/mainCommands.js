const config = require('../config/config');

module.exports = (bot) => {
    // Handler Menu Start
    bot.command('start', async (ctx) => {
        sendMainMenu(ctx);
    });

    // Handler callback "cek_lagi" dari middleware join grup
    bot.action('cek_lagi', async (ctx) => {
        try {
            const member = await ctx.telegram.getChatMember(config.groupId, ctx.from.id);
            const allowedStatus = ['creator', 'administrator', 'member'];

            if (allowedStatus.includes(member.status)) {
                await ctx.answerCbQuery('✅ Terima kasih! Anda telah bergabung.', { show_alert: false });
                await ctx.deleteMessage().catch(() => {});
                sendMainMenu(ctx);
            } else {
                await ctx.answerCbQuery('❌ Anda masih belum bergabung ke grup!', { show_alert: true });
            }
        } catch (e) {
            await ctx.answerCbQuery('⚠️ Terjadi kendala validasi, silahkan hubungi admin.', { show_alert: true });
        }
    });

    // Handler Navigasi Menu Utama via Inline Keyboard
    bot.action('menu_downloader', async (ctx) => {
        ctx.scene = null; // reset state jika ada
        if(ctx.session) ctx.session.actionState = 'WAITING_TIKTOK_URL';
        await ctx.answerCbQuery();
        await ctx.reply('📥 *TIKTOK DOWNLOADER*\n\nSilakan kirimkan link/URL video TikTok yang ingin Anda unduh.', { parse_mode: 'Markdown' });
    });

    bot.action('menu_uploader', async (ctx) => {
        if(ctx.session) ctx.session.actionState = 'WAITING_UPLOAD_FILE';
        await ctx.answerCbQuery();
        await ctx.reply('☁️ *RAFZ UPLOADER*\n\nSilakan kirimkan *Foto (Img2Url)* atau *Video (Vid2Url)* yang ingin Anda konversi menjadi tautan publik URL.', { parse_mode: 'Markdown' });
    });

    bot.action('menu_info', async (ctx) => {
        await ctx.answerCbQuery();
        const user = ctx.from;
        const infoMsg = `📋 *INFORMASI AKUN TELEGRAM*
        
• *Nama Lengkap:* ${user.first_name} ${user.last_name || ''}
• *Username:* ${user.username ? '@' + user.username : 'Tidak ada'}
• *Chat ID:* \`${ctx.chat.id}\`
• *User ID:* \`${user.id}\`
• *Bahasa:* \`${user.language_code || 'id'}\`
• *Premium:* ${user.is_premium ? '🌟 Yes Premium' : '❌ Biasa'}
• *Status Bot:* Aktif (Public)
• *Tanggal Cek:* ${new Date().toLocaleDateString('id-ID')}

_Data real-time diambil langsung dari sistem API Telegram Telegram._`;

        await ctx.reply(infoMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: '⬅️ Kembali ke Menu Utama', callback_data: 'back_to_menu' }]]
            }
        });
    });

    bot.action('menu_owner', async (ctx) => {
        await ctx.answerCbQuery();
        const ownerMsg = `🤖 *RAFZ MD*
_Bot Downloader & Uploader Multifungsi_

*Developer / Owner:* [RAFZ](${config.ownerUrl})
Sistem berjalan dalam arsitektur Node.js asynchronous.

Hubungi owner jika menemukan bug atau ingin melakukan integrasi API custom.`;

        await ctx.reply(ownerMsg, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📞 Contact Owner', url: config.ownerUrl },
                        { text: '🌐 Group Telegram', url: config.groupUrl }
                    ],
                    [{ text: '⬅️ Kembali ke Menu Utama', callback_data: 'back_to_menu' }]
                ]
            }
        });
    });

    bot.action('back_to_menu', async (ctx) => {
        if(ctx.session) ctx.session.actionState = null;
        await ctx.answerCbQuery();
        await ctx.deleteMessage().catch(() => {});
        sendMainMenu(ctx);
    });
};

function sendMainMenu(ctx) {
    const welcomeText = `👋 Selamat Datang di *RAFZ MD* \n\nSebuah platform bot utility modern yang siap membantu Anda melakukan scraping file multimedia & management cloud storage dengan instan\. \n\n*Silahkan pilih opsi fitur di bawah ini:*`;
    
    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: '📥 Downloader', callback_data: 'menu_downloader' },
                { text: '☁️ Uploader', callback_data: 'menu_uploader' }
            ],
            [
                { text: '👤 Info', callback_data: 'menu_info' },
                { text: '👑 Owner', callback_data: 'menu_owner' }
            ]
        ]
    };

    ctx.replyWithPhoto(config.bannerUrl, {
        caption: welcomeText,
        parse_mode: 'MarkdownV2',
        reply_markup: inlineKeyboard
    }).catch(async () => {
        // Fallback jika asset image gagal load
        ctx.reply(welcomeText, { parse_mode: 'MarkdownV2', reply_markup: inlineKeyboard });
    });
}
