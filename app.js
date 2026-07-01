document.addEventListener('DOMContentLoaded', () => {
    const PLAYER_NAME = "ソウタ";
    const BOT_NAME = "ハルト";

    const REPLY_TIMING = {
        NORMAL_REPLY: 1500,         // 単発の返信に要する時間
        AUTO_SPAM_NORMAL: 5000,     // 放置した際の自動連投間隔（通常モード）
        AUTO_SPAM_HORROR: 2000,     // 放置した際の自動連投間隔（ホラーモード）
        MULTI_HORROR_UNBLOCK: 1500, // 強制ブロック解除直後の波状攻撃の間隔
        MULTI_HORROR_ESCAPE: 800,   // 「逃げる」を押した時の波状攻撃の間隔
        BLOCK_GIMMICK_START: 1500,  // ブロックしてから「入力中...」が出るまでの時間
        BLOCK_GIMMICK_TRANSITION: 2000 // 「入力中...」から強制解除されるまでの時間
    };

    const botReplies = [
        `ねえ${PLAYER_NAME}、今どこ？`,
        "ちょっと一人でコンビニ行ってきてもいい？笑",
        "また俺のスマホのログ、こっそり監視してたでしょ？",
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
    let horrorTransitionTimer = null;
    let autoSpamTimer = null; 

    // 初期化処理
    document.title = `LIME - ${BOT_NAME}編`;
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
        headerTitle.textContent = BOT_NAME;
    }

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('splash-hidden');
        setTimeout(() => {
            simulateBotReply();
        }, 100);
    }, 100);

    // 放置していると勝手にメッセージが飛んでくるタイマーを起動
    resetAutoSpamTimer();

    function getCurrentTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    function addMessage(content, type, isImage = false) {
        const row = document.createElement('div');
        row.classList.add('message-row', type === 'bot' ? 'row-bot' : 'row-user');

        const time = getCurrentTime();
        const bubble = document.createElement('div');
        bubble.className = `bubble ${isImage ? 'image-bubble' : ''}`;

        if (isImage) {
            const img = document.createElement('img');
            img.src = content; 
            img.className = 'chat-image';
            img.onload = () => { window.URL.revokeObjectURL(content); };
            bubble.appendChild(img);
        } else {
            bubble.textContent = content; 
        }

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

    function addSystemMessage(text, isAlert = false) {
        const row = document.createElement('div');
        row.classList.add('system-message');
        if (isAlert) row.classList.add('system-message-alert');
        row.textContent = text;
        chatLog.insertBefore(row, typingIndicator);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // 単発の返信シミュレート
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
            resetAutoSpamTimer(); // 返信したらタイマーをリセット
        }, REPLY_TIMING.NORMAL_REPLY); 
    }

    // 複数個のメッセージを、指定の間隔で順番に連投する関数
    function sendMultipleReplies(messages, interval = 2000) {
        let index = 0;

        function sendNext() {
            if (isBlocked || index >= messages.length) {
                typingIndicator.style.display = 'none';
                resetAutoSpamTimer();
                return;
            }

            typingIndicator.style.display = 'flex';
            chatLog.scrollTop = chatLog.scrollHeight;

            setTimeout(() => {
                if (isBlocked) {
                    typingIndicator.style.display = 'none';
                    return;
                }
                typingIndicator.style.display = 'none';
                addMessage(messages[index], 'bot');
                index++;
                
                // 次のメッセージへ（再帰呼び出し）
                sendNext();
            }, interval);
        }

        sendNext();
    }

    // ユーザーが操作しなくても勝手に連投が来るためのタイマー制御
    function resetAutoSpamTimer() {
        if (autoSpamTimer) clearInterval(autoSpamTimer);
        
        const intervalTime = isHorrorMode ? REPLY_TIMING.AUTO_SPAM_HORROR : REPLY_TIMING.AUTO_SPAM_NORMAL;
        
        autoSpamTimer = setInterval(() => {
            if (isBlocked) return;
            simulateBotReply();
        }, intervalTime);
    }

    function setFormDisabled(disabled) {
        userInput.disabled = disabled;
        imageUpload.disabled = disabled;
        const submitBtn = chatForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = disabled;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isBlocked) return; 

        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';
        
        // ユーザーが送信したら、少し遅れて通常の返信
        simulateBotReply();
    });

    imageUpload.addEventListener('change', function() {
        if (isBlocked) { this.value = ''; return; }
        const file = this.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('画像ファイルのみ送信可能です。');
                this.value = '';
                return;
            }
            const blobUrl = window.URL.createObjectURL(file);
            addMessage(blobUrl, 'user', true);
            simulateBotReply();
        }
        this.value = '';
    });

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
            // ホラーモード中の「逃げる」ボタンの処理
            addSystemMessage("ブロックできません。", true);
            // 逃げようとすると、さらに狂った連投が届く
            sendMultipleReplies([
                "ねえ", "ねえ", "ねえ", "ねえってば", 
                `逃がさないって言ったよね、${PLAYER_NAME}。`
            ], REPLY_TIMING.MULTI_HORROR_ESCAPE);
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
            setFormDisabled(true);
            if (autoSpamTimer) clearInterval(autoSpamTimer); // ブロック中は自動連投を停止
            
            addSystemMessage(`${BOT_NAME}をブロックしました。`);

            gimmickTimer = setTimeout(() => {
                if (!isBlocked) return; 

                blockOverlay.textContent = `${BOT_NAME}が入力中...`;
                blockOverlay.style.color = "#ff3b30";
                typingIndicator.style.display = 'flex';
                chatLog.scrollTop = chatLog.scrollHeight;

                horrorTransitionTimer = setTimeout(() => {
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
                    setFormDisabled(false);

                    addSystemMessage("警告：システムが正常に動作していません。", true);
                    addSystemMessage(`${BOT_NAME}のブロックが強制解除されました。`, true);

                    blockBtn.textContent = '逃げる';
                    blockBtn.style.color = '#ff3b30';

                    // ホラー用のセリフに入れ替え
                    botReplies.length = 0;
                    botReplies.push(...horrorReplies);

                    // ブロック解除直後に波状攻撃を仕掛ける
                    sendMultipleReplies([
                        `おもしろい冗談だね、${PLAYER_NAME}。`,
                        "もう俺のこといらなくなったの？笑",
                        "ダメだよ、俺から離れちゃ。"
                    ], REPLY_TIMING.MULTI_HORROR_UNBLOCK);

                }, REPLY_TIMING.BLOCK_GIMMICK_TRANSITION);

            }, REPLY_TIMING.BLOCK_GIMMICK_START);

        } else {
            blockBtn.textContent = 'ブロックする';
            blockBtn.style.color = '#ff3b30';
            blockOverlay.classList.add('hidden');
            setFormDisabled(false);
            addSystemMessage("ブロックを解除しました。");
            
            if (gimmickTimer) clearTimeout(gimmickTimer);
            if (horrorTransitionTimer) clearTimeout(horrorTransitionTimer);
            resetAutoSpamTimer();
        }
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
});
