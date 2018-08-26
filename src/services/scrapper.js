const request = require('request');
const cheerio = require('cheerio');

const mapper = {
    'Proprietário': 'owner',
    'CPF/CGC_owner': 'owner_tax',
    'Operador': 'op',
    'CPF/CGC_op': 'op_tax',
    'Fabricante': 'fab',
    'Ano de Fabricação': 'fabyear',
    'Modelo': 'model',
    'Número de Série': 'sn',
    'Tipo ICAO': 'icao',
    'Tipo de Habilitação para Pilotos': 'thp',
    'Classe da Aeronave': 'classe',
    'Peso Máximo de Decolagem': 'pmd',
    'Número Máximo de Passageiros': 'ndp',
    'Categoria de Regstro': 'cr',
    'Tipo de voo autorizado': 'tva',
    'Número dos Certificados (CM - CA)': 'cmca',
    'Situação no RAB': 'srab',
    'Data da Compra/Transferência': 'dct',
    'Data de Validade do CA': 'dvc',
    'Situação de Aeronavegabiidade': 'sda',
    'Consulta realizada em': 'lastUpdate',
};

module.exports = (txmtc, cb) => {
	console.log(`[SCRAPER]> START ON: ${txmtc}`);
	const res = request.get({
            uri: `https://sistemas.anac.gov.br/aeronaves/cons_rab_print.asp?nf=${txmtc}`,
            encoding: 'latin1',
        }, (error, response, body) => {

        const $ = cheerio.load(body);
        const tbody = $('table.box');
        const dataUpdate = { txmtc };
        let taxFirst = false;

        tbody.find('tr').each((i, tr) => {
            const td = $(tr).find('td.fontDestaque2');
            const div = $(td).find('div[align="left"]');
            
            if (div.children().length) {
                const span = $(div).find('span.tx_bold');
                
                if (span.length) {
                    const htmlRemove = $.html(span);
                    let spanText = span.text().replace(':', '');
                    let text = div.html().replace(htmlRemove, '').replace(/\s+\</g, '<').replace(/\>\s+/g, '>').replace(/\n/g, '').trim();
    
                    if (spanText == 'CPF/CGC' && !taxFirst) {
                        spanText = `${spanText}_owner`;
                        taxFirst = !taxFirst;
                    } else if (spanText == 'CPF/CGC') {
                        spanText = `${spanText}_op`;
                    }
    
                    const map = Object.keys(mapper).indexOf(spanText);
                        
                    if (map !== -1) {
                        dataUpdate[mapper[spanText]] = text;
                    }
                }
            }
        });
    
        console.log(`[SCRAPER]> END ON: ${txmtc}`);
        
        if(dataUpdate.owner.length === 0) {
            return cb(null);
        }
    
        return cb(dataUpdate);
    });
};