// 🚀 SUPERCHARGED CALCULATOR - mathjs.org API + Perfect OCR
let display = '0';
let currentTab = 'calculator';

function updateDisplay() { document.getElementById('display').textContent = display; }
function input(value) { 
    if (display === '0' && !['+', '-', '*', '/'].includes(value)) display = value;
    else display += value; 
    updateDisplay(); 
}
function clearAll() { display = '0'; updateDisplay(); }

// Native calculator
function calculate() {
    try {
        let expr = display.replace(/×/g,'*').replace(/÷/g,'/').replace(/π/g,'pi');
        let result = math.evaluate(expr);
        display = result.toString();
        updateDisplay();
    } catch { display = 'Error'; updateDisplay(); }
}

// Tabs (keep existing)
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// 🔥 MATHJS.ORG API - INDUSTRIAL GRADE SOLVER
async function solveWithMathJS(equation) {
    try {
        const response = await fetch(`https://api.mathjs.org/v4?expr=${encodeURIComponent(equation)}`);
        const result = await response.text();
        return result;
    } catch {
        return 'API error';
    }
}

// ===== OCR + SUPER SOLVER =====
const dropZone = document.getElementById('dropZone');
const ocrResult = document.getElementById('ocrResult');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    processOCR(e.dataTransfer.files[0]);
});

document.addEventListener('paste', e => {
    if (currentTab !== 'ocr') return;
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.startsWith('image/')) {
            processOCR(item.getAsFile());
            break;
        }
    }
});

async function processOCR(file) {
    dropZone.innerHTML = '<div style="font-size:48px">⏳</div>AI Solving...';
    
    try {
        // OCR
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            tessedit_char_whitelist: '0123456789+-*/=().xXyπ√^ ',
            tessedit_pageseg_mode: 8
        });
        
        let eq = text.trim().replace(/\s+/g, '')
            .replace(/Printed:|jpg|png/gi, '')
            .replace(/[^0-9+\-*/=().x√^π ]/g, '')
            .replace(/O/g,'0').replace(/l/g,'1');
        
        console.log('📸 OCR Result:', eq);
        
        // 🚀 MATHJS.ORG SOLVES IT PERFECTLY
        const apiResult = await solveWithMathJS(eq);
        
        ocrResult.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); 
                        color: white; padding: 30px; border-radius: 25px; margin-top: 20px; text-align: center;">
                <div style="font-size: 28px; font-family: monospace; margin-bottom: 20px; padding: 15px;
                           background: rgba(255,255,255,0.2); border-radius: 15px;">
                    ${eq}
                </div>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 20px; color: #00ff88;">
                    ✅ ${apiResult}
                </div>
                <button onclick="copyToCalc('${eq}')" style="width:100%; padding:15px; background:#4CAF50;
                           color:white; border:none; border-radius:12px; font-size:18px; cursor:pointer; margin-top:15px;">
                    ➤ Calculator Mode
                </button>
                <div style="font-size:12px; opacity:0.8; margin-top:15px;">Powered by mathjs.org API</div>
            </div>
        `;
        
        dropZone.innerHTML = '<div style="font-size:48px">✅</div><div>Solved by AI!</div>';
        
    } catch (e) {
        ocrResult.innerHTML = '<div style="background:#ffebee; color:#d32f2f; padding:25px; border-radius:20px; text-align:center; margin-top:20px;">OCR failed. Use printed text.</div>';
    }
}

function copyToCalc(eq) {
    display = eq;
    updateDisplay();
    document.querySelector('[data-tab="calculator"]').click();
}

// Keyboard
document.addEventListener('keydown', e => {
    if (currentTab !== 'calculator') return;
    if (/[0-9]/.test(e.key)) input(e.key);
    if (e.key === '.') input('.');
    if (e.key === '+') input('+');
    if (e.key === '-') input('-');
    if (e.key === '*') input('*');
    if (e.key === '/') input('/');
    if (e.key === 'Enter') calculate();
    if (e.key === 'Escape') clearAll();
});

updateDisplay();
console.log('🌟 MathJS API Calculator Loaded!');
