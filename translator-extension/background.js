let isTranslating = false;
let currentTabId = null;

// Hàm kiểm tra offscreen đã tồn tại chưa (Cách chuẩn của Google)
async function hasOffscreenDocument() {
    if ('hasDocument' in chrome.offscreen) {
        return chrome.offscreen.hasDocument();
    }
    const matchedClients = await clients.matchAll();
    return matchedClients.some(c => c.url.includes('offscreen.html'));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getState") {
        sendResponse({ isTranslating: isTranslating });
        return true;
    }

    if (request.action === "start") {
        if (isTranslating) return; // Tránh bấm nhiều lần
        
        (async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;
            currentTabId = tab.id;

            chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, async (streamId) => {
                if (!streamId) return console.error("Không lấy được luồng âm thanh");

                // KIỂM TRA trước khi tạo offscreen
                const hasDoc = await hasOffscreenDocument();
                if (!hasDoc) {
                    await chrome.offscreen.createDocument({
                        url: 'offscreen.html',
                        reasons: ['USER_MEDIA'],
                        justification: 'Xử lý âm thanh cuộc họp'
                    }).catch(err => console.error("Lỗi tạo offscreen:", err)); 
                }

                chrome.runtime.sendMessage({ 
                    action: "startCapture", 
                    streamId: streamId,
                    tabId: tab.id,
                    sourceLang: request.sourceLang, // Chuyền tiếp ngôn ngữ nguồn
                    targetLang: request.targetLang  // Chuyền tiếp ngôn ngữ đích
                });
                isTranslating = true;
            });
        })();
        return true; 

    } else if (request.action === "stop") {
        chrome.runtime.sendMessage({ action: "stopCapture" });
        isTranslating = false;
        
        // Đóng offscreen an toàn
        hasOffscreenDocument().then(has => {
            if (has) chrome.offscreen.closeDocument();
        });
        return true;

    } else if (request.action === "forwardSubtitle") {
        const { original, translated, type } = request.payload;
        // Broadcast to popup (Vue store listens for showSubtitle with isFinal flag)
        chrome.runtime.sendMessage({
            action: "showSubtitle",
            original,
            translated,
            isFinal: type === 'final'
        }).catch(() => {}); // Popup might not be open, ignore error
    }
});