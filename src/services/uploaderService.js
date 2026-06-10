const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/config');

async function uploadToRafzMedia(fileBuffer, filename, mimeType) {
    try {
        const form = new FormData();
        form.append('file', fileBuffer, {
            filename: filename,
            contentType: mimeType,
        });

        const response = await axios.post(config.uploaderApi, form, {
            headers: {
                ...form.getHeaders(),
                'Accept': 'application/json'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data && response.data.success) {
            return {
                success: true,
                url: response.data.url,
                filename: response.data.filename,
                size: response.data.size
            };
        }
        return { success: false, error: response.data.error || 'Server error' };
    } catch (error) {
        console.error('[SERVICE UPLOADER ERROR]', error.response?.data || error.message);
        return { 
            success: false, 
            error: error.response?.data?.error || 'Gagal menghubungi server storage API.' 
        };
    }
}

module.exports = { uploadToRafzMedia };
