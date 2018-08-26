const mongoose = require('mongoose');
const Rab = require('./models/rab');
const bf = require('./tools/bruteforce');
const scrapper = require('./services/scrapper');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const callScrapper = (db, rab, index, rabs, end) => {
	const callNext = () => {
		if (index < rabs.length) {
			return callScrapper(db, rabs[index + 1], index + 1, rabs, end);
		} else {
			return end();
		}
	};

	const data = scrapper(rab, (data) => {
		if (data !== null) {
			new Rab(data)
				.save()
				.then(() => {
					console.log(`[DB]> save ${data.txmtc}`);
					return callNext();
				})
				.catch(() => {
					const { txmtc } = data;
					delete data.txmtc;
	
					Rab.findOneAndUpdate({ txmtc }, data)
						.then(() => {
							console.log(`[DB]> update ${txmtc}`);
							return callNext();
						})
						.catch(() => {
							console.log(`[DB]> failed to update ${txmtc}`);
							return callNext();
						});
				});
		} else {
			console.log(`[DB]> Empty: ${rab}`);
			return callNext();
		}
	});

};

const doMap = (db) => {
	const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	const posfix = [];
	const rabs = [];

	bf({
		len: 3,
		chars: letters,
		step: (d) => {
			if(d.length === 3) {
				posfix.push(d);
			}
		},
		end: () => {
			console.log('[BF]> End to build all posfix');

			['PP', 'PT', 'PR'].forEach((pre) => {
				posfix.forEach((pos) => {
					rabs.push(`${pre.toUpperCase()}${pos.toUpperCase()}`);
				});
			});

			callScrapper(db, rabs[0], 0, rabs, () => {
				console.log('[APP]> done...', process.exit());
			});
		}
	});
};

const start = () => {
	const db = mongoose.connect('mongodb://localhost/anacScrapper', { useNewUrlParser: true });
	console.log('[DB]> Database is connected.');

	doMap(db);
};

start();