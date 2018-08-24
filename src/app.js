const rp = require('request-promise');
const cheerio = require('cheerio');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
/*
 * URL: https://sistemas.anac.gov.br/aeronaves/cons_rab.asp
 * Params:
 *	enivar: ok
 *	radiobutton: p
 *	selectFabricante: null
 *	selectHabilitacao: null
 *	selectIcao: null
 *	selectModelo: null
 *	txmtc: ppsda
 */

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
}

const scrapper = async (txmtc) => {
	const options = {
		method: 'GET',
		uri: `https://sistemas.anac.gov.br/aeronaves/cons_rab_print.asp?nf=${txmtc.toUpperCase()}`,
		encoding: 'latin1',
	};
	
	const body = await rp(options);
	const $ = cheerio.load(body);
	const tbody = $('table.box');
	const dataUpdate = {};
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
				console.log(spanText);

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

	console.log(dataUpdate);
};

const doMap = (prefix) => {
	const letters = 'abcdefghijklmnopqrstuvwxyz';	
};

scrapper('ppakr');
