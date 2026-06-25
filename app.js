const botReplies = [
    "ねえソウタ、今どこ？",
    "ちょっと一人でコンビニ行ってきてもいい？笑",
    "また俺のスマホのログ、こっそり監視してたでしょ？",
    "ほんと心配性だよねえ",
    "仕事ばっかり。そんなに俺から目を離してていいの？",
    "今なら俺、窓から逃げ出せちゃうかもよ？",
    "俺がいなくなったら、お前狂って死んじゃうでしょ？",
    "ずっと俺のことだけ見ててよ、ソウタ",
    "お前の匂いでもキスマークでも、好きなだけ上書きしていいよ",
    "俺のこれから先は全部、ソウタの腕の中だけで予約済みだから",
    "コーヒー淹れて。濃いめで",
    "……何、また変なシミュレーションして絶望してるの？",
    "早く帰ってきて",
    "既読早いね。また俺の画面ずっと見てたの？",
    "ほら、構ってよ",
];

const botIcon = "image/icon.png";
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('input-area');
const userInput = document.getElementById('user-input');
const imageUpload = document.getElementById('image-upload');
const typingIndicator = document.getElementById('typing-indicator');

// ブロック機能用の要素と状態
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const blockBtn = document.getElementById('block-btn');
const blockOverlay = document.getElementById('block-overlay');
let isBlocked = false;

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

// システムメッセージを表示する関数
function addSystemMessage(text) {
    const row = document.createElement('div');
    row.classList.add('system-message');
    row.textContent = text;
    chatLog.insertBefore(row, typingIndicator);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// ボットの返信をシミュレート
function simulateBotReply() {
    if (isBlocked) return; // ブロック中は返信しない

    typingIndicator.style.display = 'flex';
    chatLog.scrollTop = chatLog.scrollHeight;

    setTimeout(() => {
        if (isBlocked) {
            // 待機中にブロックされた場合は非表示にして中断
            typingIndicator.style.display = 'none';
            return; 
        }
        typingIndicator.style.display = 'none';
        const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
        addMessage(reply, 'bot');
    }, 1500); 
}

// テキスト送信
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isBlocked) return; // ブロック中は送信不可

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
    if (isBlocked) {
        this.value = '';
        return; // ブロック中は画像も送信不可
    }

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

// ========== ブロック機能のUI・イベント制御 ==========

// メニューボタンのクリックでドロップダウンをトグル
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
});

// 画面のどこかをタップしたらメニューを閉じる
document.addEventListener('click', (e) => {
    if (!dropdownMenu.classList.contains('hidden') && e.target !== menuBtn) {
        dropdownMenu.classList.add('hidden');
    }
});

// ブロックボタンの処理
blockBtn.addEventListener('click', () => {
    isBlocked = !isBlocked;
    dropdownMenu.classList.add('hidden'); // メニューを閉じる
    
    if (isBlocked) {
        // ブロックした時の処理
        blockBtn.textContent = 'ブロック解除';
        blockBtn.style.color = '#0084ff'; // 解除時は青色
        blockOverlay.classList.remove('hidden');
        typingIndicator.style.display = 'none'; // タイピング中なら消す
        addSystemMessage("ハルトをブロックしました。");
    } else {
        // ブロック解除した時の処理
        blockBtn.textContent = 'ブロックする';
        blockBtn.style.color = '#ff3b30'; // 元の赤色
        blockOverlay.classList.add('hidden');
        addSystemMessage("ブロックを解除しました。");
    }
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
