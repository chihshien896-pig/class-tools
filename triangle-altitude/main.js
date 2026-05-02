const canvas = document.getElementById('teachingCanvas');
const ctx = canvas.getContext('2d');
const btnAnimate = document.getElementById('btnAnimate');
const btnReset = document.getElementById('btnReset');
const baseSelect = document.getElementById('baseSelect');
const successBadge = document.getElementById('successBadge');

// 頂點數據
let points = [
    { x: 250, y: 400, label: 'B' },
    { x: 650, y: 400, label: 'C' },
    { x: 500, y: 150, label: 'A' }
];

let isDragging = false;
let draggedPoint = null;
let animationProgress = 0;
let isAnimating = false;
let currentStep = 1;
let baseIndex = 1; // 預設底邊為 BC (1)

// 初始化畫布大小 (處理高解析度螢幕)
function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    draw();
}

// 獲取當前底邊與頂點的索引
function getActivePoints() {
    // baseIndex 0: AB (A,B)->C
    // baseIndex 1: BC (B,C)->A
    // baseIndex 2: CA (C,A)->B
    let p1, p2, top;
    if (baseIndex == 0) { p1 = points[2]; p2 = points[0]; top = points[1]; }
    else if (baseIndex == 1) { p1 = points[0]; p2 = points[1]; top = points[2]; }
    else { p1 = points[1]; p2 = points[2]; top = points[0]; }
    return { p1, p2, top };
}

// 繪製三角形
function drawTriangle() {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    
    // 背景填充
    ctx.fillStyle = 'rgba(79, 70, 229, 0.05)';
    ctx.fill();
    
    // 繪製邊
    const { p1, p2 } = getActivePoints();
    points.forEach((p, i) => {
        const next = points[(i + 1) % 3];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        
        // 如果是底邊，加粗並變色
        if ((p === p1 && next === p2) || (p === p2 && next === p1)) {
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 5;
        } else {
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
        }
        ctx.stroke();
    });

    // 繪製頂點
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#4f46e5';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 16px Outfit';
        ctx.fillText(p.label, p.x - 5, p.y - 15);
    });
}

// 繪製直角三角板
function drawSetsquare(posX, posY, angle = 0, scale = 150) {
    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate(angle);

    // 三角板主體
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(scale, 0);
    ctx.lineTo(0, -scale);
    ctx.closePath();
    
    ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 直角符號
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(15, -15);
    ctx.lineTo(0, -15);
    ctx.stroke();

    ctx.restore();
}

// 核心繪製函數
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 繪製格線 (背景)
    ctx.beginPath();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i += 40) {
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for(let i = 0; i < canvas.height; i += 40) {
        ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    drawTriangle();

    if (isAnimating) {
        const { p1, p2, top } = getActivePoints();

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const baseLen = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx);

        // top 在底邊延伸線上的投影點
        const t = ((top.x - p1.x) * dx + (top.y - p1.y) * dy) / (baseLen * baseLen);
        const projX = p1.x + t * dx;
        const projY = p1.y + t * dy;

        // 計算動畫路徑
        if (animationProgress < 0.3) {
            updateStep(2);
            const p = animationProgress / 0.3;
            // 從遠處移入
            const startX = p1.x - Math.cos(angle) * 100;
            const startY = p1.y - Math.sin(angle) * 100;
            const curX = startX + (p1.x - startX) * p;
            const curY = startY + (p1.y - startY) * p;
            drawSetsquare(curX, curY, angle);
        } else if (animationProgress < 0.7) {
            updateStep(3);
            const p = (animationProgress - 0.3) / 0.4;
            const curX = p1.x + (projX - p1.x) * p;
            const curY = p1.y + (projY - p1.y) * p;
            drawSetsquare(curX, curY, angle);
        } else {
            updateStep(4);
            drawSetsquare(projX, projY, angle);
            
            // 繪製高 (帶有發光效果)
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(projX, projY);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            
            // 如果動畫完成，增加發光
            if (animationProgress >= 0.99) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
            }
            
            ctx.stroke();
            ctx.restore();

            // 繪製底邊延伸線 (如果投影點在外部)
            if (t < 0 || t > 1) {
                ctx.beginPath();
                ctx.setLineDash([2, 2]);
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(projX, projY);
                ctx.moveTo(p2.x, p2.y);
                ctx.lineTo(projX, projY);
                ctx.strokeStyle = '#94a3b8';
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 18px Outfit';
            ctx.fillText('高', (top.x + projX)/2 + 15, (top.y + projY)/2);
        }
    }
}

function updateStep(step) {
    if (currentStep === step) return;
    currentStep = step;
    document.querySelectorAll('.step-card').forEach((card, idx) => {
        card.classList.toggle('active', idx + 1 === step);
    });
}

function showSuccess() {
    successBadge.classList.add('show');
}

function hideSuccess() {
    successBadge.classList.remove('show');
}

// 互動邏輯
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.forEach(p => {
        const dist = Math.sqrt((p.x - x)**2 + (p.y - y)**2);
        if (dist < 20) {
            isDragging = true;
            draggedPoint = p;
        }
    });
});

window.addEventListener('mousemove', (e) => {
    if (isDragging && draggedPoint) {
        const rect = canvas.getBoundingClientRect();
        draggedPoint.x = e.clientX - rect.left;
        draggedPoint.y = e.clientY - rect.top;
        draw();
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    draggedPoint = null;
});

btnAnimate.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    animationProgress = 0;
    
    function animate() {
        animationProgress += 0.005;
        draw();
        if (animationProgress < 1) {
            requestAnimationFrame(animate);
        } else {
            showSuccess();
        }
    }
    animate();
});

btnReset.addEventListener('click', () => {
    isAnimating = false;
    animationProgress = 0;
    points = [
        { x: 250, y: 400, label: 'B' },
        { x: 650, y: 400, label: 'C' },
        { x: 500, y: 150, label: 'A' }
    ];
    updateStep(1);
    hideSuccess();
    draw();
});

baseSelect.addEventListener('change', (e) => {
    baseIndex = parseInt(e.target.value);
    isAnimating = false;
    animationProgress = 0;
    updateStep(1);
    hideSuccess();
    draw();
});

window.addEventListener('resize', resize);
resize();
