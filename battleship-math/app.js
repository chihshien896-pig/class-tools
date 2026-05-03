import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    projectId: "my-teaching-tools-235a0",
    appId: "1:607804261156:web:af8090864c1dd97ff729b1",
    databaseURL: "https://my-teaching-tools-235a0-default-rtdb.firebaseio.com",
    storageBucket: "my-teaching-tools-235a0.firebasestorage.app",
    apiKey: "AIzaSyDm2MCsTFcQjQx-J-YZyV9tFCI_RT0xWps",
    authDomain: "my-teaching-tools-235a0.firebaseapp.com",
    messagingSenderId: "607804261156",
    projectNumber: "607804261156"
};

const SHIP_TYPES = [
    { id: 'carrier', name: '航空母艦', size: 5 },
    { id: 'battleship', name: '戰列艦', size: 4 },
    { id: 'destroyer', name: '驅逐艦', size: 3 },
    { id: 'submarine', name: '潛水艇', size: 3 },
    { id: 'patrolboat', name: '巡邏艇', size: 2 }
];

/**
 * 數學題目產生引擎
 */
class MathEngine {
    static gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    static lcm(a, b) {
        return (a * b) / this.gcd(a, b);
    }

    // 產生題目：五年級 - 異分母分數加減
    static generateFractionProblem() {
        const d1 = Math.floor(Math.random() * 8) + 2; // 分母 2-10
        const d2 = Math.floor(Math.random() * 8) + 2;
        const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
        const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
        
        const isPlus = Math.random() > 0.5;
        const commonD = this.lcm(d1, d2);
        
        const finalN1 = n1 * (commonD / d1);
        const finalN2 = n2 * (commonD / d2);
        
        let resultN, resultD = commonD;
        let op = '+';

        if (isPlus) {
            resultN = finalN1 + finalN2;
        } else {
            op = '-';
            // 確保結果為正數
            if (finalN1 < finalN2) {
                return this.generateFractionProblem();
            }
            resultN = finalN1 - finalN2;
        }

        // 約分
        const commonDiv = this.gcd(resultN, resultD);
        const finalN = resultN / commonDiv;
        const finalD = resultD / commonDiv;

        return {
            question: `${n1}/${d1} ${op} ${n2}/${d2}`,
            answer: finalD === 1 ? `${finalN}` : `${finalN}/${finalN < 0 ? '-' : ''}${Math.abs(finalD)}` // 簡化處理
        };
    }

    // 產生題目：五年級 - 小數乘法
    static generateDecimalProblem() {
        const a = (Math.random() * 10).toFixed(1);
        const b = (Math.random() * 10).toFixed(1);
        const ans = (parseFloat(a) * parseFloat(b)).toFixed(2);
        return {
            question: `${a} × ${b}`,
            answer: `${parseFloat(ans)}` // 移除末尾多餘的 0
        };
    }

    // 產生題目：六年級 - GCD/LCM
    static generateGCDLCMProblem() {
        const a = (Math.floor(Math.random() * 10) + 2) * (Math.floor(Math.random() * 5) + 1);
        const b = (Math.floor(Math.random() * 10) + 2) * (Math.floor(Math.random() * 5) + 1);
        const isGCD = Math.random() > 0.5;
        
        if (isGCD) {
            return { question: `GCD(${a}, ${b})`, answer: `${this.gcd(a, b)}` };
        } else {
            return { question: `LCM(${a}, ${b})`, answer: `${this.lcm(a, b)}` };
        }
    }

