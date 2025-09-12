/**
 * Formata um valor numérico para a moeda definida pelo usuário.
 * @param {number} value O valor a ser formatado.
 * @param {string} userCurrency A moeda do usuário (ex: 'BRL', 'USD', 'EUR').
 * @returns {string} O valor formatado como moeda.
 */
export function formatCurrency(value, userCurrency = 'BRL') {
    if (typeof value !== 'number') {
        value = 0;
    }
    
    const currencyMap = {
        'BRL': { locale: 'pt-BR', currency: 'BRL' },
        'USD': { locale: 'en-US', currency: 'USD' },
        'EUR': { locale: 'de-DE', currency: 'EUR' }
    };
    
    const config = currencyMap[userCurrency] || currencyMap['BRL'];
    
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency
    }).format(value);
}

/**
 * Calcula o ciclo de faturamento de um cartão de crédito.
 * @param {object} card O objeto do cartão com closingDay e dueDate.
 * @returns {object} Um objeto com as datas de início, fim e vencimento do ciclo.
 */
export function getBillingCycle(card) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const closingDay = card.closingDay;
    let start, end, due;

    if (!closingDay || !card.dueDate) {
        // Retorna um ciclo padrão ou nulo se os dias não estiverem definidos
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        return { start: startOfMonth, end: endOfMonth, due: endOfMonth };
    }

    if (today.getDate() > closingDay) {
        // O ciclo atual já fechou, estamos no período do próximo ciclo
        start = new Date(year, month, closingDay + 1);
        end = new Date(year, month + 1, closingDay);
        due = new Date(year, month + 1, card.dueDate);
    } else {
        // Ainda estamos no ciclo atual
        start = new Date(year, month - 1, closingDay + 1);
        end = new Date(year, month, closingDay);
        due = new Date(year, month, card.dueDate);
    }
    return { start, end, due };
}