// Global state
let display = '0';
let currentTab = 'calculator';

// Update display
function updateDisplay() {
    document.getElementById('display').textContent = display;
}

// Input handling
function input(value) {
    if (display === '0' && !['+', '-', '*', '/', 'sin(', 'cos(', 'log(', 'Math.PI', 'Math.E', 'Math.sqrt('].includes(value)) {
        display = value;
    } else {
        display += value;
    }
    updateDisplay();
}

// Clear
function clearAll() {
    display = '0';
    updateDisplay();
}

// Calculate
function calculate() {
    try {
        let expression = display
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');
        
        let result = math.evaluate(expression);
        display = Number.isInteger(result) ? result.toString() : result.toFixed(8);
        updateDisplay();
    } catch (error) {
        display = 'Error';
        updateDisplay();
    }
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
        currentTab = targetTab;
    });
});

// OCR functionality
const dropZone = document.getElementById('dropZone');
const ocrResult = document.getElementById('ocrResult');

// Drag & drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processOCR(file);
    }
});

// Paste support
document.addEventListener('paste', async (e) => {
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
    dropZone.innerHTML = '<div class="drop-icon">⏳</div><div class="drop-text">Processing image...</div>';
    
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            tessedit_char_whitelist: '0123456789+-*/=().xπ√e',
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
        });
        
        const equation = text.trim().replace(/\s+/g, '');
        const solution = solveEquation(equation);
        
        ocrResult.innerHTML = `
            <div class="result-box">
                <div style="font-size: 24px; margin-bottom: 10px;">📝 Detected Equation</div>
                <div style="font-size: 28px; font-family: monospace; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-bottom: 15px;">${equation}</div>
                <div style="font-size: 22px;">✅ Solution: <strong>${solution}</strong></div>
            </div>
        `;
        dropZone.innerHTML = '<div class="drop-icon">✅</div><div class="drop-text">Success! Ready for next image</div>';
    } catch (error) {
        ocrResult.innerHTML = `
            <div class="result-box" style="background: linear-gradient(45deg, #ff3b30, #ff9500);">
                ❌ OCR failed. Try a clearer image or type manually.
            </div>
        `;
        dropZone.innerHTML = '<div class="drop-icon">📷</div><div class="drop-text">Try again</div>';
    }
}

function solveEquation(eq) {
    try {
        if (eq.includes('=')) {
            const [left, right] = eq.split('=').map(s => s.replace(/x/g, 'x'));
            const expr = `(${left})-(${right})`;
            return math.evaluate(expr.replace('x', '1')); // Simple linear solver
        }
        return math.evaluate(eq.replace(/×/g, '*').replace(/π/g, 'Math.PI'));
    } catch {
        return 'Cannot solve';
    }
}

// Graphing
function renderGraph() {
    const input = document.getElementById('graphInput').value.trim();
    if (!input) return;
    
    try {
        const xValues = [];
        const yValues = [];
        
        // Generate x from -10 to 10
        for (let i = 0; i <= 500; i++) {
            const x = (i - 250) / 25;
            xValues.push(x);
            try {
                const y = math.evaluate(input.replace(/x/g, x).replace(/π/g, 'Math.PI'));
                yValues.push(y);
            } catch {
                yValues.push(null);
            }
        }
        
        const trace = {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#667eea', width: 4 },
            name: input
        };
        
        Plotly.newPlot('graphContainer', [trace], {
            title: { text: `Graph: ${input}`, font: { size: 18 } },
            showlegend: false,
            margin: { l: 50, r: 50, t: 60, b: 50 },
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' }
        });
    } catch (error) {
        alert('Invalid equation. Try: y = x^2, y = sin(x), etc.');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (currentTab !== 'calculator') return;
    
    const numKeys = '0123456789'.split('');
    if (numKeys.includes(e.key)) input(e.key);
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
