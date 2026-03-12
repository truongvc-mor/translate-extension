document.getElementById('startBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "start" });
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
});

document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "stop" });
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
});