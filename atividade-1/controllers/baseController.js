// Importações para o funcionamento do código: infelizmente não consegui encontrar uma maneira de importar tudo em um outro arquivo e trazer apenas um objeto deste outro arquivo para usá-lo (tive alguns problemas quando tentei isso)
const axios = require('axios');

const BaseModel = require('../models/Base');
const { capitaliza, isNull, getDataOntem } = require('../utils/common');
const { validaCreate, validaUpdate } = require('../utils/validator');
const { baseAtualizaOk, baseRecuperaOk, aluguelOk, baseCria, deleteNoContent, badRequest, badRequestTitulo, senhaBadRequest, disponivelBadRequest, baseNotFound, basesNotFound, filtroNotFound, serverError } = require('../utils/status');

const baseController = {

    create: async(req, res) => {

        try {
            const { titulo, fachada, cidade, tecnologias, senha } = req.body;

            const base = {
                titulo,
                fachada,
                cidade,
                tecnologias,
                senha,
                disponivel: true,
            };

            const erros = await validaCreate(base);

            if (erros.length > 0) {
                badRequest(res, erros);
            } else {
                // Por fim, cria a base totalmente validada
                base.titulo = capitaliza(base.titulo);
                base.fachada = capitaliza(base.fachada);
                base.cidade = capitaliza(base.cidade);
                base.tecnologias = base.tecnologias.map(tecnologia => capitaliza(tecnologia));

                const baseCriada = await BaseModel.create(base);
                baseCria(res, baseCriada);
            } 
        } catch (error) {
            // Tratamento do título na criação, que é essencial que seja obrigatório já que é a principal informação de identificação da base.
            if (error.name === 'ValidationError' && error.errors.titulo) {
                return badRequestTitulo(res);
            }
          
            serverError(res);
        }

    },

    getAll: async (req, res) => {

        try {
            const bases = await BaseModel.find().select('_id titulo cidade disponivel');
            
            if (!bases.length) {
                return basesNotFound(res);
            }

            baseRecuperaOk(res, bases);
        } catch (error) {
            console.log(error);
            serverError(res);
        }

    },

    get: async (req, res) => {

        try {
            const id = req.params.id;
            const base = await BaseModel.findById(id).select('_id titulo cidade disponivel');

            if (!base) {          
                return baseNotFound(res);
            }

            baseRecuperaOk(res, base);
        } catch (error) {
            console.log(error);
            serverError(res);
        }

    },
        
    delete: async (req, res) => {

        try {
            const id = req.params.id;
            let base = await BaseModel.findById(id);

            if (!base) {          
                return baseNotFound(res);
            }

            await BaseModel.findByIdAndDelete(id);
            deleteNoContent(res);
        } catch (error) {
            console.log(error);
            serverError(res);
        }
    },

    filtragem: async (req, res) => {

        try {
            const { titulo, cidade, tecnologias, disponivel } = req.query;
            const filtro = {};

            if (titulo) {
                filtro.titulo = capitaliza(titulo);
            }

            if (cidade) {
                filtro.cidade = capitaliza(cidade);
            }

            if (tecnologias) {
                filtro.tecnologias = { $in: tecnologias.split(',').map(tecnologia => capitaliza(tecnologia.trim())) };
            }

            if (disponivel) {
                filtro.disponivel = disponivel;
            }
                          
            const bases = await BaseModel.find(filtro).select('_id titulo cidade tecnologias disponivel');

            if (!bases.length) {
                return filtroNotFound(res);
            }

            baseRecuperaOk(res, bases)
        } catch (err) {
            console.error(err);
            serverError(res);
        }
    },
    
    update: async(req, res) => {

        try {
            const id = req.params.id;
            const { titulo, fachada, cidade, tecnologias, senha, disponivel } = req.body;

            const base = {
                titulo,
                fachada,
                cidade,
                tecnologias,
                senha,
                disponivel,
            };

            const erros = await validaUpdate(base);

            if (erros.length > 0) {
                badRequest(res, erros);
            } else {
                // Caso em que está atualizando o nome da base também, para o novo nome atualizado
                if (!isNull(base.titulo)) {
                    base.titulo = capitaliza(base.titulo);
                }
                base.fachada = capitaliza(base.fachada);
                base.cidade = capitaliza(base.cidade);
                base.tecnologias = base.tecnologias.map(tecnologia => capitaliza(tecnologia));

                const baseAtualizada = await BaseModel.findByIdAndUpdate(id, base);

                if (!base) {          
                    return baseNotFound(res);
                }

                baseAtualizaOk(res, baseAtualizada);
            }        
        } catch (error) {
            console.log(error);
            serverError(res);
        }

    },

    aluga: async (req, res) => {

        try {
            const id = req.params.id;
            const { titulo, fachada, senha } = req.body;
            let base = await BaseModel.findById(id);

            if (!base) {          
                return baseNotFound(res);
            }

            if (!base.disponivel) {
                return disponivelBadRequest(res);
            }

            if (base.senha != senha) {
                return senhaBadRequest(res);
            }

            const baseAlugada = {
                titulo,
                fachada,
                senha,
                disponivel: false,
            };

            baseAlugada.titulo = capitaliza(base.titulo);
            baseAlugada.fachada = capitaliza(base.fachada);

            await BaseModel.findByIdAndUpdate(id, baseAlugada);

            aluguelOk(res, baseAlugada);
        } catch (error) {
            console.log(error);
            serverError(res);
        }
    },

    clima: async (req, res) => {

        try {
            const id = req.params.id;
            const base = await BaseModel.findById(id);

            if (!base) {          
                return baseNotFound(res);
            }

            // Parâmetros necessários para a requisição à weatherapi
            let cidade = base.cidade;

            // Tratamento do caso da cidade 'Nova York', especificando-a como 'New York' para evitar conflitos com a cidade de mesmo nome localizada no Maranhão
            if (cidade === 'Nova York') {
                cidade = 'New York';
            }

            const chave = '62be5618221c447289f11541230803';
            const dataOntem = getDataOntem();
            const url = `http://api.weatherapi.com/v1/history.json?key=${chave}&q=${cidade}&dt=${dataOntem}`;

            axios.get(url)
                .then(response => {
                    const temperatura = response.data.forecast.forecastday[0].day.avgtemp_c;
                    base.temperatura = temperatura;

                    // Nota: como os status dos casos a seguir são bastante específicos para suas situações, não foram criados funções auxiliares no arquivo status
                    base.save()
                        .then(() => {
                            res.status(200).json({ base, msg: `Base atualizada com o valor da temperatura média do dia ${dataOntem} em ${base.cidade}.` });
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(400).json({ msg: 'Erro ao atualizar a base.' });
                        });
                })
                .catch(error => {
                    console.error(error);
                    res.status(400).json({ msg: 'Erro ao obter a temperatura.' });
                });
        } catch (error) {
            console.log(error);
            serverError(res);
        }
    }
};

module.exports = baseController;