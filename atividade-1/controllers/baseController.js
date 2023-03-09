const axios = require('axios');

const BaseModel = require('../models/Base');
const { capitaliza, isNull, getDataOntem } = require('../utils/common');
const { validaCreate, validaUpdate } = require('../utils/validator');

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
                res.status(400).json({ erros });
            } else {
                // Por fim, cria a base totalmente validada
                base.titulo = capitaliza(base.titulo);
                base.fachada = capitaliza(base.fachada);
                base.cidade = capitaliza(base.cidade);
                base.tecnologias = base.tecnologias.map(tecnologia => capitaliza(tecnologia));

                const baseCriada = await BaseModel.create(base);
                res.status(201).json({ baseCriada, msg: 'Base adicionada com sucesso.' });
            } 
        } catch (error) {
            if (error.name === 'ValidationError' && error.errors.titulo) {
                res.status(400).json({ msg: 'O campo [Titulo] é obrigatório.' });
                return;
            }
          
            res.status(500).json({ msg: 'Erro interno no servidor.' });
        }

    },

    getAll: async (req, res) => {

        try {
            const bases = await BaseModel.find().select('-_id titulo cidade disponivel');
            
            if (!bases.length) {
                res.status(404).json({ msg: 'Não há bases cadastradas no sistema.' });
                return;
            }

            res.status(200).json({ bases, msg: 'Bases recuperadas com sucesso.' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Erro interno no servidor.' });
        }

    },

    get: async (req, res) => {

        try {
            const id = req.params.id;
            const base = await BaseModel.findById(id).select('-_id titulo cidade disponivel');

            if(!base) {
                res.status(404).json({ msg: 'Base não encontrada.' });
                return;
            }

            res.status(200).json({ base, msg: 'Base recuperada com sucesso.' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Erro interno no servidor.' });
        }

    },
        
    delete: async (req, res) => {

        try {
            const id = req.params.id;
            let base = await BaseModel.findById(id);

            if (!base) {
                res.status(404).json({ msg: 'Base não encontrada.' });
                return;
            }

            base = await BaseModel.findByIdAndDelete(id);
            res.status(204).send();
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Erro interno no servidor.' });
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
                res.status(404).json({ msg: 'Não foram encontradas bases correspondentes ao filtro desejado.' });
                return;
            }

            const basesFiltradas = await BaseModel.create(bases);
            res.status(201).json({ basesFiltradas, msg: 'Base(s) recuperada(s) com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Erro interno no servidor.' });
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
                res.status(400).json({ erros });
            } else {
                // Caso em que está atualizando o nome da base também
                if (!isNull(base.titulo)) {
                    base.titulo = capitaliza(base.titulo);
                }
                base.fachada = capitaliza(base.fachada);
                base.cidade = capitaliza(base.cidade);
                base.tecnologias = base.tecnologias.map(tecnologia => capitaliza(tecnologia));

                const baseAntiga = await BaseModel.findByIdAndUpdate(id, base);

                if (!baseAntiga) {
                    res.status(404).json({ msg: 'Base não encontrada.' });
                    return;
                }

                res.status(200).json({ base, msg: 'Base atualizada com sucesso.' });
            }        
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Erro interno no servidor.' });
        }

    },

    aluga: async (req, res) => {

        try {
            const id = req.params.id;
            const { titulo, fachada, senha } = req.body;
            let baseAlugada = await BaseModel.findById(id);

            if (!baseAlugada) {
                res.status(404).json({ msg: 'Base não encontrada.' });
                return;
            }

            if (!baseAlugada.disponivel) {
                res.status(400).json({ msg: 'Base não disponível para aluguel.' });
                return;
            }

            if (baseAlugada.senha != senha) {
                res.status(400).json({ msg: 'A senha de acesso à base está incorreta.' });
                return;
            }

            // Marca a base como alugada
            disponivel = false;

            const base = {
                titulo,
                fachada,
                senha,
                disponivel,
            };

            base.titulo = capitaliza(base.titulo);
            base.fachada = capitaliza(base.fachada);

            baseAlugada = await BaseModel.findByIdAndUpdate(id, base);

            res.status(200).json({ base, msg: 'Base alugada com sucesso.' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Erro interno no servidor.' });
        }
    },

    clima: async (req, res) => {

        try {
            const id = req.params.id;
            const base = await BaseModel.findById(id);

            if (!base) {
                res.status(404).json({ msg: 'Base não encontrada.' });
                return;
            }

            // Parâmetros necessários para a requisição à weatherapi
            let cidade = base.cidade;
            const chave = '62be5618221c447289f11541230803';
            const dataOntem = getDataOntem();
            const url = `http://api.weatherapi.com/v1/history.json?key=${chave}&q=${cidade}&dt=${dataOntem}`;

            axios.get(url)
                .then(response => {
                    const temperatura = response.data.forecast.forecastday[0].day.avgtemp_c;
                    base.temperatura = temperatura;

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
            res.status(500).json({ msg: 'Erro interno no servidor.' });
        }
    }
};

module.exports = baseController;