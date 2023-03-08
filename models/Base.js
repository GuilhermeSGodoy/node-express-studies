const mongoose = require('mongoose');

const { Schema } = mongoose;

const baseSchema = new Schema({
        titulo: {
            type: String,
            required: true,
        },
        fachada: {
            type: String,
            required: true,
        },
        cidade: {
            type: String,
            required: true,
        },
        tecnologias: {
            type: [String],
            required: true,
        },
        senha: {
            type: String,
            required: true,
        },
        disponivel: {
            type: Boolean,
        },
        temperatura: { // Parâmetro opcional para o quarto desafio
            type: Number,
        },
    },
    { timestamps: true }
);

const Base = mongoose.model('Base', baseSchema);

module.exports = Base;