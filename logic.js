// Conjuntos predefinidos de proposiciones
const TAUTOLOGIES = [
    'p∨¬p',
    '(p∧q)→p',
    '¬(p∧¬p)',
    '(p→q)∨(q→p)',
    'p↔p'
];

const CONTRADICTIONS = [
    'p∧¬p',
    '(p∨q)∧¬(p∨q)',
    '¬(p↔p)',
    'p∧(p→¬p)',
    '(p∧q)∧¬(p∧q)'
];

const CONTINGENCIES = [
    'p∧q',
    'p∨q',
    'p→q',
    'p↔q',
    '(p∨q)∧¬(p∧q)'
];

// Función para evaluar una proposición lógica
function evaluateLogicalExpression(expression, values) {
    // Reemplazar operadores con sus equivalentes en JavaScript
    let evalExpression = expression
        .replace(/∧/g, '&&')
        .replace(/∨/g, '||')
        .replace(/¬/g, '!')
        .replace(/→/g, '<=')
        .replace(/↔/g, '==')
        .replace(/⊕/g, '!=');

    // Crear función para evaluar la expresión con los valores dados
    try {
        return Function(...Object.keys(values), `return ${evalExpression}`)(...Object.values(values));
    } catch (error) {
        return null;
    }
}

// Función para generar todas las combinaciones posibles de valores de verdad
function generateTruthCombinations(variables) {
    const combinations = [];
    const numCombinations = Math.pow(2, variables.length);
    
    for (let i = 0; i < numCombinations; i++) {
        const combination = {};
        for (let j = 0; j < variables.length; j++) {
            combination[variables[j]] = !!(i & (1 << j));
        }
        combinations.push(combination);
    }
    
    return combinations;
}

// Función para extraer variables de la proposición
function extractVariables(proposition) {
    const variables = new Set();
    for (const char of proposition) {
        if (/[pqrs]/.test(char)) {
            variables.add(char);
        }
    }
    return Array.from(variables).sort();
}

function parseProposition(prop) {
    // Convertir a minúsculas y eliminar espacios en blanco
    prop = prop.toLowerCase().replace(/\s+/g, '');
    
    // Actualizar caracteres válidos
    const validChars = /^[pqrs∧∨⊕→↔¬()]+$/;
    
    if (!validChars.test(prop)) return null;
    
    let parenthesesCount = 0;
    for (let char of prop) {
        if (char === '(') parenthesesCount++;
        if (char === ')') parenthesesCount--;
        if (parenthesesCount < 0) return null;
    }
    
    return parenthesesCount === 0 ? prop : null;
}

function addSymbol(symbol) {
    const propositionInput = document.getElementById('proposition');
    propositionInput.value += symbol;
    propositionInput.focus();
}

function evaluateProposition() {
    const propositionInput = document.getElementById('proposition');
    const evaluationTypeSelect = document.getElementById('evaluationType');
    const resultDiv = document.getElementById('result');
    const container = document.querySelector('.container');

    const proposition = parseProposition(propositionInput.value);
    
    if (!proposition) {
        resultDiv.innerHTML = '❌ Proposición inválida';
        resultDiv.className = 'result result-error';
        container.className = 'container error-border';
        setTimeout(() => {
            container.className = 'container';
        }, 1000);
        return;
    }

    // Extraer variables y generar tabla de verdad
    const variables = extractVariables(proposition);
    const combinations = generateTruthCombinations(variables);
    
    // Evaluar cada combinación
    let trueCount = 0;
    let totalCombinations = combinations.length;
    
    for (const combination of combinations) {
        if (evaluateLogicalExpression(proposition, combination)) {
            trueCount++;
        }
    }

    // Determinar el tipo de proposición
    let result = false;
    let type = '';
    
    switch(evaluationTypeSelect.value) {
        case 'tautology':
            result = trueCount === totalCombinations;
            type = 'Tautología';
            break;
        case 'contradiction':
            result = trueCount === 0;
            type = 'Contradicción';
            break;
        case 'contingency':
            result = trueCount > 0 && trueCount < totalCombinations;
            type = 'Contingencia';
            break;
    }

    // Generar mensaje detallado
    let message = `${result ? '✅ Correcto' : '❌ Incorrecto'}<br>`;
    message += `Esta proposición es ${trueCount === totalCombinations ? 'una Tautología' : 
                trueCount === 0 ? 'una Contradicción' : 
                'una Contingencia'}<br>`;
    message += `(Verdadera en ${trueCount} de ${totalCombinations} casos)`;

    // Mostrar resultado
    resultDiv.innerHTML = message;
    resultDiv.className = `result ${result ? 'result-success' : 'result-error'}`;
    container.className = `container ${result ? 'success-border' : 'error-border'}`;
    setTimeout(() => {
        container.className = 'container';
    }, 1000);
} 