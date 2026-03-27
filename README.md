# 🌐 VoxaBridge Translate

Chrome Extension dịch thuật thời gian thực — thu âm từ bất kỳ tab nào (YouTube, Google Meet, Zoom...), nhận diện giọng nói bằng **Deepgram AI**, dịch qua **Google Translate** và hiển thị trực tiếp trong popup.

---

## ✨ Tính năng

- 🎙️ **Thu âm trực tiếp từ Tab** — không lẫn tạp âm micro ngoài
- ⚡ **Độ trễ thấp** — Deepgram Nova-2 + WebSocket streaming
- 🌍 **Đa ngôn ngữ** — EN, VI, JA, KO, ZH
- 🪟 **Hiển thị trong Popup** — translation hiện ngay trong extension panel, không che nội dung trang
- 🧠 **Dịch câu hoàn chỉnh** — tích lũy context trước khi dịch, tránh cắt giữa câu

---

## 🏗️ Kiến trúc

```
[Chrome Extension]                    [Node.js Server]
  popup (Vue)  ──start/stop──►  background.js (service worker)
                                       │
                                       ├─ tabCapture → streamId
                                       └─ offscreen.js
                                              │
                                       AudioWorklet (PCM 16-bit)
                                              │
                                       WebSocket ──────────────► server.js
                                                                   ├─ Deepgram STT
                                                                   └─ Google Translate
                                                                         │
                               popup ◄── chrome.runtime.sendMessage ◄───┘
```

---

## 📋 Yêu cầu

- Google Chrome (hoặc Edge, Brave)
- Node.js v16+
- Deepgram API Key — đăng ký miễn phí tại [console.deepgram.com](https://console.deepgram.com/)

---

## 🚀 Cài đặt & Chạy

### Bước 1 — Khởi động Server

```bash
cd translate-extension/translator-server
npm install
```

Tạo file `.env` cùng thư mục với `server.js`:

```env
DEEPGRAM_API_KEY=your_api_key_here
PORT=3000
```

```bash
node server.js
# Terminal báo: Server đang chạy tại ws://localhost:3000 → OK
```

### Bước 2 — Load Extension lên Chrome

1. Mở `chrome://extensions/`
2. Bật **Developer mode** (góc trên phải)
3. Bấm **Load unpacked** → chọn thư mục `translate-extension/translator-extension/`
4. Pin extension ra toolbar để tiện dùng

### Bước 3 — Sử dụng

1. Đảm bảo server đang chạy
2. Mở tab muốn dịch (YouTube, Meet...)
3. Bấm icon extension → chọn ngôn ngữ → bấm **Bắt đầu**
4. Transcript + bản dịch hiện trong popup theo thời gian thực
5. Bấm **Dừng** khi xong

---

## 🛠️ Cấu trúc thư mục

```
translate-extension/
├── translator-extension/        # Chrome Extension
│   ├── background.js            # Service worker — điều phối state & routing
│   ├── content.js               # Content script (injected vào page)
│   ├── offscreen.js / .html     # Audio pipeline (bypass MV3 limitation)
│   ├── processor.js             # AudioWorklet — convert Float32 → PCM16
│   ├── manifest.json
│   ├── style.css
│   ├── popup/                   # ← Build output (commit, đừng xóa)
│   │   └── index.html + assets/
│   └── popup-src/               # ← Vue source của popup UI
│       └── src/App.vue
│
└── translator-server/           # Node.js Backend
    ├── server.js
    ├── package.json
    └── .env                     # ← Tự tạo, KHÔNG commit
```

---

## 👨‍💻 Dành cho Developer

### Sửa UI popup

Popup được build từ Vue (`popup-src/`). Sau khi sửa `App.vue`:

```bash
cd translate-extension/translator-extension/popup-src
npm install       # lần đầu
npm run build     # build ra popup/
```

Sau đó reload extension tại `chrome://extensions/`.

### Sửa extension logic (background, offscreen, content)

Sửa file `.js` → vào `chrome://extensions/` → bấm **Reload** → F5 lại tab.

---

## ⚠️ Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Popup không hiện text | Kiểm tra server đang chạy. Xem Console của background script tại `chrome://extensions/ → Service Worker` |
| Lỗi `Connection refused` | Server chưa chạy hoặc PORT không khớp (default: 3000) |
| API Key lỗi | Kiểm tra `.env` — key đúng format, còn credit tại Deepgram Console |
| Sửa code không có hiệu lực | Reload extension tại `chrome://extensions/`, sau đó F5 lại tab |
| `popup/` bị mất sau pull | Chạy lại `npm run build` trong `popup-src/` |
