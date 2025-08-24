// js/utils.js

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