    // 產生題目：五年級 - 因數與倍數
    static generateFactorProblem() {
        const base = Math.floor(Math.random() * 50) + 10;
        const isCorrect = Math.random() > 0.5;
        const isFactorType = Math.random() > 0.5;
        
        if (isFactorType) {
            if (isCorrect) {
                const factors = [];
                for (let i = 1; i <= base; i++) if (base % i === 0) factors.push(i);
                const q = factors[Math.floor(Math.random() * factors.length)];
                return { question: `${q} 是 ${base} 的因數嗎? (Y/N)`, answer: `Y` };
            } else {
                let q;
                do { q = Math.floor(Math.random() * (base - 1)) + 2; } while (base % q === 0);
                return { question: `${q} 是 ${base} 的因數嗎? (Y/N)`, answer: `N` };
            }
        } else {
            if (isCorrect) {
                const mult = base * (Math.floor(Math.random() * 5) + 1);
                return { question: `${mult} 是 ${base} 的倍數嗎? (Y/N)`, answer: `Y` };
            } else {
                let q;
                do { q = base * (Math.floor(Math.random() * 3) + 1) + (Math.floor(Math.random() * (base - 1)) + 1); } while (q % base === 0);
                return { question: `${q} 是 ${base} 的倍數嗎? (Y/N)`, answer: `N` };
            }
        }
    }

    // 產生題目：五年級 - 小數加減
    static generateDecimalAddSub() {
        const a = (Math.random() * 20).toFixed(1);
        const b = (Math.random() * 20).toFixed(1);
        const isPlus = Math.random() > 0.5;
        if (isPlus) {
            return { question: `${a} + ${b}`, answer: `${(parseFloat(a) + parseFloat(b)).toFixed(1)}`.replace(/\.0$/, '') };
        } else {
            const max = Math.max(a, b);
            const min = Math.min(a, b);
            return { question: `${max} - ${min}`, answer: `${(parseFloat(max) - parseFloat(min)).toFixed(1)}`.replace(/\.0$/, '') };
        }
    }

    // 產生題目：六年級 - 分數乘除
    static generateFractionMulDiv() {
        const d1 = Math.floor(Math.random() * 5) + 2;
        const d2 = Math.floor(Math.random() * 5) + 2;
        const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
        const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
        const isMul = Math.random() > 0.5;

        if (isMul) {
            const resN = n1 * n2;
            const resD = d1 * d2;
            const common = this.gcd(resN, resD);
            const fN = resN / common;
            const fD = resD / common;
            return { question: `${n1}/${d1} × ${n2}/${d2}`, answer: fD === 1 ? `${fN}` : `${fN}/${fD}` };
        } else {
            // (n1/d1) / (n2/d2) = (n1*d2) / (d1*n2)
            const resN = n1 * d2;
            const resD = d1 * n2;
            const common = this.gcd(resN, resD);
            const fN = resN / common;
            const fD = resD / common;
            return { question: `${n1}/${d1} ÷ ${n2}/${d2}`, answer: fD === 1 ? `${fN}` : `${fN}/${fD}` };
        }
    }

    static generate(categoryId) {
        switch(categoryId) {
            case '5-1': // 因數與倍數
                return this.generateFactorProblem();
            case '5-2': // 異分母分數加減
                return this.generateFractionProblem();
            case '5-3': // 多位小數運算 (加減)
                return this.generateDecimalAddSub();
            case '6-1': // GCD/LCM
                return this.generateGCDLCMProblem();
            case '6-2': // 分數除法 (含乘法)
                return this.generateFractionMulDiv();
            case '6-3': // 小數除法
                const b = (Math.random() * 5 + 1).toFixed(1);
                const ans = (Math.random() * 5 + 1).toFixed(1);
                const a = (parseFloat(b) * parseFloat(ans)).toFixed(2);
                return { question: `${parseFloat(a)} ÷ ${b}`, answer: `${parseFloat(ans)}` };
            default:
                // 預設簡單乘法
                const n1 = Math.floor(Math.random() * 9) + 1;
                const n2 = Math.floor(Math.random() * 9) + 1;
                return { question: `${n1} × ${n2}`, answer: `${n1 * n2}` };
        }
    }
}

class GameApp {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
        
        this.screens = {
            lobby: document.getElementById('lobby-screen'),
            dashboard: document.getElementById('dashboard-screen'),
            setup: document.getElementById('setup-screen'),
            battle: document.getElementById('battle-screen')
        };
        
