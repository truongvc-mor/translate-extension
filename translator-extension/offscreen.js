// let socket;
// let audioContext;
// let mediaStream;
// let targetTabId;

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "startCapture") {
//         targetTabId = request.tabId;
//         startProcessing(request.streamId);
//     } else if (request.action === "stopCapture") {
//         stopProcessing();
//     }
// });

// async function startProcessing(streamId) {
//     socket = new WebSocket('ws://localhost:3000');

//     socket.onopen = async () => {
//         mediaStream = await navigator.mediaDevices.getUserMedia({
//             audio: {
//                 mandatory: {
//                     chromeMediaSource: 'tab',
//                     chromeMediaSourceId: streamId
//                 }
//             }
//         });

//         audioContext = new AudioContext({ sampleRate: 16000 });
//         const source = audioContext.createMediaStreamSource(mediaStream);
        
//         source.connect(audioContext.destination);

//         const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
//         source.connect(scriptProcessor);
//         scriptProcessor.connect(audioContext.destination);

//         scriptProcessor.onaudioprocess = (e) => {
//             if (socket.readyState === WebSocket.OPEN) {
//                 const float32Array = e.inputBuffer.getChannelData(0);
//                 const pcm16 = floatTo16BitPCM(float32Array);
//                 socket.send(pcm16);
//             }
//         };
//     };

//     // Lắng nghe bản dịch gửi về
//     socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
        
//         // SỬA LỖI TẠI ĐÂY: Gửi ngược về background.js thay vì gọi chrome.tabs
//         chrome.runtime.sendMessage({ 
//             action: "forwardSubtitle", 
//             tabId: targetTabId,
//             text: data.translated 
//         });
//     };
// }

// function stopProcessing() {
//     if (socket) socket.close();
//     if (audioContext) audioContext.close();
//     if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
// }

// function floatTo16BitPCM(float32Array) {
//     const buffer = new ArrayBuffer(float32Array.length * 2);
//     const view = new DataView(buffer);
//     for (let i = 0; i < float32Array.length; i++) {
//         let s = Math.max(-1, Math.min(1, float32Array[i]));
//         view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
//     }
//     return buffer;
// }


let socket;
let audioContext;
let mediaStream;
let targetTabId;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startCapture") {
        targetTabId = request.tabId;
        startProcessing(request.streamId);
    } else if (request.action === "stopCapture") {
        stopProcessing();
    }
});

async function startProcessing(streamId) {
    socket = new WebSocket('ws://localhost:3000');

    socket.onopen = async () => {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            }
        });

        audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(mediaStream);
        
        source.connect(audioContext.destination);

        // GIẢM BUFFER XUỐNG 2048 ĐỂ GỬI NHANH GẤP ĐÔI
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        scriptProcessor.onaudioprocess = (e) => {
            if (socket.readyState === WebSocket.OPEN) {
                const float32Array = e.inputBuffer.getChannelData(0);
                const pcm16 = floatTo16BitPCM(float32Array);
                socket.send(pcm16);
            }
        };
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Gửi toàn bộ data (gồm type, original, translated) về background
        chrome.runtime.sendMessage({ 
            action: "forwardSubtitle", 
            tabId: targetTabId,
            payload: data 
        });
    };
}

function stopProcessing() {
    if (socket) socket.close();
    if (audioContext) audioContext.close();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
}

function floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}