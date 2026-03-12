let subtitleBox = null;
let shadowRoot = null;
let timeout;
let lastFinalVietnamese = ""; // Lưu trữ câu dịch cuối cùng

function createSubtitleBox() {
    if (document.getElementById('rt-translator-wrapper')) {
        return shadowRoot.getElementById('rt-subtitle-box');
    }
    
    const wrapper = document.createElement('div');
    wrapper.id = 'rt-translator-wrapper';
    wrapper.style.cssText = "position:fixed; z-index:2147483647; bottom:8%; left:50%; transform:translateX(-50%); width:100%; pointer-events:none;";
    
    shadowRoot = wrapper.attachShadow({ mode: 'open' });
    
    const box = document.createElement('div');
    box.id = 'rt-subtitle-box';
    
    const style = document.createElement('style');
    style.textContent = `
        #rt-subtitle-box {
            display: none;
            background-color: rgba(0, 0, 0, 0.75);
            padding: 15px 30px;
            border-radius: 12px;
            text-align: center;
            max-width: 85%;
            margin: 0 auto;
            transition: opacity 0.3s ease-in-out;
            font-family: 'Segoe UI', Roboto, Arial, sans-serif;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.1);
            opacity: 0;
        }
        .eng-line {
            color: #DDDDDD;
            font-size: 20px;
            margin-bottom: 8px;
            line-height: 1.4;
            display: block;
        }
        .vi-line {
            color: #FFD700; /* Vàng đậm cho tiếng Việt */
            font-size: 28px;
            font-weight: bold;
            line-height: 1.4;
            display: block;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
        }
        .interim { font-style: italic; opacity: 0.8; }
    `;
    
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(box);
    document.documentElement.appendChild(wrapper); 
    
    return box;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showSubtitle") {
        if (!subtitleBox) subtitleBox = createSubtitleBox();

        const data = request.payload;
        subtitleBox.style.display = 'block';
        subtitleBox.style.opacity = '1';

        // Xóa timeout ẩn chữ mỗi khi có tín hiệu mới
        clearTimeout(timeout);

        if (data.type === 'interim') {
            // TRẠNG THÁI ĐANG NÓI:
            // Dòng 1: Hiện tiếng Anh (nghiêng, mờ)
            // Dòng 2: Vẫn giữ lại câu dịch tiếng Việt cuối cùng để người dùng kịp đọc
            subtitleBox.innerHTML = `
                <span class="eng-line interim">${data.original}...</span>
                <span class="vi-line">${lastFinalVietnamese}</span>
            `;
            
        } else if (data.type === 'final') {
            // TRẠNG THÁI CHỐT CÂU:
            lastFinalVietnamese = data.translated; // Cập nhật câu dịch mới nhất
            
            subtitleBox.innerHTML = `
                <span class="eng-line">${data.original}</span>
                <span class="vi-line">${data.translated}</span>
            `;

            // Chỉ sau khi chốt câu hoàn toàn mới bắt đầu đếm ngược để ẩn phụ đề
            timeout = setTimeout(() => {
                subtitleBox.style.opacity = '0';
                setTimeout(() => { 
                    subtitleBox.style.display = 'none';
                    lastFinalVietnamese = ""; // Xóa bộ nhớ đệm sau khi ẩn
                }, 300);
            }, 7000); // Tăng lên 7 giây cho dễ đọc các câu dài
        }
    }
});