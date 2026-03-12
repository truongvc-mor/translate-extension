let socket;
let audioContext;
let mediaStream;
let targetTabId;
let workletNode; // Thêm biến để quản lý node mới

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startCapture") {
        const sourceLang = request.sourceLang || 'en';
        const targetLang = request.targetLang || 'vi';
        targetTabId = request.tabId;
        startProcessing(request.streamId, sourceLang, targetLang);
    } else if (request.action === "stopCapture") {
        stopProcessing();
    }
});

async function startProcessing(streamId, sourceLang, targetLang) {
    const wsUrl = `ws://localhost:3000?sl=${sourceLang}&tl=${targetLang}`;
    socket = new WebSocket(wsUrl);

    socket.onopen = async () => {
        // 1. Lấy stream từ tab
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            }
        });

        // 2. Thiết lập AudioContext
        audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(mediaStream);

        // 3. Nạp và đăng ký AudioWorklet
        try {
            await audioContext.audioWorklet.addModule('processor.js');
            workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

            // Lắng nghe dữ liệu âm thanh từ processor.js gửi sang
            workletNode.port.onmessage = (event) => {
                if (socket.readyState === WebSocket.OPEN) {
                    const float32Array = event.data;
                    const pcm16 = floatTo16BitPCM(float32Array);
                    socket.send(pcm16);
                }
            };

            // 4. Kết nối luồng: Source -> Worklet -> Destination (để vẫn nghe được âm thanh)
            source.connect(workletNode);
            workletNode.connect(audioContext.destination);
            
            // Quan trọng: Kết nối source trực tiếp tới destination để người dùng không bị mất tiếng tab
            source.connect(audioContext.destination);

        } catch (e) {
            console.error("Lỗi khởi tạo AudioWorklet:", e);
        }
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        chrome.runtime.sendMessage({ 
            action: "forwardSubtitle", 
            tabId: targetTabId,
            payload: data 
        });
    };
}

function stopProcessing() {
    if (socket) {
        socket.close();
        socket = null;
    }
    if (workletNode) {
        workletNode.disconnect();
        workletNode = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

// Hàm chuyển đổi Float32 sang PCM 16-bit (Giữ nguyên vì nó vẫn chuẩn)
function floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}