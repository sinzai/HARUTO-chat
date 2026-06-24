const botReplies = [
  "",
];

const botIcon = "image/icon.png";
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('input-area');
const userInput = document.getElementById('user-input');
const imageUpload = document.getElementById('image-upload');
const typingIndicator = document.getElementById('typing-indicator');

// HTMLタグをエスケープしてXSSを防ぐ関数
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, function(match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return escape[match];
    });
}

// アプリ起動時の処理
window.addEventListener('load', () => {
    // 1. スプラッシュ画面を非表示にする
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('splash-hidden');
        
        // 2. 画面が表示された直後に最初のメッセージを表示
        setTimeout(() => {
            simulateBotReply();
        }, 100);
    }, 100);
});

function getCurrentTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

// メッセージ表示関数
function addMessage(content, type, isImage = false) {
    const row = document.createElement('div');
    row.classList.add('message-row', type === 'bot' ? 'row-bot' : 'row-user');

    const time = getCurrentTime();
    const extraClass = isImage ? 'image-bubble' : '';

    if (type === 'bot') {
        const iconHtml = botIcon ? `<img src="${botIcon}" class="avatar" alt="icon">` : '';
        row.innerHTML = `
            ${iconHtml}
            <div class="bubble ${extraClass}">${content}</div>
            <div class="meta">
                <span class="time">${time}</span>
            </div>
        `;
    } else {
        row.innerHTML = `
            <div class="meta">
                <span class="read">既読</span>
                <span class="time">${time}</span>
            </div>
            <div class="bubble ${extraClass}">${content}</div>
        `;
    }

    chatLog.insertBefore(row, typingIndicator);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// ボットの返信をシミュレート
function simulateBotReply() {
    typingIndicator.style.display = 'flex';
    chatLog.scrollTop = chatLog.scrollHeight;

    setTimeout(() => {
        typingIndicator.style.display = 'none';
        const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
        addMessage(reply, 'bot');
    }, 1500); 
}

// テキスト送信
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // ユーザー入力をエスケープ処理してから渡す
    const safeText = escapeHTML(text);
    addMessage(safeText, 'user');
    
    userInput.value = '';
    
    simulateBotReply();
});

// 画像送信
imageUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgTag = `<img src="${e.target.result}" class="chat-image">`;
            addMessage(imgTag, 'user', true);
            simulateBotReply();
        }
        reader.readAsDataURL(file);
    }
    this.value = '';
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
