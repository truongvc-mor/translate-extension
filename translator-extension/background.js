// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "start") {
        
//         // Bọc hàm async vào trong để tránh lỗi Manifest V3
//         (async () => {
//             const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//             if (!tab) return;

//             chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, async (streamId) => {
//                 if (!streamId) return console.error("Không lấy được luồng âm thanh");

//                 await chrome.offscreen.createDocument({
//                     url: 'offscreen.html',
//                     reasons:['USER_MEDIA'],
//                     justification: 'Xử lý âm thanh cuộc họp'
//                 }).catch(() => {}); 

//                 chrome.runtime.sendMessage({ 
//                     action: "startCapture", 
//                     streamId: streamId,
//                     tabId: tab.id 
//                 });
//             });
//         })();
//         return true; // Giữ cổng giao tiếp mở

//     } else if (request.action === "stop") {
//         chrome.runtime.sendMessage({ action: "stopCapture" });
//         chrome.offscreen.closeDocument().catch(() => {});
//         return true;

//     } else if (request.action === "forwardSubtitle") {
//         // BẮC CẦU: Nhận chữ từ offscreen.js và gửi xuống tab YouTube (content.js)
//         chrome.tabs.sendMessage(request.tabId, { 
//             action: "showSubtitle", 
//             text: request.text 
//         }).catch((err) => console.log("Lỗi hiển thị:", err));
//     }
// });


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start") {
        
        (async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;

            chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, async (streamId) => {
                if (!streamId) return console.error("Không lấy được luồng âm thanh");

                await chrome.offscreen.createDocument({
                    url: 'offscreen.html',
                    reasons:['USER_MEDIA'],
                    justification: 'Xử lý âm thanh cuộc họp'
                }).catch(() => {}); 

                chrome.runtime.sendMessage({ 
                    action: "startCapture", 
                    streamId: streamId,
                    tabId: tab.id 
                });
            });
        })();
        return true; 

    } else if (request.action === "stop") {
        chrome.runtime.sendMessage({ action: "stopCapture" });
        chrome.offscreen.closeDocument().catch(() => {});
        return true;

    } else if (request.action === "forwardSubtitle") {
        // ĐẨY PAYLOAD XUỐNG CONTENT.JS
        chrome.tabs.sendMessage(request.tabId, { 
            action: "showSubtitle", 
            payload: request.payload 
        }).catch((err) => console.log("Lỗi hiển thị:", err));
    }
});