        this.roomId = null;
        this.role = 'teacher'; // or 'student'
        this.ammo = 0;
        this.ships = []; 
        this.selectedShipIndex = null;
        this.isHorizontal = true;
        this.myRooms = JSON.parse(localStorage.getItem('myBattleshipRooms') || '[]');
        this.uid = localStorage.getItem('battleship_uid') || Math.random().toString(36).substring(2, 10);
        localStorage.setItem('battleship_uid', this.uid);
        this.playerRole = null; 
        this.roomsData = {}; 
        
        this.initEventListeners();
        this.checkExistingRooms();
    }

    initEventListeners() {
        // 分頁切換
        document.getElementById('tab-teacher').addEventListener('click', () => this.switchTab('teacher'));
        document.getElementById('tab-student').addEventListener('click', () => this.switchTab('student'));

        // 建立房間按鈕 (進入指揮部)
        document.getElementById('btn-create-room').addEventListener('click', () => {
            this.role = 'teacher';
            this.showScreen('dashboard');
            this.renderDashboard(); // 確保進入時立即渲染
            if (this.myRooms.length === 0) {
                this.updateStatus("歡迎進入指揮部，請點擊「批量開設」來建立房間。");
            }
        });

        // 批量開設按鈕
        document.getElementById('btn-batch-create').addEventListener('click', () => {
            const count = parseInt(document.getElementById('batch-count').value);
            this.batchCreate(count);
        });

        // 全部關閉按鈕
        document.getElementById('btn-close-all').addEventListener('click', () => {
            if (confirm("確定要關閉並刪除所有房間嗎？")) {
                this.closeAllRooms();
            }
        });

        // 列印 QR Code
        document.getElementById('btn-print-qrs').addEventListener('click', () => {
            this.printQRs();
        });

        // 加入房間按鈕
        document.getElementById('btn-join-room').addEventListener('click', () => {
            const roomId = document.getElementById('room-input').value.toUpperCase();
            this.joinRoom(roomId);
        });

        // 答題輸入框 (Enter 鍵送出)
        document.getElementById('answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });

        // 答題確認按鈕
        document.getElementById('btn-submit-answer').addEventListener('click', () => {
            this.checkAnswer();
        });

        // 準備就緒按鈕
        document.getElementById('btn-ready').addEventListener('click', () => {
            this.setReady();
        });

        // 快捷鍵：旋轉軍艦
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r' || e.code === 'Space') {
                this.isHorizontal = !this.isHorizontal;
                this.updatePlacementPreview();
            }
        });
    }

    // 切換畫面
    showScreen(screenName) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screenName].classList.add('active');
        this.updateStatus(`進入: ${screenName.toUpperCase()}`);
    }

    // 切換身分分頁 (老師/學生)
    switchTab(role) {
        const teacherTab = document.getElementById('tab-teacher');
        const studentTab = document.getElementById('tab-student');
        const teacherContent = document.getElementById('teacher-controls');
        const studentContent = document.getElementById('student-controls');

        if (role === 'teacher') {
            teacherTab.classList.add('active');
            studentTab.classList.remove('active');
            teacherContent.classList.add('active');
            studentContent.classList.remove('active');
        } else {
            studentTab.classList.add('active');
            teacherTab.classList.remove('active');
            studentContent.classList.add('active');
            teacherContent.classList.remove('active');
        }
    }

    // 建立房間邏輯 (單個)
    async createRoom(category = '5-2', isSilent = false) {
        const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
        
        try {
            const roomRef = ref(this.db, `rooms/${roomId}`);
            await set(roomRef, {
                config: {
                    category: category,
                    createdAt: Date.now(),
                    status: 'waiting'
                },
                players: {} // 初始玩家為空，由學生加入
            });

            this.myRooms.push(roomId);
            this.saveRooms();
            
            if (!isSilent) {
                this.roomId = roomId;
                this.showScreen('dashboard');
            }
            
            this.listenToRoom(roomId);
            return roomId;
        } catch (error) {
            console.error("建立房間失敗:", error);
        }
    }

    async batchCreate(count) {
        const category = document.getElementById('math-category').value;
        this.updateStatus(`正在開設 ${count} 間教室...`);
        for (let i = 0; i < count; i++) {
            await this.createRoom(category, true);
        }
        this.renderDashboard();
    }

    async closeAllRooms() {
        this.updateStatus("正在關閉所有房間...");
        for (const roomId of [...this.myRooms]) {
            await this.deleteRoom(roomId);
        }
        this.myRooms = [];
        this.saveRooms();
        this.renderDashboard();
    }

    async deleteRoom(roomId) {
        try {
            const roomRef = ref(this.db, `rooms/${roomId}`);
            await set(roomRef, null); // 刪除 Firebase 中的數據
            this.myRooms = this.myRooms.filter(id => id !== roomId);
            this.saveRooms();
            delete this.roomsData[roomId];
            this.renderDashboard();
        } catch (error) {
            console.error(`刪除房間 ${roomId} 失敗:`, error);
        }
    }

    saveRooms() {
        localStorage.setItem('myBattleshipRooms', JSON.stringify(this.myRooms));
    }

    checkExistingRooms() {
        // 檢查 URL 參數是否有房間代碼 (學生掃描 QR code)
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoomId = urlParams.get('room');
        if (urlRoomId) {
            this.switchTab('student');
            this.joinRoom(urlRoomId.toUpperCase());
            return;
        }

        if (this.myRooms.length > 0) {
            this.myRooms.forEach(id => this.listenToRoom(id));
            this.renderDashboard();
        }
    }

    listenToRoom(roomId) {
        const roomRef = ref(this.db, `rooms/${roomId}`);
        onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                this.myRooms = this.myRooms.filter(id => id !== roomId);
                this.saveRooms();
                delete this.roomsData[roomId];
                this.renderDashboard();
                return;
            }
            
            // 更新即時數據庫
            this.roomsData[roomId] = data;
            
            // 更新儀表板
            this.renderDashboard();
            
            // 如果老師點擊了某個房間進入
            if (this.roomId === roomId) {
                this.roomData = data;
                this.roomConfig = data.config;
                if (data.config.status === 'battle' && this.screens.battle.classList.contains('active') === false) {
                    this.showScreen('battle');
                    this.startBattle();
                }
            }
        });
    }

    renderDashboard() {
        const list = document.getElementById('rooms-list');
        const summary = document.getElementById('dashboard-status-summary');
        
        // 如果清單不存在，或者目前不在指揮部畫面，就不執行渲染
        if (!list || !this.screens.dashboard.classList.contains('active')) return;
        
        list.innerHTML = '';
        
        if (this.myRooms.length === 0) {
            if (summary) summary.innerText = "目前尚未開設任何房間";
            return;
        }

        // 更新狀態概覽
        if (summary) {
            const activeCount = this.myRooms.length;
            const category = document.getElementById('math-category')?.selectedOptions[0]?.text || "未指定";
            summary.innerHTML = `<span>目前房間數: <strong>${activeCount}</strong></span> | <span>題型: <strong>${category}</strong></span>`;
        }
        
        this.myRooms.forEach(roomId => {
            const data = this.roomsData[roomId];
            if (data) {
                this.renderRoomCard(roomId, data, list);
            } else {
                // 如果數據還沒載入，顯示載入中卡片
                const card = document.createElement('div');
                card.className = 'room-card loading';
                card.innerHTML = `<div class="id">${roomId}</div><div class="players-info">數據載入中...</div>`;
                list.appendChild(card);
                
                // 主動嘗試重新監聽，防止遺漏
                this.listenToRoom(roomId);
            }
        });
    }

    renderRoomCard(roomId, data, container) {
        const card = document.createElement('div');
        const status = data.config?.status || 'waiting';
        card.className = `room-card status-${status}`;
        
        const hostJoined = data.players?.host ? '👤' : '❌';
        const hostReady = data.players?.host?.ready ? '✅' : '⏳';
        const studentJoined = data.players?.student ? '👤' : '❌';
        const studentReady = data.players?.student?.ready ? '✅' : '⏳';
        
        const joinUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`;

        card.innerHTML = `
            <div class="status-badge">${status.toUpperCase()}</div>
            <div class="id">${roomId}</div>
            <div class="qr-box">
                <img src="${qrUrl}" alt="QR Code" onclick="window.open('${joinUrl}', '_blank')">
                <p>點擊放大</p>
            </div>
            <div class="players-info">
                <div>玩家1: ${hostJoined} ${hostReady}</div>
                <div>玩家2: ${studentJoined} ${studentReady}</div>
            </div>
            <div class="card-actions">
                ${status === 'waiting' ? `<button class="btn-primary btn-sm" onclick="app.openRoom('${roomId}')">開啟</button>` : ''}
                <button class="btn-danger btn-sm" onclick="app.deleteRoom('${roomId}')">刪除</button>
            </div>
        `;
        container.appendChild(card);
    }

    async openRoom(roomId) {
        // 更新房間狀態為 setup
        try {
            await update(ref(this.db, `rooms/${roomId}/config`), { status: 'setup' });
            this.updateStatus(`已開啟房間 ${roomId}`);
        } catch (error) {
            console.error("開啟房間失敗:", error);
        }
    }

    initSetupPhase() {
        this.renderGrid('my-setup-grid', true);
        this.renderInventory();
        this.updateStatus("請配置你的艦隊。按 R 或 空白鍵 旋轉軍艦。");
    }

    renderInventory() {
        const list = document.getElementById('ship-list');
        list.innerHTML = '';
        SHIP_TYPES.forEach((type, index) => {
            const isPlaced = this.ships.some(s => s.typeId === type.id);
            const item = document.createElement('div');
            item.className = `ship-item ${isPlaced ? 'placed' : ''} ${this.selectedShipIndex === index ? 'selected' : ''}`;
            
            const visual = document.createElement('div');
            visual.className = 'ship-visual';
            for (let i = 0; i < type.size; i++) {
                const dot = document.createElement('div');
                dot.className = 'ship-dot';
                visual.appendChild(dot);
            }

            item.innerHTML = `<span>${type.name}</span>`;
            item.appendChild(visual);
            
            if (!isPlaced) {
                item.onclick = () => {
                    this.selectedShipIndex = index;
                    this.renderInventory();
                };
            }
            list.appendChild(item);
        });
    }

    startBattle() {
        this.renderGrid('my-battle-grid', false);
        this.renderGrid('enemy-battle-grid', true);
        this.nextQuestion();
        
        // 渲染自己的軍艦到小棋盤
        const myGrid = document.getElementById('my-battle-grid');
        this.ships.forEach(ship => {
            ship.positions.forEach(pos => {
                myGrid.querySelector(`[data-index="${pos}"]`).classList.add('ship');
            });
        });

        // 監聽攻擊事件
        this.listenForAttacks();
    }

    listenForAttacks() {
        const attackRef = ref(this.db, `rooms/${this.roomId}/attacks`);
        onValue(attackRef, (snapshot) => {
            const attacks = snapshot.val();
            if (!attacks) return;

            const myRole = this.role === 'teacher' ? 'host' : 'student';
            const enemyRole = this.role === 'teacher' ? 'student' : 'host';

            // 處理我對敵人的攻擊
            if (attacks[myRole]) {
                const enemyGrid = document.getElementById('enemy-battle-grid');
                Object.keys(attacks[myRole]).forEach(index => {
                    const result = attacks[myRole][index];
                    const cell = enemyGrid.querySelector(`[data-index="${index}"]`);
                    if (cell) cell.classList.add(result);
                });
            }

            // 處理敵人對我的攻擊
            if (attacks[enemyRole]) {
                const myGrid = document.getElementById('my-battle-grid');
                Object.keys(attacks[enemyRole]).forEach(index => {
                    const result = attacks[enemyRole][index];
                    const cell = myGrid.querySelector(`[data-index="${index}"]`);
                    if (cell) cell.classList.add(result);
                });
            }

            this.checkWinCondition(attacks);
        });
    }

    async handleAttack(index) {
        if (this.ammo <= 0) {
            this.updateStatus("彈藥不足！請先答對數學題。");
            return;
        }

        const myRole = this.playerRole;
        const enemyRole = this.playerRole === 'host' ? 'student' : 'host';
        
        // 檢查是否已經攻擊過該位置
        if (this.roomData?.attacks?.[myRole]?.[index]) return;

        // 判定 Hit or Miss
        const enemyShips = this.roomData?.players?.[enemyRole]?.ships || [];
        const isHit = enemyShips.some(ship => ship.positions.includes(index));
        const result = isHit ? 'hit' : 'miss';

        try {
            await update(ref(this.db, `rooms/${this.roomId}/attacks/${myRole}`), {
                [index]: result
            });
            
            this.ammo--;
            document.getElementById('ammo-count').innerText = this.ammo;
            this.updateStatus(isHit ? "命中敵軍！" : "可惜沒中...");
        } catch (error) {
            console.error("攻擊失敗:", error);
        }
    }

    checkWinCondition(attacks) {
        const hostShips = this.roomData?.players?.host?.ships || [];
        const studentShips = this.roomData?.players?.student?.ships || [];
        
        if (hostShips.length === 0 || studentShips.length === 0) return;

        const hostAllPos = hostShips.flatMap(s => s.positions);
        const studentAllPos = studentShips.flatMap(s => s.positions);

        const hostAttacksOnStudent = attacks.host ? Object.keys(attacks.host).filter(idx => attacks.host[idx] === 'hit').map(Number) : [];
        const studentAttacksOnHost = attacks.student ? Object.keys(attacks.student).filter(idx => attacks.student[idx] === 'hit').map(Number) : [];

        // 檢查學生是否全滅 (Host 贏)
        const isStudentDefeated = studentAllPos.every(pos => hostAttacksOnStudent.includes(pos));
        // 檢查老師是否全滅 (Student 贏)
        const isHostDefeated = hostAllPos.every(pos => studentAttacksOnHost.includes(pos));

        if (isStudentDefeated || isHostDefeated) {
            const winner = isStudentDefeated ? "老師 (HOST)" : "學生 (STUDENT)";
            this.endGame(winner);
        }
    }

    async endGame(winner) {
        this.updateStatus(`遊戲結束！獲勝者是：${winner}`);
        await update(ref(this.db, `rooms/${this.roomId}/config`), { status: 'finished', winner: winner });
        
        const overlay = document.getElementById('game-over-overlay');
        const winnerText = document.getElementById('winner-text');
        const winnerName = document.getElementById('winner-name');
        
        const myRoleName = this.role === 'teacher' ? '老師 (HOST)' : '學生 (STUDENT)';
        const isWin = (winner.includes('HOST') && this.role === 'teacher') || (winner.includes('STUDENT') && this.role === 'student');
        
        winnerText.innerText = isWin ? 'VICTORY' : 'DEFEATED';
        winnerText.style.color = isWin ? 'var(--neon-green)' : 'var(--neon-red)';
        winnerText.style.textShadow = isWin ? '0 0 20px var(--neon-green-glow)' : '0 0 20px var(--neon-red-glow)';
        
        winnerName.innerText = `${winner} 贏得了勝利！`;
        overlay.classList.add('active');
    }

    // 產生棋盤格
    renderGrid(containerId, isActive = true) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            if (isActive) {
                cell.addEventListener('click', () => this.onCellClick(containerId, i));
                cell.addEventListener('mouseenter', () => this.onCellHover(containerId, i, true));
                cell.addEventListener('mouseleave', () => this.onCellHover(containerId, i, false));
            }
            
            container.appendChild(cell);
        }
    }

    onCellHover(gridId, index, isEnter) {
        if (gridId !== 'my-setup-grid' || this.selectedShipIndex === null) return;
        this.updatePlacementPreview(index, isEnter);
    }

    updatePlacementPreview(hoverIndex = this.lastHoverIndex, isEnter = true) {
        this.lastHoverIndex = hoverIndex;
        const grid = document.getElementById('my-setup-grid');
        grid.querySelectorAll('.cell').forEach(c => c.classList.remove('preview', 'invalid'));

        if (!isEnter || hoverIndex === undefined || this.selectedShipIndex === null) return;

        const shipType = SHIP_TYPES[this.selectedShipIndex];
        const positions = this.getShipPositions(hoverIndex, shipType.size, this.isHorizontal);
        const isValid = this.isValidPlacement(positions);

        positions.forEach(pos => {
            const cell = grid.querySelector(`[data-index="${pos}"]`);
            if (cell) cell.classList.add(isValid ? 'preview' : 'invalid');
        });
    }

    getShipPositions(startIndex, size, horizontal) {
        const positions = [];
        const x = startIndex % 10;
        const y = Math.floor(startIndex / 10);

        for (let i = 0; i < size; i++) {
            if (horizontal) {
                if (x + i < 10) positions.push(y * 10 + (x + i));
            } else {
                if (y + i < 10) positions.push((y + i) * 10 + x);
            }
        }
        return positions;
    }

    isValidPlacement(positions) {
        if (positions.length < SHIP_TYPES[this.selectedShipIndex].size) return false;
        
        // 檢查是否與現有軍艦重疊
        const allOccupied = this.ships.flatMap(s => s.positions);
        return positions.every(pos => !allOccupied.includes(pos));
    }

    onCellClick(gridId, index) {
        if (gridId === 'my-setup-grid') {
            this.handleSetupClick(index);
        } else if (gridId === 'enemy-battle-grid') {
            this.handleAttack(index);
        }
    }

    handleSetupClick(index) {
        if (this.selectedShipIndex === null) {
            // 如果點擊到已放置的軍艦，可以考慮移除（暫不實作，先簡單化）
            return;
        }

        const shipType = SHIP_TYPES[this.selectedShipIndex];
        const positions = this.getShipPositions(index, shipType.size, this.isHorizontal);

        if (this.isValidPlacement(positions)) {
            this.ships.push({
                typeId: shipType.id,
                positions: positions,
                horizontal: this.isHorizontal
            });
            
            // 繪製到棋盤
            const grid = document.getElementById('my-setup-grid');
            positions.forEach(pos => {
                grid.querySelector(`[data-index="${pos}"]`).classList.add('ship');
            });

            this.selectedShipIndex = null;
            this.renderInventory();
            
            // 檢查是否所有軍艦都放好了
            if (this.ships.length === SHIP_TYPES.length) {
                document.getElementById('btn-ready').disabled = false;
                this.updateStatus("軍艦已配置完畢，請點擊「準備就緒」！");
            }
        } else {
            this.updateStatus("此處無法放置軍艦！");
        }
    }

    async setReady() {
        if (this.ships.length < SHIP_TYPES.length) return;
        
        try {
            const playerPath = this.playerRole;
            await update(ref(this.db, `rooms/${this.roomId}/players/${playerPath}`), {
                ready: true,
                ships: this.ships,
                uid: this.uid
            });
            
            document.getElementById('btn-ready').innerText = "等待對方準備...";
            document.getElementById('btn-ready').disabled = true;
            this.updateStatus("你已準備就緒，等待對手中...");
        } catch (error) {
            console.error("準備失敗:", error);
        }
    }

    nextQuestion() {
        const category = this.roomConfig?.category || '5-2';
        this.currentQuestion = MathEngine.generate(category);
        
        document.getElementById('question-text').innerText = this.currentQuestion.question;
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-input').focus();
        
        // 重設冷卻時間動畫 (模擬)
        const progress = document.getElementById('cooldown-progress');
        progress.style.transition = 'none';
        progress.style.width = '0%';
        setTimeout(() => {
            progress.style.transition = 'width 3s linear';
            progress.style.width = '100%';
        }, 50);
    }

    checkAnswer() {
        if (!this.currentQuestion) return;
        
        const input = document.getElementById('answer-input');
        const userAnswer = input.value.trim();
        
        if (userAnswer === this.currentQuestion.answer) {
            this.updateStatus('回答正確！獲得炸彈 +1');
            this.ammo++;
            document.getElementById('ammo-count').innerText = this.ammo;
            
            // 答對後的微動畫回饋
            input.classList.add('correct-flash');
            setTimeout(() => input.classList.remove('correct-flash'), 500);
            
            this.nextQuestion();
        } else {
            this.updateStatus('答案錯誤，再試一次！');
            input.classList.add('wrong-shake');
            setTimeout(() => input.classList.remove('wrong-shake'), 500);
        }
    }

    updateStatus(msg) {
        const statusEl = document.getElementById('status-message');
        if (statusEl) statusEl.innerText = msg;
    }

    // 切換身分分頁 (老師/學生)
    switchTab(role) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        const tab = document.getElementById(`tab-${role}`);
        const content = document.getElementById(`${role}-controls`);
        if (tab) tab.classList.add('active');
        if (content) content.classList.add('active');
        this.role = role;
    }

    printQRs() {
        if (this.myRooms.length === 0) {
            alert("目前沒有房間可以列印！");
            return;
        }
        window.print();
    }

    async joinRoom(roomId) {
        if (!roomId) return;
        this.role = 'student';
        
        try {
            const roomRef = ref(this.db, `rooms/${roomId}`);
            onValue(roomRef, async (snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    this.updateStatus("找不到該房間，請確認代碼。");
                    return;
                }

                this.roomId = roomId;
                this.roomData = data;
                this.roomConfig = data.config;
                document.getElementById('room-id').innerText = this.roomId;
                
                // 如果是第一次加入，更新玩家資訊
                if (this.role === 'student') {
                    if (!data.players?.host) {
                        this.playerRole = 'host';
                        await update(ref(this.db, `rooms/${roomId}/players/host`), {
                            connected: true,
                            ready: false,
                            uid: this.uid
                        });
                    } else if (!data.players?.student && data.players?.host?.uid !== this.uid) {
                        this.playerRole = 'student';
                        await update(ref(this.db, `rooms/${roomId}/players/student`), {
                            connected: true,
                            ready: false,
                            uid: this.uid
                        });
                    } else if (data.players?.host?.uid === this.uid) {
                        this.playerRole = 'host';
                    } else if (data.players?.student?.uid === this.uid) {
                        this.playerRole = 'student';
                    }
                }

                if (data.config.status === 'setup') {
                    if (this.role === 'student' && !this.screens.setup.classList.contains('active')) {
                        this.showScreen('setup');
                        this.initSetupPhase();
                    }
                    
                    // 只有 Host 負責檢查是否雙方都準備好並切換到 battle
                    if (this.playerRole === 'host' && data.players?.host?.ready && data.players?.student?.ready) {
                        await update(ref(this.db, `rooms/${roomId}/config`), { status: 'battle' });
                    }
                }

                if (data.config.status === 'battle') {
                    if (this.role === 'student' && !this.screens.battle.classList.contains('active')) {
                        this.showScreen('battle');
                        this.startBattle();
                    }
                }
            });

        } catch (error) {
            console.error("加入房間失敗:", error);
            this.updateStatus("加入房間失敗。");
        }
    }
}

// 初始化應用程式
window.addEventListener('DOMContentLoaded', () => {
    window.app = new GameApp();
});
