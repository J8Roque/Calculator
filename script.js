// IMPROVED OCR FUNCTION (Replace the OCR section in script.js)
async function processOCR(file) {
    dropZone.innerHTML = '<div class="drop-icon">⏳</div><div class="drop-text">Processing image...</div>';
    
    try {
        // BETTER TESSERACT CONFIG FOR MATH [web:42]
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            logger: m => console.log(m),  // Debug
            tessedit_char_whitelist: '0123456789+-*/=().xXyπ√e^ ',  // Math chars only
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_CHAR,  // Better for equations
            tessedit_ocr_engine_mode: '1'  // LSTM engine
        });
        
        let equation = text.trim()
            .replace(/\|/g, '')  // Remove noise
            .replace(/\s+/g, '') // Remove spaces
            .replace(/O/g, '0')  // O→0
            .replace(/l/g, '1')  // l→1
            .replace(/S/g, '5')  // S→5
            .toLowerCase();  // Normalize
        
        console.log('Raw OCR:', text);
        console.log('Cleaned:', equation);
        
        const solution = solveEquationImproved(equation);
        
        ocrResult.innerHTML = `
            <div class="result-box">
                <strong>Raw OCR:</strong> <code>${text.trim()}</code><br><br>
                <strong>Cleaned:</strong> <code style="font-size:22px">${equation}</code><br><br>
                <strong>Solution:</strong> ${solution}
                <button onclick="copyToCalc('${equation}')" style="margin-top:10px;padding:8px 16px;background:#5856d6;border:none;border-radius:6px;color:white;cursor:pointer">➤ Edit in Calculator</button>
            </div>
        `;
        
        dropZone.innerHTML = '✅ Success! Drop next image';
    } catch (error) {
        console.error('OCR Error:', error);
        ocrResult.innerHTML = '<div class="result-box" style="background:linear-gradient(45deg,#ff3b30,#ff9500)">❌ OCR failed. Tips:<br>• Use <strong>printed</strong> equations<br>• High contrast black/white<br>• Single equation per image</div>';
        dropZone.innerHTML = '📷 Try clearer image';
    }
}

// IMPROVED SOLVER - Handles more cases
function solveEquationImproved(eq) {
    try {
        // Fix common OCR errors
        eq = eq.replace(/xx/g, 'x^2')
               .replace(/\^2/g, '**2')
               .replace(/sqrt/g, 'sqrt')
               .replace(/pi/g, 'pi');
        
        // Solve linear equations ax+b=0
        if (eq.includes('=')) {
            const sides = eq.split('=');
            if (sides.length === 2) {
                let left = sides[0], right = sides[1];
                // Simple solver for ax + b = c
                const solved = solveLinear(left, right);
                if (solved !== null) return `x = ${solved}`;
            }
        }
        
        // Evaluate direct expression
        return math.evaluate(eq.replace(/×/g, '*').replace(/÷/g, '/'));
    } catch {
        return 'Parse error - edit manually';
    }
}

// Simple linear solver ax + b = c → x = (c - b)/a
function solveLinear(left, right) {
    try {
        // Extract coefficients (very basic)
        const a = parseFloat(left.match(/(-?\d*\.?\d*)x/)?.[1] || left.includes('x') ? 1 : 0);
        const b = parseFloat(left.replace(/(-?\d*\.?\d*)x/, '') || 0);
        const c = parseFloat(right || 0);
        
        if (a !== 0) {
            return (c - b) / a;
        }
        return null;
    } catch {
        return null;
    }
}

// Copy to calculator
function copyToCalc(eq) {
    display = eq;
    updateDisplay();
    showTab('calculator');  // Switch to calc tab
}

// Add this to dropZone click for testing
dropZone.addEventListener('click', () => {
    alert('💡 OCR Tips:\n• Printed text > handwriting\n• Black equations on white\n• One equation per image\n• Large, clear images work best');
});
