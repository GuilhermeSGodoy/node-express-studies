const router = require('express').Router();

const baseController = require('../controllers/baseController');

// Criação de uma base
router.route('/bases').post((req, res) => baseController.create(req, res));

// Filtragem
router.route('/bases/query').get((req, res) => baseController.filtragem(req, res));

// Resgatar todas as bases
router.route('/bases').get((req, res) => baseController.getAll(req, res));

// Resgatar uma base pelo id
router.route('/bases/:id').get((req, res) => baseController.get(req, res));

// Deletar uma base
router.route('/bases/:id').delete((req, res) => baseController.delete(req, res));

// Atualizar uma base
router.route('/bases/:id').put((req, res) => baseController.update(req, res));

// Alugar uma base
router.route('/aluguel/:id').post((req, res) => baseController.aluga(req, res));

// Obter informações do clima
router.route('/clima/:id').post((req, res) => baseController.clima(req, res));

module.exports = router;