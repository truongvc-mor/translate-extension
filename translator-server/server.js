// require('dotenv').config();
// const WebSocket = require('ws');
// const { createClient } = require('@deepgram/sdk');
// const axios = require('axios');

// const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });
// const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// console.log(`Server đang chạy tại ws://localhost:${process.env.PORT || 3000}`);

// // Hàm dịch ngôn ngữ (Sử dụng Google Translate API miễn phí dành cho việc test)
// async function translateText(text, targetLang = 'vi') {
//     try {
//         const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
//         const response = await axios.get(url);
//         return response.data[0][0][0];
//     } catch (error) {
//         console.error("Lỗi dịch thuật:", error.message);
//         return text;
//     }
// }

// wss.on('connection', (ws) => {
//     console.log('Extension đã kết nối!');

//     // Cấu hình kết nối Realtime tới Deepgram
//     const deepgramLive = deepgram.listen.live({
//         model: 'nova-2', // Model AI mới và thông minh nhất của Deepgram
//         language: 'en',  // Ngôn ngữ gốc của cuộc họp (Tiếng Anh)
//         smart_format: true,
//         encoding: 'linear16',
//         sample_rate: 16000,
//     });

//     deepgramLive.on('open', () => {
//         console.log('Đã kết nối với Deepgram AI.');
//     });

//     deepgramLive.on('Results', async (data) => {
//         const transcript = data.channel.alternatives[0].transcript;
//         if (transcript.trim().length > 0 && data.is_final) {
//             console.log('Tiếng Anh:', transcript);
            
//             // Dịch sang Tiếng Việt
//             const translatedText = await translateText(transcript, 'vi');
//             console.log('Tiếng Việt:', translatedText);

//             // Gửi kết quả về lại Browser Extension
//             ws.send(JSON.stringify({
//                 original: transcript,
//                 translated: translatedText
//             }));
//         }
//     });

//     deepgramLive.on('error', (error) => console.error('Lỗi Deepgram:', error));

//     // Nhận luồng âm thanh (Audio Stream) từ Extension và đẩy thẳng cho Deepgram
//     ws.on('message', (message) => {
//         if (deepgramLive.getReadyState() === 1) { // 1 = OPEN
//             deepgramLive.send(message);
//         }
//     });

//     ws.on('close', () => {
//         console.log('Extension đã ngắt kết nối.');
//         deepgramLive.finish();
//     });
// });

require('dotenv').config();
const WebSocket = require('ws');
const { createClient } = require('@deepgram/sdk');
const axios = require('axios');

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY); // Giữ nguyên cú pháp v4

console.log(`Server đang chạy tại ws://localhost:${process.env.PORT || 3000}`);

async function translateText(text, targetLang = 'vi') {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url);
        return response.data[0][0][0];
    } catch (error) {
        console.error("Lỗi dịch thuật:", error.message);
        return text;
    }
}

wss.on('connection', (ws) => {
    console.log('Extension đã kết nối!');

    const deepgramLive = deepgram.listen.live({
        model: 'nova-2',
        language: 'en',
        smart_format: true,
        encoding: 'linear16',
        sample_rate: 16000,
        interim_results: true, // HIỆN CHỮ NGAY LẬP TỨC KHI ĐANG NÓI
        endpointing: 500       // CHỐT CÂU NHANH SAU KHI DỪNG 0.5 GIÂY
    });

    deepgramLive.on('open', () => {
        console.log('Đã kết nối với Deepgram AI.');
    });

    deepgramLive.on('Results', async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        
        // Bỏ qua nếu không có chữ nào
        if (!transcript || transcript.trim().length === 0) return;

        if (data.is_final) {
            // ĐÃ NÓI XONG 1 CÂU -> Đi dịch và gửi bản Final
            console.log('Chốt câu (Tiếng Anh):', transcript);
            const translatedText = await translateText(transcript, 'vi');
            
            ws.send(JSON.stringify({ 
                type: 'final', 
                original: transcript, 
                translated: translatedText 
            }));
        } else {
            // ĐANG NÓI DỞ -> Gửi ngay tiếng Anh về để hiện lên màn hình cho mượt
            ws.send(JSON.stringify({ 
                type: 'interim', 
                original: transcript 
            }));
        }
    });

    deepgramLive.on('error', (error) => console.error('Lỗi Deepgram:', error));

    ws.on('message', (message) => {
        if (deepgramLive.getReadyState() === 1) {
            deepgramLive.send(message);
        }
    });

    ws.on('close', () => {
        console.log('Extension đã ngắt kết nối.');
        deepgramLive.finish();
    });
});