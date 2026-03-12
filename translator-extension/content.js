let subtitleBox = null;
let shadowRoot = null;
let timeout;

function createSubtitleBox() {
    if (document.getElementById('rt-translator-wrapper')) {
        return shadowRoot.getElementById('rt-subtitle-box');
    }
    
    // Tạo một wrapper ẩn danh
    const wrapper = document.createElement('div');
    wrapper.id = 'rt-translator-wrapper';
    wrapper.style.position = 'fixed';
    wrapper.style.zIndex = '2147483647'; // Luôn nằm trên cùng
    wrapper.style.bottom = '10%';
    wrapper.style.left = '50%';
    wrapper.style.transform = 'translateX(-50%)';
    wrapper.style.width = '100%';
    wrapper.style.pointerEvents = 'none'; // Không cản trở click chuột của người dùng
    
    // Gắn Shadow DOM vào wrapper
    shadowRoot = wrapper.attachShadow({ mode: 'open' });
    
    // Tạo thẻ chứa phụ đề bên trong Shadow DOM
    const box = document.createElement('div');
    box.id = 'rt-subtitle-box';
    
    // Định nghĩa CSS trực tiếp trong Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
        #rt-subtitle-box {
            display: none;
            background-color: rgba(0, 0, 0, 0.75);
            padding: 12px 24px;
            border-radius: 8px;
            text-align: center;
            max-width: 70%;
            margin: 0 auto;
            transition: opacity 0.3s ease-in-out;
            font-family: 'Segoe UI', Arial, sans-serif;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
            backdrop-filter: blur(4px); /* Hiệu ứng làm mờ nền giống Netflix */
            opacity: 0;
        }
        .interim-text { color: #DDDDDD; font-size: 22px; font-style: italic; }
        .final-text { color: #FFD700; font-size: 26px; font-weight: bold; }
    `;
    
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(box);
    document.documentElement.appendChild(wrapper); 
    
    return box;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showSubtitle") {
        if (!subtitleBox) subtitleBox = createSubtitleBox();

        subtitleBox.style.display = 'block';
        subtitleBox.style.opacity = '1';

        const data = request.payload;

        if (data.type === 'interim') {
            subtitleBox.innerHTML = `<span class="interim-text">${data.original}</span>`;
            clearTimeout(timeout);
        } else if (data.type === 'final') {
            subtitleBox.innerHTML = `<span class="final-text">${data.translated}</span>`;
            
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                subtitleBox.style.opacity = '0';
                setTimeout(() => { subtitleBox.style.display = 'none'; }, 300); // Đợi effect opacity xong mới ẩn hẳn
            }, 4000); // 4 giây là mức hợp lý cho phụ đề
        }
    }
});