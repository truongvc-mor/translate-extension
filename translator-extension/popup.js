const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sourceLangSelect = document.getElementById('sourceLang');
const targetLangSelect = document.getElementById('targetLang');

// Load ngôn ngữ đã lưu trước đó
chrome.storage.local.get(['sourceLang', 'targetLang'], (data) => {
    if (data.sourceLang) sourceLangSelect.value = data.sourceLang;
    if (data.targetLang) targetLangSelect.value = data.targetLang;
});

// Lưu lại khi người dùng thay đổi
sourceLangSelect.addEventListener('change', (e) => {
    chrome.storage.local.set({ sourceLang: e.target.value });
});
targetLangSelect.addEventListener('change', (e) => {
    chrome.storage.local.set({ targetLang: e.target.value });
});

function updateUI(isTranslating) {
    if (isTranslating) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        sourceLangSelect.disabled = true; // Khóa chọn ngôn ngữ khi đang dịch
        targetLangSelect.disabled = true;
    } else {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        sourceLangSelect.disabled = false;
        targetLangSelect.disabled = false;
    }
}

chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    if (response) updateUI(response.isTranslating);
});

startBtn.addEventListener('click', () => {
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;
    
    // Truyền ngôn ngữ vào thông báo start
    chrome.runtime.sendMessage({ 
        action: "start",
        sourceLang: sourceLang,
        targetLang: targetLang
    });
    updateUI(true);
});

stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "stop" });
    updateUI(false);
});