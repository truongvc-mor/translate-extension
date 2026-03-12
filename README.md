# 🌐 Realtime Meeting Translator (Trợ lý Phiên dịch Thời gian thực)

Một tiện ích mở rộng (Chrome Extension) mạnh mẽ giúp bạn **nhận diện giọng nói và phiên dịch trực tiếp (Real-time)** âm thanh phát ra từ bất kỳ tab trình duyệt nào (Google Meet, Zoom Web, Microsoft Teams, YouTube, v.v.). 

Hệ thống sử dụng **Deepgram AI** để nhận diện giọng nói siêu tốc và **Google Translate API** để dịch thuật ngôn ngữ, sau đó hiển thị phụ đề (Subtitle) đè lên màn hình video của bạn.


## ✨ Tính năng nổi bật

- 🎙️ **Thu âm trực tiếp từ Tab:** Bắt âm thanh chuẩn xác từ tab đang mở mà không bị lẫn tạp âm từ micro ngoài.
- ⚡ **Siêu tốc (Low Latency):** Sử dụng Deepgram Nova-2 (Model STT nhanh nhất hiện nay) kết hợp WebSocket để stream âm thanh.
- 🌍 **Tùy chọn Ngôn ngữ Đa dạng:** Hỗ trợ thay đổi Ngôn ngữ nguồn (người đang nói) và Ngôn ngữ đích (ngôn ngữ bạn muốn đọc).
- 🔤 **Phụ đề trực quan:** Hiển thị phụ đề thông minh trên màn hình (Có cả câu tạm thời - interim và câu chốt - final).
- 🛡️ **Tối ưu tài nguyên:** Sử dụng Chrome Offscreen API & AudioWorklet chuẩn Google Manifest V3 giúp không làm nặng trình duyệt.


## 🏗️ Kiến trúc Hệ thống

Dự án được chia làm 2 phần hoạt động song song:
1. **Frontend (Chrome Extension):** Chịu trách nhiệm tạo giao diện (Popup), thu âm thanh từ Tab (Offscreen + TabCapture), nén thành chuẩn PCM 16-bit và vẽ phụ đề lên video (Content Script).
2. **Backend (Node.js Server):** Nhận luồng âm thanh qua WebSocket, đẩy lên Deepgram AI để lấy văn bản, gọi API Dịch thuật và trả kết quả về cho Extension.


## 📋 Yêu cầu cài đặt (Prerequisites)

Để chạy được dự án này, máy tính của bạn cần có:
1. Trình duyệt **Google Chrome** (hoặc Edge, Brave...).
2. **Node.js** (Khuyến nghị bản v16 trở lên).
3. **Deepgram API Key** (Đăng ký tài khoản miễn phí tại [Deepgram Console](https://console.deepgram.com/) và tạo API Key, bạn sẽ được tặng credit miễn phí).


## 🚀 Hướng dẫn Cài đặt & Chạy dự án

### Bước 1: Khởi động Server Node.js (Backend)

1. Mở Terminal / Command Prompt và di chuyển vào thư mục server:
   ```bash
   cd TranslateExtension/translator-server
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo một file có tên là `.env` nằm cùng chỗ với file `server.js` và dán API Key của Deepgram vào như sau:
   ```env
   DEEPGRAM_API_KEY=dán_api_key_của_bạn_vào_đây
   PORT=3000
   ```
4. Chạy Server:
   ```bash
   node server.js
   ```
   *(Nếu thấy terminal báo: `Server đang chạy tại ws://localhost:3000` là thành công).*

### Bước 2: Cài đặt Chrome Extension (Frontend)

1. Mở trình duyệt Chrome, gõ vào thanh địa chỉ: `chrome://extensions/`
2. Bật chế độ **Developer mode (Chế độ dành cho nhà phát triển)** ở góc trên cùng bên phải.
![alt text](./imgs/img%201.png)
3. Bấm vào nút **Load unpacked (Tải tiện ích đã giải nén)** ở góc trên cùng bên trái.
![alt text](./imgs/img%202.png)
4. Chọn thư mục `translator-extension` trong mã nguồn của dự án.
5. *(Tùy chọn)* Bấm vào biểu tượng "Mảnh ghép" trên thanh công cụ Chrome và **Ghim (Pin)** Extension ra ngoài để tiện sử dụng.

---

## 💻 Hướng dẫn Sử dụng

1. Đảm bảo **Server Node.js đang chạy** ở dưới nền.
2. Mở một trang web bạn muốn dịch (Ví dụ: [Một video Tiếng Anh trên YouTube](https://www.youtube.com/) hoặc phòng họp Google Meet).
3. Bấm vào biểu tượng Extension của dự án.
4. Chọn:
   - **Nói:** Ngôn ngữ gốc của video (Ví dụ: Tiếng Anh).
   - **Dịch ra:** Ngôn ngữ bạn muốn đọc (Ví dụ: Tiếng Việt).
5. Bấm nút **BẮT ĐẦU DỊCH**.
6. Quay lại màn hình video, bạn sẽ thấy phụ đề màu vàng xuất hiện ở giữa màn hình ngay khi có người nói.
7. Khi không dùng nữa, mở lại Popup và bấm **DỪNG LẠI**.

---

## 🛠️ Cấu trúc Thư mục

```text
TranslateExtension/
├── translator-extension/        # (Mã nguồn Chrome Extension)
│   ├── background.js            # Điều phối trạng thái và kết nối
│   ├── content.js               # Vẽ phụ đề lên màn hình trang web
│   ├── manifest.json            # Cấu hình quyền và thông tin Extension
│   ├── offscreen.html & .js     # Chạy ngầm để lấy âm thanh (Bypass giới hạn của Chrome)
│   ├── popup.html & .js         # Giao diện người dùng
│   ├── processor.js             # AudioWorklet chuyển đổi âm thanh sang PCM
│   └── style.css                # CSS làm đẹp cho phụ đề
│
└── translator-server/           # (Mã nguồn Node.js Server)
    ├── .env                     # (Bạn tự tạo) Chứa API Key
    ├── package.json             # Danh sách thư viện (ws, axios, @deepgram/sdk)
    └── server.js                # Websocket Server xử lý STT và Translate
```

---

## ⚠️ Lưu ý & Khắc phục sự cố

- **Không hiện chữ trên màn hình?**
  👉 Hãy chắc chắn bạn đã tải lại trang web (Nhấn `F5`) sau khi cài đặt Extension. Content Script cần trang được tải mới để chèn code hiển thị phụ đề.
- **Báo lỗi `Connection refused` hoặc không bắt được chữ?**
  👉 Kiểm tra xem Node.js server đã được bật chưa, kiểm tra terminal xem có lỗi API Key của Deepgram (hết tiền/sai key) không.
- **Đã sửa code nhưng Extension không nhận code mới?**
  👉 Chrome Extension cache file rất sâu. Mỗi lần sửa code `js`, bạn phải vào `chrome://extensions/`, bấm nút **Tải lại (Refresh)** ở Extension, sau đó **F5** lại tab web đang mở.


