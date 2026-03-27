require('dotenv').config();
const WebSocket = require('ws');
const { createClient } = require('@deepgram/sdk');
const axios = require('axios');
const url = require('url');

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY); // Giữ nguyên cú pháp v4

console.log(`Server đang chạy tại ws://localhost:${process.env.PORT || 3000}`);

async function translateText(text, targetLang = 'vi') {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url);
        return response.data[0].map(segment => segment[0]).join('');
    } catch (error) {
        console.error("Lỗi dịch thuật:", error.message);
        return text;
    }
}

wss.on('connection', (ws, req) => {
    console.log('Extension đã kết nối!');

    const parameters = url.parse(req.url, true).query;
    const sourceLang = parameters.sl || 'en';
    const targetLang = parameters.tl || 'vi';

    console.log(`[Kết nối mới] Source: ${sourceLang} | Target: ${targetLang}`);

    const deepgramLive = deepgram.listen.live({
        model: 'nova-2',
        language: sourceLang,
        smart_format: true,
        punctuate: true,
        encoding: 'linear16',
        sample_rate: 16000,
        interim_results: true,
        endpointing: 800       // tăng lên 800ms để ít bị split mid-sentence hơn
    });

    // Buffer tích lũy text từ nhiều is_final segments cho đến khi câu hoàn chỉnh
    let accumulatedText = '';
    const MAX_WORDS = 40; // fallback: dịch khi câu quá dài dù chưa có dấu câu

    deepgramLive.on('open', () => {
        console.log('Đã kết nối với Deepgram AI.');
    });

    deepgramLive.on('Results', async (data) => {
        const transcript = data.channel.alternatives[0].transcript;

        if (!transcript || transcript.trim().length === 0) return;

        const send = (payload) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(payload));
            }
        };

        if (data.is_final) {
            accumulatedText += (accumulatedText ? ' ' : '') + transcript;

            const trimmed = accumulatedText.trim();
            const endsWithPunctuation = /[.?!]$/.test(trimmed);
            const wordCount = trimmed.split(/\s+/).length;

            if (endsWithPunctuation || wordCount >= MAX_WORDS) {
                accumulatedText = '';
                console.log(`Câu hoàn chỉnh (${sourceLang}):`, trimmed);
                const translatedText = await translateText(trimmed, targetLang);
                send({ type: 'final', original: trimmed, translated: translatedText });
            } else {
                send({ type: 'interim', original: trimmed });
            }
        } else {
            const display = accumulatedText ? accumulatedText + ' ' + transcript : transcript;
            send({ type: 'interim', original: display });
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
        accumulatedText = '';
        deepgramLive.finish();
    });
});