function isString(entrada) {
    return typeof entrada === 'string';
}

function isNull(entrada) {
    return entrada === null || entrada === undefined;
}

// Função que capitaliza strings, de modo que a primeira letra de cada palavra fique maiúscula, para padronizar a utilização dos dados ao longo do programa
function capitaliza(entrada) {
    if (isNull(entrada) || !isString(entrada)) {
        return null;
    }

    const words = entrada.toLowerCase().split(' ');

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    return words.join(' ');
}

// Função que retorna a data do dia anterior no formato ano-mês-dia
function getDataOntem() {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    const ano = ontem.getFullYear();
    const mes = String(ontem.getMonth() + 1).padStart(2, '0');
    const dia = String(ontem.getDate()).padStart(2, '0');
    const dataFormat = `${ano}-${mes}-${dia}`;
    return dataFormat;
}

module.exports = { isString, isNull, capitaliza, getDataOntem };
