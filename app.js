// プレイヤー名と相手の名前を定数で管理
const PLAYER_NAME = "ソウタ";
const BOT_NAME = "ハルト";

const botReplies = [
    `ねえ${PLAYER_NAME}、今どこ？`,
    "ちょっと一人でコンビニ行ってきてもいい？笑",
    "また俺のスマホのログ、こっそり監視してたでしょ？",
    "ほんと心配性だよねえ",
    "仕事ばっかり。そんなに俺から目を離してていいの？",
    "今なら俺、窓から逃げ出せちゃうかもよ？",
    "俺がいなくなったら、お前狂って死んじゃうでしょ？",
    `ずっと俺のことだけ見ててよ、${PLAYER_NAME}`,
    "お前の匂いでもキスマークでも、好きなだけ上書きしていいよ",
    `俺のこれから先は全部、${PLAYER_NAME}の腕の中だけで予約済みだから`,
    "コーヒー淹れて。濃いめで",
    "……何、また変なシミュレーションして絶望してるの？",
    "早く帰ってきて",
    "既読早いね。また俺の画面ずっと見てたの？",
    "ほら、構ってよ",
];

const horrorReplies = [
    "ねえ、なんでブロックしようとしたの？",
    "逃げられると思ってるところ、本当に可愛いね",
    `いま、${PLAYER_NAME}の部屋の明かりが見えるよ`,
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

const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const blockBtn = document.getElementById('block-btn');
const blockOverlay = document.getElementById('block-overlay');

let isBlocked = false;
let isHorrorMode = false;
let gimmickTimer = null;

// アプリ起動時の処理
window.addEventListener('load', () => {
    // ヘッダー名とページタイトルを定数から動的に反映
    document.title = `LIME - ${BOT_NAME}編`;
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
        headerTitle.textContent = BOT_NAME;
    }

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

// 【XSS対策強化】innerHTMLを使わずDOM APIで安全に要素を構築する
function addMessage(content, type, isImage = false) {
    const row = document.createElement('div');
    row.classList.add('message-row', type === 'bot' ? 'row-bot' : 'row-user');

    const time = getCurrentTime();

    // 吹き出し要素の作成
    const bubble = document.createElement('div');
    bubble.className = `bubble ${isImage ? 'image-bubble' : ''}`;

    if (isImage) {
        // 画像の場合は安全にimg要素を生成してsrcにデータをセット
        const img = document.createElement('img');
        img.src = content; 
        img.className = 'chat-image';
        bubble.appendChild(img);
    } else {
        // テキストの場合はtextContentを使用（自動的にエスケープされXSSを防ぐ）
        bubble.textContent = content; 
    }

    // メタ情報（時間・既読）の作成
    const meta = document.createElement('div');
    meta.className = 'meta';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = time;

    if (type === 'bot') {
        if (botIcon) {
            const avatar = document.createElement('img');
            avatar.src = botIcon;
            avatar.className = 'avatar';
            avatar.alt = 'icon';
            row.appendChild(avatar);
        }
        meta.appendChild(timeSpan);
        row.appendChild(bubble);
        row.appendChild(meta);
    } else {
        const readSpan = document.createElement('span');
        readSpan.className = 'read';
        readSpan.textContent = '既読';
        meta.appendChild(readSpan);
        meta.appendChild(timeSpan);
        
        row.appendChild(meta);
        row.appendChild(bubble);
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
    row.textContent = text; // textContentで安全に出力
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

    // textContentで処理されるため、生のテキストをそのまま渡しても安全です
    addMessage(text, 'user');
    
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
        // 【XSS対策強化1】ファイルタイプが確実に画像であるかをチェック
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルのみ送信可能です。');
            this.value = '';
            return;
        }

        // 【XSS対策強化2】Base64(Data URI)ではなく、ブラウザが生成する安全なBlob URLを使用する
        const blobUrl = window.URL.createObjectURL(file);
        
        // 安全な Blob URL を渡す
        addMessage(blobUrl, 'user', true);
        simulateBotReply();
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
    if (isHorrorMode) {
        addSystemMessage("拒絶することはできません。", true);
        dropdownMenu.classList.add('hidden');
        return;
    }

    isBlocked = !isBlocked;
    dropdownMenu.classList.add('hidden');
    
    if (isBlocked) {
        blockBtn.textContent = 'ブロック解除';
        blockBtn.style.color = '#0084ff';
        blockOverlay.classList.remove('hidden');
        blockOverlay.style.color = "#888";
        blockOverlay.textContent = "ブロックしています";
        typingIndicator.style.display = 'none';
        
        addSystemMessage(`${BOT_NAME}をブロックしました。`);

        gimmickTimer = setTimeout(() => {
            if (!isBlocked) return; 

            blockOverlay.textContent = `${BOT_NAME}が入力中...`;
            blockOverlay.style.color = "#ff3b30";
            typingIndicator.style.display = 'flex';
            chatLog.scrollTop = chatLog.scrollHeight;

            setTimeout(() => {
                if (!isBlocked) return;

                const glitch = document.createElement('div');
                glitch.className = 'glitch-active';
                document.body.appendChild(glitch);
                setTimeout(() => glitch.remove(), 700);

                isHorrorMode = true;
                isBlocked = false;
                document.body.classList.add('horror-mode');
                blockOverlay.classList.add('hidden');
                typingIndicator.style.display = 'none';

                addSystemMessage("警告：システムが正常に動作していません。", true);
                addSystemMessage(`${BOT_NAME}のブロックが強制解除されました。`, true);

                blockBtn.textContent = '逃げる';
                blockBtn.style.color = '#ff3b30';

                botReplies.length = 0;
                botReplies.push(...horrorReplies);

                setTimeout(() => {
                    addMessage(`おもしろい冗談だね、${PLAYER_NAME}。……いま、部屋の前にいるよ？ 開けて？`, 'bot');
                }, 1000);

            }, 2000);

        }, 3000);

    } else {
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
