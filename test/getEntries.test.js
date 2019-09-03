/**
 * File used to quick test the `getEntries` function of
 * `DictionaryEnsemblGenomes.js`
 */

const DictionaryEnsemblGenomes = require('../src/DictionaryEnsemblGenomes');

const dict = new DictionaryEnsemblGenomes({log: true});

dict.getEntries({
  filter: { id: [
    'http://www.ensemblgenomes.org/id/Z208_01625',
    'http://www.ensemblgenomes.org/id/EMPG_14124',
    'http://www.ensemblgenomes.org/id/AT3G52430'
  ]},
  sort: 'id',
  page: 1,
  perPage: 3
}, (err, res) => {
  if (err) console.log(JSON.stringify(err, null, 4));
  else {
    console.log(JSON.stringify(res, null, 4));
    console.log('\n#Results: ' + res.items.length);
  }
});
