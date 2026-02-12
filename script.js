// 🧮 PERFECT SCIENTIFIC CALCULATOR - FIXED OCR SOLVER
// Handles "2x+3=7" → x = 2 perfectly!

let display = '0';
let currentTab = 'calculator';

// ===== CALCULATOR FUNCTIONS =====
function updateDisplay() {
    document.getElementById('display').textContent = display;
}

function input(value) {
    if (display === '0' && !['+', '-', '*', '/', 'sin(', 'cos(', 'log('].includes(value)) {
        display = value;
    } else {
        display += value;
    }
    updateDisplay();
}

function clearAll() {
    display = '0';
    updateDisplay();
}

function calculate() {
    try {
        let expr = display
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');
        
        let result = math.evaluate(expr);
        display = result.toString();
        updateDisplay();
    } catch {
        display = 'Error';
        updateDisplay();
    }
}

// ===== TAB SWITCHING =====
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Hide all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        
        // Show selected
        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
        currentTab = targetTab;
    });
});

// ===== OCR - PERFECT MATH SOLVER =====
const dropZone = document.getElementById('dropZone');
const ocrResult = document.getElementById('ocrResult');

// Drag & Drop
dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) processOCR(file);
});

// Paste image (Ctrl+V)
document.addEventListener('paste', e => {
    if (currentTab !== 'ocr') return;
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            processOCR(file);
            break;
        }
    }
});

async function processOCR(file) {
    dropZone.innerHTML = '<div style="font-size:48px;margin-bottom:10px">⏳</div><div>Extracting equation...</div>';
    
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            tessedit_char_whitelist: '0123456789+-*/=().xXyπ√^e ',
            tessedit_pageseg_mode: 8,  // Single word/line
            tessedit_ocr_engine_mode: '1'
        });
        
        // CLEAN & FILTER FOR MATH ONLY
        let rawText = text.trim().replace(/\s+/g, '');
        let equation = rawText
            .replace(/Printed:|Image:|jpg|png/gi, '')  // Remove labels
            .replace(/[^0-9+\-*/=().x√^πe ]/g, '')    // Math chars only
            .replace(/O/g, '0')
            .replace(/S/g, '5')
            .replace(/l/g, '1')
            .replace(/Z/g, '2');
        
        console.log('🔍 RAW OCR:', rawText);
        console.log('✅ CLEAN MATH:', equation);
        
        const solution = solvePerfect(equation);
        
        ocrResult.innerHTML = `
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); 
                        padding: 25px; border-radius: 20px; margin-top: 20px; text-align: center;">
                <div style="font-size: 32px; font-family: 'Courier New', monospace; 
                           background: white; padding: 15px; border-radius: 10px; margin: 15px 0;
                           color: #1976d2;">
                    ${equation}
                </div>
                <div style="font-size: 28px; color: #2e7d32; font-weight: bold; margin-bottom: 15px;">
                    ✅ ${solution}
                </div>
                <button onclick="copyToCalc('${equation}')" 
                        style="width: 100%; padding: 15px; background: linear-gradient(45deg, #4CAF50, #45a049);
                               color: white; border: none; border-radius: 12px; font-size: 18px; 
                               font-weight: bold; cursor: pointer; margin-top: 10px;">
                    ➤ Continue in Calculator
                </button>
            </div>
        `;
        
        dropZone.innerHTML = '<div style="font-size:48px">✅</div><div style="font-size:18px">Perfect! Paste next equation</div>';
        
    } catch (error) {
        console.error('OCR failed:', error);
        ocrResult.innerHTML = `
            <div style="background: linear-gradient(135deg, #ffcdd2, #f8bbd9); 
                        color: #c62828; padding: 25px; border-radius: 20px; margin-top: 20px; text-align: center;">
                <div style="font-size: 24px;">📸 No equation detected</div>
                <div style="font-size: 16px; margin-top: 10px;">
                    💡 <strong>Tips:</strong> Crop tight, black on white, printed text
                </div>
            </div>
        `;
        dropZone.innerHTML = '<div style="font-size:48px">📷</div><div>Try again</div>';
    }
}

// 🔥 BULLETPROOF MATH SOLVER
function solvePerfect(eq) {
    console.log('🧮 Solving:', eq);
    
    try {
        // PRIORITY 1: Linear equations (2x+3=7)
        if (eq.includes('x') && eq.includes('=')) {
            const xValue = solveLinear(eq);
            if (xValue !== null) {
                return `x = ${parseFloat(xValue.toFixed(2))}`;
            }
        }
        
        // PRIORITY 2: Evaluate expression
        let expr = eq
            .replace(/√/g, 'sqrt')
            .replace(/π/g, 'pi')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**');
        
        const result = math.evaluate(expr);
        return result === Math.round(result) ? result : result.toFixed(4);
        
    } catch (e) {
        console.error('Solver error:', e);
        return 'Check symbols';
    }
}

// PERFECT LINEAR SOLVER: 2x+3=7 → x=2
function solveLinear(eqStr) {
    try {
        const sides = eqStr.split('=');
        if (sides.length !== 2) return null;
        
        const left = sides[0].trim();
        const right = parseFloat(sides[1].trim()) || 0;
        
        // Extract coefficient of x: "2x" → 2
        let coefMatch = left.match(/(-?\d*\.?\d*)x/);
        let coef = coefMatch ? parseFloat(coefMatch[1]) : (left.includes('x') ? 1 : 0);
        
        // Extract constant: "+3" or "-5"
        let constMatch = left.match(/x([+-]\d*\.?\d*)/);
        let constant = constMatch ? parseFloat(constMatch[1]) : 0;
        
        if (coef === 0) return null;
        
        const x = (right - constant) / coef;
        console.log(`Solved: ${coef}x ${constant >= 0 ? '+' : ''}${constant} = ${right} → x = ${x}`);
        
        return x;
    } catch (e) {
        console.error('Linear parse error:', e);
        return null;
    }
}

function copyToCalc(eq) {
    display = eq;
    updateDisplay();
    document.querySelector('[data-tab="calculator"]').click();
}

// Keyboard support
document.addEventListener('keydown', e => {
    if (currentTab !== 'calculator') return;
    
    if (/[0-9]/.test(e.key)) input(e.key);
    if (e.key === '.') input('.');
    if (e.key === '+') input('+');
    if (e.key === '-') input('-');
    if (e.key === '*') input('*');
    if (e.key === '/') input('/');
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape') clearAll();
});

// Initialize
updateDisplay();
console.log('🚀 Scientific Calculator Loaded - OCR Fixed!');
