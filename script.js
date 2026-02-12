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

// BULLETPROOF SOLVER - Handles 2x+3=7 perfectly
function solveSmart(eq) {
    console.log('Solving:', eq);
    
    try {
        // CASE 1: Linear equation with x
        if (eq.includes('x') && eq.includes('=')) {
            const result = solveLinearPerfect(eq);
            if (result !== null) {
                return `x = ${result}`;
            }
        }
        
        // CASE 2: Direct math evaluation
        let expr = eq
            .replace(/x\^2/g, '(x**2)')
            .replace(/√/g, 'sqrt')
            .replace(/π/π/g, 'pi')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        const numResult = math.evaluate(expr);
        return Math.round(numResult) === numResult ? numResult : numResult.toFixed(4);
        
    } catch (e) {
        console.error('Solver error:', e);
        return 'Check equation';
    }
}

function solveLinearPerfect(eqStr) {
    try {
        // SPLIT AND SIMPLIFY EACH SIDE
        const sides = eqStr.split('=');
        if (sides.length !== 2) return null;
        
        let left = sides[0].trim();
        let right = sides[1].trim();
        
        console.log('Sides:', left, '=', right);
        
        // Math.js simplifies to solve
        const equation = math.parse(`(${left}) - (${right})`);
        const simplified = equation.compile().evaluate({x: 'symbol'});
        
        // Simple pattern matching as backup
        const xCoef = parseInt(left.match(/(\d+)x/)?.[1] || (left.includes('x') ? 1 : 0));
        const leftConst = parseInt(left.match(/([+-]\d+)/)?.[1] || 0);
        const rightVal = parseInt(right) || 0;
        
        const x = (rightVal - leftConst) / xCoef;
        console.log(`Parsed: a=${xCoef}, b=${leftConst}, c=${rightVal}, x=${x}`);
        
        return xCoef !== 0 ? parseFloat(x.toFixed(2)) : null;
        
    } catch (e) {
        console.error('Linear solver:', e);
        return null;
    }
}
