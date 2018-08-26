const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RabSchema = new Schema({
    txmtc: {
        type: String,
        unique: true,
    },
    owner: String,
    owner_tax: String,
    op: String,
    op_tax: String,
    fab: String,
    fabyear: String,
    model: String,
    sn: String,
    icao: String,
    thp: String,
    classe: String,
    pmd: String,
    ndp: String,
    tva: String,
    cr: String,
    srab: String,
    dct: String,
    dvc: String,
    sda: String,
}, { collection: 'rab' });

module.exports = mongoose.model('Rab', RabSchema);