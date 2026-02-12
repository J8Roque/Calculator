// ULTRA-PRECISE MATH OCR - Replace ENTIRE OCR section
async function processOCR(file) {
    dropZone.innerHTML = '<div class="drop-icon">⏳</div><div class="drop-text">Extracting math...</div>';
    
    try {
        // MATH-SPECIFIC TESSERACT SETTINGS [web:42]
        const { data: { text, words } } = await Tesseract.recognize(file, 'eng+equ', {
            tessedit_char_whitelist: '0123456789+-*/=().xXyπ√^e% ',
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_WORD,  // Focus on equation block
            tessedit_ocr_engine_mode: '1'
        });
        
        // EXTRACT ONLY MATH PART - Ignore "Printed:", filenames, etc.
        let rawText = text.trim().replace(/\s+/g, '');
        
        // Filter to math-like strings only
        const mathCandidates = rawText
            .split(/[;,\n]/)  // Split by separators
            .map(s => s.trim())
            .filter(s => {
                // Must contain math symbols
                return /[+\-*/=()x√]/.test(s) && s.length > 2 && s.length < 30;
            });
        
        let equation = mathCandidates[0] || rawText;
        
        // Clean common OCR errors
        equation = equation
            .replace(/O/g, '0')
            .replace(/l/g, '1')
            .replace(/S/g, '5')
            .replace(/Z/g, '2')
            .replace(/B/g, '8')
            .replace(/Printed:|Image:/gi, '')  // Remove labels
            .replace(/jpg|png/gi, '')
            .replace(/[^0123456789+\-*/=().xXy√^eπ%]/g, '');  // Keep ONLY math chars
        
        console.log('RAW OCR:', rawText);
        console.log('CANDIDATES:', mathCandidates);
        console.log('FINAL EQ:', equation);
        
        const solution = solveEquationImproved(equation);
        
        ocrResult.innerHTML = `
            <div class="result-box">
                <div style="font-size:20px;margin-bottom:10px">
                    📝 <strong>Raw:</strong> <span style="background:#ffeb3b;color:#333;padding:4px;border-radius:4px;font-family:monospace">${rawText}</span>
                </div>
                <div style="font-size:24px;margin:15px 0;background:#e3f2fd;padding:15px;border-radius:10px;font-family:monospace">
                    ✅ <strong>Math:</strong> ${equation}
                </div>
                <div style="font-size:22px;background:#e8f5e8;padding:15px;border-radius:10px">
                    <strong>Solution:</strong> ${solution}
                </div>
                <button onclick="copyToCalc('${equation}')" 
                        style="width:100%;margin-top:15px;padding:12px;background:#5856d6;border:none;border-radius:8px;color:white;font-size:16px;font-weight:bold;cursor:pointer">
                    ➤ Use in Calculator
                </button>
            </div>
        `;
        dropZone.innerHTML = '<div class="drop-icon">✅</div><div class="drop-text">Fixed! Paste next equation</div>';
        
    } catch (error) {
        console.error(error);
        ocrResult.innerHTML = `
            <div class="result-box" style="background:linear-gradient(45deg,#ff6b6b,#ee5a52)">
                ❌ No math detected. <strong>Tips:</strong><br>
                • Crop to JUST the equation<br>
                • Black text on white background<br>
                • Printed > handwriting
            </div>
        `;
    }
}

// BETTER LINEAR SOLVER
function solveEquationImproved(eq) {
    try {
        // Test simple cases first
        if (eq.includes('=') && eq.includes('x')) {
            const result = solveLinear(eq);
            if (result !== null) return `x = ${result.toFixed(2)}`;
        }
        
        // Direct evaluation
        let expr = eq
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/√/g, 'sqrt')
            .replace(/π/g, 'pi')
            .replace(/\^/g, '**');
        
        const result = math.evaluate(expr);
        return Number.isInteger(result) ? result : result.toFixed(4);
        
    } catch (e) {
        return `<span style="color:#ff9800">Edit manually 👆</span>`;
    }
}

function solveLinear(eq) {
    // 2x + 3 = 7 → x = 2
    const match = eq.match(/([+-]?\d*\.?\d*)?\s*x\s*([+-]\s*\d*\.?\d*)?\s*=\s*([+-]?\d*\.?\d*)/i);
    if (match) {
        const a = parseFloat(match[1] || 1);
        const b = parseFloat(match[2] || 0);
        const c = parseFloat(match[3] || 0);
        return a !== 0 ? (c - b) / a : null;
    }
    return null;
}
