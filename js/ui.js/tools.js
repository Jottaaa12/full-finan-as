
import { formatCurrency } from './utils.js';
import { openModal } from './ui.js';

/**
 * Inicializa os listeners da página de ferramentas.
 */
export function initTools() {
    // Calculadora
    document.getElementById('compound-interest-form')?.addEventListener('submit', calculateCompoundInterest);

    // Conciliação
    document.getElementById('reconciliation-csv-input')?.addEventListener('change', handleCsvFileSelect);
    document.getElementById('reconciliation-process-btn')?.addEventListener('click', processReconciliationFile);
    document.getElementById('reconciliation-to-launch-list')?.addEventListener('click', handleReconciliationLaunch);
}

// --- Calculadora de Juros Compostos ---
function calculateCompoundInterest(e) {
    e.preventDefault();
    const form = e.target;
    const initialAmount = parseFloat(form['initial-amount'].value) || 0;
    const monthlyContribution = parseFloat(form['monthly-contribution'].value) || 0;
    const annualRate = parseFloat(form['interest-rate'].value) || 0;
    const years = parseFloat(form['period-years'].value) || 0;

    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;

    let finalAmount = initialAmount * Math.pow(1 + monthlyRate, months);
    finalAmount += monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    const totalInvested = initialAmount + (monthlyContribution * months);
    const totalInterest = finalAmount - totalInvested;

    document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('final-amount').textContent = formatCurrency(finalAmount);
    document.getElementById('calculator-results').classList.remove('hidden');
}

// --- Conciliação Bancária ---
let reconciliationParsedRows = [];

function handleCsvFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('reconciliation-file-name').textContent = file.name;
        document.getElementById('reconciliation-process-btn').disabled = false;
    }
}

function processReconciliationFile() {
    const file = document.getElementById('reconciliation-csv-input').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        reconciliationParsedRows = parseCsvToRows(text);
        // A lógica de comparação com as transações existentes precisaria ser chamada aqui
        // Ex: processReconciliation(reconciliationParsedRows, getTransactions());
        renderReconciliationResults(reconciliationParsedRows, []); // Simulação
    };
    reader.readAsText(file, 'utf-8');
}

function parseCsvToRows(text) {
    // Lógica para parsear o CSV
    return []; // Simulação
}

function renderReconciliationResults(toLaunch, matched) {
    const toLaunchList = document.getElementById('reconciliation-to-launch-list');
    toLaunchList.innerHTML = '';
    toLaunch.forEach((row, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><b>${row.date}</b> - ${row.description} <strong>${formatCurrency(row.value)}</strong></span>
                        <button class="btn-primary reconciliation-launch-btn" data-idx="${idx}">Lançar</button>`;
        toLaunchList.appendChild(li);
    });
    document.getElementById('reconciliation-results').classList.remove('hidden');
}

function handleReconciliationLaunch(e) {
    if (!e.target.matches('.reconciliation-launch-btn')) return;
    const idx = e.target.dataset.idx;
    const row = reconciliationParsedRows[idx];
    if (row) {
        // Pré-preenche o modal de transação
        openModal('transaction-modal');
        document.getElementById('transaction-description').value = row.description;
        document.getElementById('transaction-amount').value = row.value;
    }
}
