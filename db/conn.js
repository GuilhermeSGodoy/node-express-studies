require('dotenv').config();
const mongoose = require('mongoose');

const options = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'mongo-data'
};
  
async function main() {

    try {

        mongoose.set('strictQuery', true);

        // Conexão com o banco de dados usando os parâmetros de autenticação definidos acima e os dados do arquivo .env.
        await mongoose.connect('mongodb://localhost:27017', options);

        console.log('Conectado ao banco.');
    } catch (error) {
        console.log(`Erro: ${error}`);
    }

}

module.exports = main;