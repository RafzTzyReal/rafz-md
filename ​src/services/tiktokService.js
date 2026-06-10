const axios = require('axios');

async function downloadTikTok(url) {
    try {
        // Menggunakan public API TikWM / Lovit sebagai engine scraping gratis tanpa watermark
        const res = await axios.post('https://www.tikwm.com/api/', {
            url: url
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (res.data && res.data.code === 0) {
            const data = res.data.data;
            return {
                success: true,
                title: data.title || 'No Title',
                author: data.author.nickname || 'Unknown Author',
                duration: data.duration || 0,
                videoUrl: 'https://www.tikwm.com' + data.play,
                cover: 'https://www.tikwm.com' + data.cover
            };
        }
        return { success: false };
    } catch (error) {
        console.error('[TIKTOK SCRAPE ERROR]', error.message);
        return { success: false };
    }
}

module.exports = { downloadTikTok };
