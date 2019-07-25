/**
 * File used to quick test the `getEntryMatchesForString` function of
 * `DictionaryEnsemblGenomes.js`
 */

const DictionaryEnsemblGenomes = require('../src/DictionaryEnsemblGenomes');

const dict = new DictionaryEnsemblGenomes({log: true});

dict.getEntryMatchesForString('tp53', { page: 1, perPage: 20 },
  (err, res) => {
    if (err) console.log(JSON.stringify(err, null, 4));
    else {
      console.log(JSON.stringify(res, null, 4));
      console.log('\n#Results: ' + res.items.length);
    }
  }
);
