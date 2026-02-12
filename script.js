async function processOCR(file) {
    dropZone.innerHTML = '⏳ Extracting...';
    
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            tessedit_char_whitelist: '0123456789+-*/=().xXyπ√^e ',
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_WORD
        });
        
        let raw = text.trim().replace(/\s+/g, '');
        let equation = cleanEquation(raw);
        
        // **SMART SPLIT** - Find single equations
        const singleEqs = equation.split(/[=;]/).filter(eq => eq.length > 2);
        let bestEq = singleEqs.find(eq => eq.includes('x') && eq.includes('='));
        
        if (!bestEq) bestEq = equation.split('=')[0] || equation;  // Fallback
        
        const solution = solveSmart(bestEq);
        
        ocrResult.innerHTML = `
            <div class="result-box">
                <div><strong>📝 Raw:</strong> <code>${raw}</code></div>
                <div style="font-size:22px;margin:10px 0">
                    ✅ <strong>Best equation:</strong> <code>${bestEq}</code>
                </div>
                <div style="font-size:24px;background:#e8f5e8;padding:15px;border-radius:10px">
                    <strong>✅ Solved:</strong> ${solution}
                </div>
                <button onclick="copyToCalc('${bestEq}')" style="width:100%;padding:12px;margin-top:10px;background:#4CAF50;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer">
                    ➤ Solve in Calculator
                </button>
            </div>
        `;
        
    } catch(e) {
        ocrResult.innerHTML = '<div class="result-box" style="background:#ff6b6b">No equation found</div>';
    }
}

function cleanEquation(raw) {
    return raw
        .replace(/Printed:|image:/gi, '')
        .replace(/jpg|png/gi, '')
        .replace(/[^0-9+\-*/=().xXy√^eπ ]/g, '')
        .replace(/O/g,'0').replace(/l/g,'1').replace(/S/g,'5');
}

function solveSmart(eq) {
    try {
        // PRIORITY 1: Linear ax+b=c
        if (eq.includes('x') && eq.includes('=')) {
            const sides = eq.split('=');
            const left = sides[0], right = sides[1] || '0';
            
            // Extract coefficients
            const a = parseCoef(left, 'x');
            const b = parseConst(left);
            const c = parseFloat(right) || 0;
            
            if (a !== 0) {
                return `x = ${(c - b)/a}`;
            }
        }
        
        // PRIORITY 2: Evaluate expression
        let expr = eq
            .replace(/x\^2/g, 'x**2')
            .replace(/√/g, 'sqrt')
            .replace(/π/g, 'pi')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        return math.evaluate(expr);
        
    } catch {
        return 'Needs editing';
    }
}

function parseCoef(expr, varName) {
    const match = expr.match(new RegExp(`([+-]?\\d*(?:\\.\\d+)?)${varName}`));
    return parseFloat(match?.[1] || (expr.includes(varName) ? 1 : 0));
}

function parseConst(expr) {
    const constMatch = expr.match(/([+-]\d+(?:\.\d+)?)/g) || [];
    return constMatch.length ? parseFloat(constMatch[constMatch.length - 1]) || 0 : 0;
}
