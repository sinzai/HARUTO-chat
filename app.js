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

// ギミック発動後のヤンデレセリフ
const horrorReplies = [
    "ねえ、なんでブロックしようとしたの？",
    "逃げられると思ってるところ、本当に可愛いね、ソウタ",
    "いま、ソウタの部屋の明かりが見えるよ",
    "ドアの前にいるから、早く開けて？",
    "お前のスマホのGPS、いつでも見れるって言ったじゃん",
    "ずっと俺のことだけ見ててって言ったよね？",
    "怒ってないよ。ただ、ちょっとお仕置きが必要かなって",
    "鍵、閉めても意味ないよ？あハはは！",
    "ねえ、開けて",
    "逃がさないよ"
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
let isHorrorMode = false; // ギミック発動フラグ
let gimmickTimer = null;

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
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('splash-hidden');
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
function addSystemMessage(text, isAlert = false) {
    const row = document.createElement('div');
    row.classList.add('system-message');
    if (isAlert) {
        row.classList.add('system-message-alert');
    }
    row.textContent = text;
    chatLog.insertBefore(row, typingIndicator);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// ボットの返信をシミュレート
function simulateBotReply() {
    if (isBlocked) return; 

    typingIndicator.style.display = 'flex';
    chatLog.scrollTop = chatLog.scrollHeight;

    setTimeout(() => {
        if (isBlocked) {
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
    if (isBlocked) return; 

    const text = userInput.value.trim();
    if (!text) return;

    const safeText = escapeHTML(text);
    addMessage(safeText, 'user');
    
    userInput.value = '';
    simulateBotReply();
});

// 画像送信
imageUpload.addEventListener('change', function() {
    if (isBlocked) {
        this.value = '';
        return;
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

// ========== ブロック機能 ＆ ホラー突破ギミック ==========

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!dropdownMenu.classList.contains('hidden') && e.target !== menuBtn) {
        dropdownMenu.classList.add('hidden');
    }
});

blockBtn.addEventListener('click', () => {
    // 覚醒後はクリックしても無駄
    if (isHorrorMode) {
        addSystemMessage("拒絶することはできません。", true);
        dropdownMenu.classList.add('hidden');
        return;
    }

    isBlocked = !isBlocked;
    dropdownMenu.classList.add('hidden');
    
    if (isBlocked) {
        // 通常のブロック処理
        blockBtn.textContent = 'ブロック解除';
        blockBtn.style.color = '#0084ff';
        blockOverlay.classList.remove('hidden');
        blockOverlay.style.color = "#888";
        blockOverlay.textContent = "ブロックしています";
        typingIndicator.style.display = 'none';
        addSystemMessage("ハルトをブロックしました。");

        // ーーー ここから覚醒ギミック ーーー
        gimmickTimer = setTimeout(() => {
            if (!isBlocked) return; // 3秒以内に解除されたら不発（普通は間に合わない）

            // 1. ブロック中なのに相手のタイピングが始まるホラー
            blockOverlay.textContent = "ハルトが入力中...";
            blockOverlay.style.color = "#ff3b30";
            typingIndicator.style.display = 'flex';
            chatLog.scrollTop = chatLog.scrollHeight;

            setTimeout(() => {
                if (!isBlocked) return;

                // 2. 画面グリッチ（赤黒いフラッシュ）を発生させる
                const glitch = document.createElement('div');
                glitch.className = 'glitch-active';
                document.body.appendChild(glitch);
                setTimeout(() => glitch.remove(), 700);

                // 3. ホラーモード化・強制ブロック解除
                isHorrorMode = true;
                isBlocked = false;
                document.body.classList.add('horror-mode');
                blockOverlay.classList.add('hidden');
                typingIndicator.style.display = 'none';

                addSystemMessage("警告：システムが正常に動作していません。", true);
                addSystemMessage("ハルトのブロックが強制解除されました。", true);

                // メニューの文字を呪いの言葉に固定
                blockBtn.textContent = '逃げる';
                blockBtn.style.color = '#ff3b30';

                // セリフリストをホラー用に入れ替え
                botReplies.length = 0;
                botReplies.push(...horrorReplies);

                // 4. トドメの確定恐怖メッセージ
                setTimeout(() => {
                    addMessage("おもしろい冗談だね、ソウタ。でも俺をブロックしようなんて悪い子だ。……いま、部屋の前にいるよ？ 開けて？", 'bot');
                }, 1000);

            }, 2000);

        }, 3000);
        // ーーーーーーーーーーーーーーーーー

    } else {
        // 通常の解除処理（ギミック発動前のみ有効）
        blockBtn.textContent = 'ブロックする';
        blockBtn.style.color = '#ff3b30';
        blockOverlay.classList.add('hidden');
        addSystemMessage("ブロックを解除しました。");
        if (gimmickTimer) clearTimeout(gimmickTimer);
    }
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
