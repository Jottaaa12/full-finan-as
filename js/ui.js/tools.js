import { formatCurrency } from './utils.js';
import { openModal } from './ui.js';

let userTransactions = [];
let reconciliationParsedRows = [];

/**
 * Inicializa os listeners da página de ferramentas.
 * @param {Array} transactions As transações do usuário.
 */
export function initTools(transactions) {
    userTransactions = transactions;
    
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

    if (initialAmount < 0 || monthlyContribution < 0 || annualRate < 0 || years < 0) {
        alert('Os valores para o cálculo de juros compostos não podem ser negativos.');
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;

    let finalAmount = initialAmount * Math.pow(1 + monthlyRate, months);
    if (monthlyRate > 0) {
        finalAmount += monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }

    const totalInvested = initialAmount + (monthlyContribution * months);
    const totalInterest = finalAmount - totalInvested;

    document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('final-amount').textContent = formatCurrency(finalAmount);
    document.getElementById('calculator-results').classList.remove('hidden');
}

// --- Conciliação Bancária ---
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
        
        const { transactionsToLaunch, matchedTransactions } = compareTransactions(reconciliationParsedRows, userTransactions);
        
        // Store the transactions to launch globally so the launch handler can access them
        // We need to map them back to the original parsed rows to keep a stable index
        window.transactionsToLaunch = transactionsToLaunch;

        renderReconciliationResults(transactionsToLaunch, matchedTransactions);
    };
    reader.readAsText(file, 'utf-8');
}

function parseCsvToRows(text) {
    const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
    if (rows.length < 2) {
        alert('Arquivo CSV vazio ou sem dados.');
        return [];
    }

    const header = rows.shift().toLowerCase().split(/[;,]/).map(h => h.trim().replace(/"/g, ''));
    const dateIndex = header.findIndex(h => h.includes('data'));
    const descIndex = header.findIndex(h => h.includes('desc') || h.includes('hist'));
    const amountIndex = header.findIndex(h => h.includes('valor'));

    if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
        alert('Cabeçalho do CSV inválido. As colunas devem conter "Data", "Descrição" e "Valor".');
        return [];
    }

    return rows.map(row => {
        const columns = row.split(/[;,]/);
        if (columns.length < header.length) return null;

        try {
            const dateParts = columns[dateIndex].trim().replace(/"/g, '').split('/');
            const date = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

            let amountStr = columns[amountIndex].trim().replace(/"/g, '');
            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
            const amount = parseFloat(amountStr);

            const description = columns[descIndex].trim().replace(/"/g, '');

            if (isNaN(date.getTime()) || isNaN(amount) || !description) return null;

            return { date, description, amount };
        } catch (e) {
            console.warn('Não foi possível processar a linha do CSV:', row, e);
            return null;
        }
    }).filter(Boolean);
}

function compareTransactions(csvRows, userTransactions) {
    const transactionsToLaunch = [];
    const matchedTransactions = [];
    const userTransactionsCopy = [...userTransactions];

    csvRows.forEach(csvRow => {
        let foundMatch = false;
        for (let i = 0; i < userTransactionsCopy.length; i++) {
            const userT = userTransactionsCopy[i];
            const userDate = userT.date.toDate();
            
            const sameDay = userDate.getFullYear() === csvRow.date.getFullYear() &&
                            userDate.getMonth() === csvRow.date.getMonth() &&
                            userDate.getDate() === csvRow.date.getDate();

            const sameAmount = Math.abs(Math.abs(userT.amount) - Math.abs(csvRow.amount)) < 0.01;

            if (sameDay && sameAmount) {
                matchedTransactions.push({ ...userT, csvRow });
                userTransactionsCopy.splice(i, 1);
                foundMatch = true;
                break;
            }
        }

        if (!foundMatch) {
            transactionsToLaunch.push(csvRow);
        }
    });

    return { transactionsToLaunch, matchedTransactions };
}

function renderReconciliationResults(toLaunch, matched) {
    const toLaunchList = document.getElementById('reconciliation-to-launch-list');
    toLaunchList.innerHTML = '';
    if (toLaunch.length > 0) {
        toLaunch.forEach((row, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `<span><b>${row.date.toLocaleDateString('pt-BR')}</b> - ${row.description} <strong>${formatCurrency(row.amount)}</strong></span>
                            <button class="btn-primary reconciliation-launch-btn" data-idx="${idx}">Lançar</button>`;
            toLaunchList.appendChild(li);
        });
    } else {
        toLaunchList.innerHTML = '<li class="empty-state-small">Nenhuma nova transação encontrada para lançar.</li>';
    }

    const matchedInfo = document.getElementById('reconciliation-matched-info');
    matchedInfo.textContent = `${matched.length} transações foram conciliadas com sucesso.`;

    document.getElementById('reconciliation-results').classList.remove('hidden');
}

function handleReconciliationLaunch(e) {
    if (!e.target.matches('.reconciliation-launch-btn')) return;
    const idx = e.target.dataset.idx;
    const row = window.transactionsToLaunch[idx]; // Use the globally stored array
    if (row) {
        const form = document.getElementById('transaction-form');
        form.reset();
        form['transaction-id'].value = '';
        document.getElementById('transaction-modal-title').textContent = 'Nova Transação (Conciliação)';
        
        form['transaction-description'].value = row.description;
        form['transaction-amount'].value = Math.abs(row.amount);
        form['transaction-type'].value = row.amount < 0 ? 'despesa' : 'receita';
        form['transaction-date'].value = row.date.toISOString().split('T')[0];
        form['transaction-paid'].checked = true;

        openModal('transaction-modal');
    }
}