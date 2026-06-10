const axios = require('axios');
const { uploadToRafzMedia } = require('../services/uploaderService');

module.exports = (bot) => {
    // Interseptor untuk Media Foto
    bot.on('photo', async (ctx) => {
        if (!ctx.session || ctx.session.actionState !== 'WAITING_UPLOAD_FILE') {
            return ctx.reply('💡 Tip: Pilih menu ☁️ Uploader terlebih dahulu jika ingin mengkonversi media.');
        }

        const waitingMsg = await ctx.reply('⏳ Sedang mengunduh foto Anda & mengunggah ke RAFZ Storage...');

        try {
            // Mengambil berkas resolusi tertinggi dari array foto
            const photoArray = ctx.message.photo;
            const fileId = photoArray[photoArray.length - 1].file_id;
            
            const fileLink = await ctx.telegram.getFileLink(fileId);
            const responseStream = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(responseStream.data, 'binary');

            const uploadResult = await uploadToRafzMedia(buffer, `img_${Date.now()}.jpg`, 'image/jpeg');

            ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id).catch(() => {});

            if (uploadResult.success) {
                sendSuccessResponse(ctx, uploadResult.url);
            } else {
                ctx.reply(`❌ Upload gagal: ${uploadResult.error}`);
            }
        } catch (err) {
            console.error(err);
            ctx.reply('❌ Terjadi kesalahan fatal sewaktu melakukan pemrosesan unggahan berkas foto.');
        }
    });

    // Interseptor untuk Media Video
    bot.on('video', async (ctx) => {
        if (!ctx.session || ctx.session.actionState !== 'WAITING_UPLOAD_FILE') {
            return ctx.reply('💡 Tip: Pilih menu ☁️ Uploader terlebih dahulu jika ingin mengkonversi media.');
        }

        // Batasi ukuran file lokal untuk mencegah overload RAM (Max 20MB di download via telegram token dasar)
        if (ctx.message.video.file_size > 20 * 1024 * 1024) {
            return ctx.reply('❌ Ukuran video terlalu besar. Melalui Bot API Telegram bot hanya dapat mendownload file internal maksimal berukuran 20 Megabytes.');
        }

        const waitingMsg = await ctx.reply('⏳ Sedang memproses transmisi video ke RAFZ Storage (Mungkin memakan waktu sedikit lama)...');

        try {
            const fileId = ctx.message.video.file_id;
            const fileLink = await ctx.telegram.getFileLink(fileId);
            const responseStream = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(responseStream.data, 'binary');

            const uploadResult = await uploadToRafzMedia(buffer, `vid_${Date.now()}.mp4`, 'video/mp4');

            ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id).catch(() => {});

            if (uploadResult.success) {
                sendSuccessResponse(ctx, uploadResult.url);
            } else {
                ctx.reply(`❌ Upload gagal: ${uploadResult.error}`);
            }
        } catch (err) {
            console.error(err);
            ctx.reply('❌ Terjadi kegagalan sewaktu melakukan pengunduhan berkas video dari cloud server Telegram.');
        }
    });
};

function sendSuccessResponse(ctx, outputUrl) {
    ctx.session.actionState = null; // Clear state
    
    const textMsg = `✅ *Upload Berhasil!*\n\nTautan publik Anda berhasil dihasilkan secara permanen oleh sistem cloud\. \n\n🔗 *URL:* \`${outputUrl}\``;
    
    ctx.reply(textMsg, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔗 Open URL', url: outputUrl }
                ],
                [
                    { text: '⬅️ Main Menu', callback_data: 'back_to_menu' }
                ]
            ]
        }
    });
}
