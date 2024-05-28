const mongoose = require('mongoose');
const Page = require('./Page'); // Import the Page model

const StatusWebpageEnum = {
  PORAVALIAR: 'por avaliar',
  EMAVALIACAO: 'em avaliacao',
  AVALIADO: 'avaliado ',
  ERRO: 'erro na avaliacao',
};

const webpageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
   registered: { type: Date, default: Date.now() },
   lastEvaluation: { type: Date, default: null },
   status: {
    type: String,
    enum: Object.values(StatusWebpageEnum), //  only accept values defined in the StatusEnum object
    default: StatusWebpageEnum.PORAVALIAR
  },
  listaPaginasMonotorizadas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }]

});


const Webpage = mongoose.model('Webpage', webpageSchema);

module.exports = {  Webpage, StatusWebpageEnum }

