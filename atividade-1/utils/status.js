// depois organiza pelo numero

function baseAtualizaOk(res, base) {
    return res.status(200).json({ base, msg: 'Base atualizada com sucesso.' });
}

function baseRecuperaOk(res, base) {
    return res.status(200).json({ base, msg: 'Base(s) recuperada(s) com sucesso.' });
}

function aluguelOk(res, base) {
    return res.status(200).json({ base, msg: 'Base alugada com sucesso.' });
}

function baseCria(res, base) {
    return res.status(201).json({ base, msg: 'Base adicionada com sucesso.' });
}

function deleteNoContent(res) {
    return res.status(204).send();
}

function badRequest(res, erros) {
    return res.status(400).json({ erros });
}

function badRequestTitulo(res) {
    return res.status(400).json({ msg: 'O campo [Titulo] é obrigatório.' });
}

function senhaBadRequest(res) {
    return res.status(400).json({ msg: 'A senha de acesso à base está incorreta.' });
}

function disponivelBadRequest(res) {
    return res.status(400).json({ msg: 'Base não disponível para aluguel.' });
}

function baseNotFound(res) {
    return res.status(404).json({ msg: 'Base não encontrada' });
}

function basesNotFound(res) {
    return res.status(404).json({ msg: 'Não há bases cadastradas no sistema.' });
}

function filtroNotFound(res) {
    return res.status(404).json({ msg: 'Não foram encontradas bases correspondentes ao filtro desejado.' });
}

function serverError(res) {
    return res.status(500).json({ msg: 'Erro interno no servidor.' });
}

module.exports = { baseAtualizaOk, baseRecuperaOk, aluguelOk, baseCria, deleteNoContent, badRequest, badRequestTitulo, senhaBadRequest, disponivelBadRequest, baseNotFound, basesNotFound, filtroNotFound, serverError };