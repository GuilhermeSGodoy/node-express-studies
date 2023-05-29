const BaseModel = require('../models/Base');
const { isString, isNull, capitaliza } = require('./common');

function validaTitulo(base) {
    if (!isString(base.titulo) && !isNull(base.titulo)) {
        return 'O campo [Título] é obrigatório e deve ser uma string.';
    }
}

async function validaBaseExistente(titulo) {
    const baseCriada = await BaseModel.findOne({ titulo });

    if (baseCriada) {
        return 'A base já foi criada anteriormente.';
    }
}

function validaFachada(base) {
    if (!isString(base.fachada)) {
        return 'O campo [Fachada] é obrigatório e deve ser uma string.';
    }
}

function validaCidade(base) {
    const cidadesDisp = ['nova york', 'rio de janeiro', 'tóquio'];

    if (!isString(base.cidade)) {
        return 'O campo [Cidade] é obrigatório e deve ser uma string.';
    }

    if (!cidadesDisp.includes(base.cidade.toLowerCase())) {
        return `A cidade ${base.cidade} não faz parte da lista de cidades disponíveis.`;
    }
}

function validaTecnologias(base) {
    const tecDisp = ['laboratório de nanotecnologia', 'jardim de ervas venenosas', 'estande de tiro', 'academia de parkour'];

    if (!Array.isArray(base.tecnologias) || !base.tecnologias.every(isString)) {
        return 'O campo [Tecnologias] é obrigatório e deve ser um array de strings.';
    }

    const tecInvalidas = base.tecnologias.filter(tec => !tecDisp.includes(tec.toLowerCase()));

    if (tecInvalidas.length > 0) {
        return `Lamentamos, mas ${capitaliza(tecInvalidas.join(', '))} não faz(em) parte da nossa lista de tecnologias disponíveis.`;
    }
}

function validaSenha(base) {
    if (!isString(base.senha)) {
        return 'O campo [Senha] é obrigatório e deve ser uma string.';
    }
}

function validaTituloEFachada(base) {
    if (base.titulo === base.fachada) {
        return 'O título e a fachada da base não podem ser iguais.';
    }
}

// Funções de validação da criação e atualização de uma base. A diferença entre elas é a forma de tratar o título
async function validaCreate(base) {
    const erros = [];

    erros.push(validaTitulo(base));
    erros.push(await validaBaseExistente(capitaliza(base.titulo)));
    erros.push(validaFachada(base));
    erros.push(validaCidade(base));
    erros.push(validaTecnologias(base));
    erros.push(validaSenha(base));
    erros.push(validaTituloEFachada(base));

    return erros.filter(erro => erro !== undefined);
}

async function validaUpdate(base) {
    const erros = [];

    if (!isNull(base.titulo)) {
        erros.push(validaTitulo(base));
        erros.push(await validaBaseExistente(capitaliza(base.titulo)));
    }

    erros.push(validaFachada(base));
    erros.push(validaCidade(base));
    erros.push(validaTecnologias(base));
    erros.push(validaSenha(base));
    erros.push(validaTituloEFachada(base));

    return erros.filter(erro => erro !== undefined);
}

module.exports = { validaCreate, validaUpdate };