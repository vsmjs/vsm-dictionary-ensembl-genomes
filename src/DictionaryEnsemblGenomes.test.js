const DictionaryEnsembl = require('./DictionaryEnsemblGenomes');
const chai = require('chai'); chai.should();
const expect = chai.expect;
const fs = require('fs');
const path = require('path');

describe('DictionaryEnsembl.js', () => {

  const testURLBase = 'http://test';
  const dict =
    new DictionaryEnsembl({ baseURL: testURLBase, log: true, optimap: false });
  const dictOptimized =
    new DictionaryEnsembl({ baseURL: testURLBase, log: true}); // optimap: true

  const melanomaStr = 'melanoma';
  const noResultsStr = 'somethingThatDoesNotExist';

  const getIDPath = path.join(__dirname, '..', 'resources', 'id.json');
  const getMelanomaPath = path.join(__dirname, '..', 'resources', 'melanoma.json');

  const getIDStr = fs.readFileSync(getIDPath, 'utf8');
  const getMatchesForMelanomaStr = fs.readFileSync(getMelanomaPath, 'utf8');

  describe('getDictInfos', () => {
    it('returns empty result when the list of dictIDs does not '
        + ' include the domain\'s dictID', cb => {
      dict.getDictInfos({ filter: { id: [
        ' ',
        'https://www.uniprot.org',
        'https://www.ensembl.org' ]}},
      (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
        cb();
      });
    });

    it('returns proper dictInfo object when `options.filter` is not properly ' +
        'defined or the domain\'s dictID is in the list of specified dictIDs', cb => {
      let expectedResult = { items: [
        {
          id: 'http://www.ensemblgenomes.org',
          abbrev: 'Ensembl Genomes',
          name: 'Ensembl Genomes'
        }
      ]};

      dict.getDictInfos({}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal(expectedResult);
      });

      dict.getDictInfos({ filter: { id: [
        'http://www.ensemblgenomes.org',
        'https://www.ebi.ac.uk/complexportal',
        'https://www.ensembl.org' ]}},
      (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal(expectedResult);
      });

      cb();
    });
  });

  describe('getEntries', () => {
    it('returns empty result when the `options.filter.dictID` is properly ' +
        'defined and in the list of dictIDs the domain\'s dictID is not included', cb => {
      dict.getEntries({filter: { dictID: ['']}}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
      });

      dict.getEntries({filter: { dictID: [
        ' ',
        'https://www.uniprot.org',
        'https://www.ensembl.org'
      ]}}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
      });

      cb();
    });
  });

  describe('getEntryMatchesForString', () => {
    it('returns empty result when the `options.filter.dictID` is properly ' +
        'defined and in the list of dictIDs the domain\'s dictID is not included', cb => {
      dict.getEntryMatchesForString(melanomaStr, {filter: { dictID: ['']}},
        (err, res) => {
          expect(err).to.equal(null);
          res.should.deep.equal({ items: [] });
        });

      dict.getEntryMatchesForString(melanomaStr, {filter: { dictID: [
        ' ',
        'https://www.uniprot.org',
        'https://www.ensembl.org']}},
      (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
      });

      cb();
    });
  });

  describe('mapEnsemblGenomesResToEntryObj', () => {
    it('properly maps EBI Search returned JSON object to a VSM entry '
      + 'object', cb => {
      dict.mapEnsemblGenomesResToEntryObj(JSON.parse(getIDStr))
        .should.deep.equal([
          {
            id: 'http://www.ensemblgenomes.org/id/AT3G52430',
            dictID: 'http://www.ensemblgenomes.org',
            descr: 'Lipase-like PAD4 [Source:UniProtKB/Swiss-Prot;Acc:Q9S745]',
            terms: [
              {
                'str': 'PAD4'
              }
            ],
            z: {
              species: 'Arabidopsis thaliana'
            }
          }
        ]);

      cb();
    });
  });

  describe('mapEnsemblGenomesResToMatchObj', () => {
    it('properly maps EBI Search returned JSON object to a VSM match '
      + 'object', cb => {
      dict.mapEnsemblGenomesResToMatchObj(JSON.parse(getMatchesForMelanomaStr), 'melanoma')
        .should.deep.equal([
          {
            id: 'http://www.ensemblgenomes.org/id/Hypma_05946',
            dictID: 'http://www.ensemblgenomes.org',
            str: 'NDNL2',
            descr: 'Melanoma-associated antigen G1',
            type: 'T',
            terms: [
              {
                str: 'NDNL2'
              }
            ],
            z: {
              species: 'Hypsizygus marmoreus str. 51987-8 (GCA_001605315)'
            }
          }
        ]);

      cb();
    });
  });

  describe('prepareEntrySearchURL', () => {
    it('returns proper URL(s)', cb => {
      const url1 = dict.prepareEntrySearchURL({});
      const url2 = dict.prepareEntrySearchURL({ page: 1, perPage: 2 });
      const url3 = dict.prepareEntrySearchURL({ filter: { id: ['']}, page: 1, perPage: 2 });
      const url4 = dict.prepareEntrySearchURL({ sort: 'id', page: 2, perPage: 500 });
      const url5 = dict.prepareEntrySearchURL({ sort: 'dictID', page: 101, perPage: 101 });
      const url6 = dict.prepareEntrySearchURL({ sort: 'dictID', page: 101, perPage: 100 });
      const url7 = dict.prepareEntrySearchURL({ sort: 'dictID', page: 10001, perPage: 100 });
      const url8 = dict.prepareEntrySearchURL({ filter: { id: ['http://www.ensemblgenomes.org/id/Z208_01625']},
        page: 3, perPage: 20 });
      const url9 = dict.prepareEntrySearchURL({ filter: {
        id: [ '', 'http://www.ensemblgenomes.org/id/AT3G52430', '  ',
          'http://www.ensemblgenomes.org/id/EMPG_14124', 'http://www.ensemblgenomes.org/id/EMCG_01386' ]
      }, page: -1, perPage: 101 });

      const getAllIDsURLPart = 'domain_source:ensemblGenomes_gene';
      const formatURLPart = '&format=json';
      const sortURLPart = '&sort=id';
      const URLfields = 'fields=id%2Cname%2Cdescription%2Cgene_synonyms%2Cspecies';
      const expectedURL1 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=50&start=0' + formatURLPart;
      const expectedURL2 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=2&start=0' + formatURLPart;
      const expectedURL3 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=2&start=0' + formatURLPart;
      const expectedURL4 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=50&start=50' + formatURLPart;
      const expectedURL5 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=50&start=5000' + formatURLPart;
      const expectedURL6 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=100&start=10000' + formatURLPart;
      const expectedURL7 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=100&start=999999' + formatURLPart;
      const expectedURL8 = testURLBase + '/entry/Z208_01625'
        + '?' + URLfields + formatURLPart;
      const expectedURL9 = testURLBase + '/entry/AT3G52430,EMPG_14124,EMCG_01386'
        + '?' + URLfields + formatURLPart;

      url1.should.equal(expectedURL1);
      url2.should.equal(expectedURL2);
      url3.should.equal(expectedURL3);
      url4.should.equal(expectedURL4);
      url5.should.equal(expectedURL5);
      url6.should.equal(expectedURL6);
      url7.should.equal(expectedURL7);
      url8.should.equal(expectedURL8);
      url9.should.equal(expectedURL9);

      cb();
    });
  });

  describe('prepareMatchStringSearchURL', () => {
    it('returns proper URL', cb => {
      const url1 = dict.prepareMatchStringSearchURL(melanomaStr, {});
      const expectedURL = testURLBase + '?query=melanoma&fields=id%2Cname%2Cdescription%2Cgene_synonyms%2Cspecies';
      const paginationURLPart1 = '&size=50&start=0';
      const formatURLPart = '&format=json';

      url1.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url2 = dict.prepareMatchStringSearchURL(melanomaStr, { page: 'String' });
      url2.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url3 = dict.prepareMatchStringSearchURL(melanomaStr, { page: 0 });
      url3.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url4 = dict.prepareMatchStringSearchURL(melanomaStr, { page: 4 });
      const paginationURLPart2 = '&size=50&start=150';
      url4.should.equal(expectedURL + paginationURLPart2 + formatURLPart);

      const url5 = dict.prepareMatchStringSearchURL(melanomaStr, { perPage: ['Str'] });
      url5.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url6 = dict.prepareMatchStringSearchURL(melanomaStr, { perPage: 0 });
      url6.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url7 = dict.prepareMatchStringSearchURL(melanomaStr,
        { page: 3, perPage: 100 });
      const paginationURLPart3 = '&size=100&start=200';
      url7.should.equal(expectedURL + paginationURLPart3 + formatURLPart);

      const url8 = dict.prepareMatchStringSearchURL(melanomaStr,
        { page: 1, perPage: 2 });
      const paginationURLPart4 = '&size=2&start=0';
      url8.should.equal(expectedURL + paginationURLPart4 + formatURLPart);

      cb();
    });
  });

  describe('getDescr', () => {
    it('returns proper description string', cb => {
      const id = 'ENSMDL0485933300066';
      let species = ['XXX'];
      let terms = [
        { str: 'mainTerm' }, { str: 'Synonym-2'}, { str: 'Synonym-3'}
      ];
      let description = ['A description string'];

      dict.getDescr(species, terms, description, id).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description, id).should.equal('XXX; ENSMDL0485933300066|Synonym-2|Synonym-3; A description string');

      species = [];
      dict.getDescr(species, terms, description, id).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description, id).should.equal('ENSMDL0485933300066|Synonym-2|Synonym-3; A description string');
      terms = [];
      dict.getDescr(species, terms, description, id).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description, id).should.equal('ENSMDL0485933300066; A description string');
      species = ['YYY'];
      dict.getDescr(species, terms, description, id).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description, id).should.equal('YYY; ENSMDL0485933300066; A description string');
      description = [];
      dict.getDescr(species, terms, description, id).should.equal('');
      dictOptimized.getDescr(species, terms, description, id).should.equal('YYY; ENSMDL0485933300066;');

      cb();
    });
  });

  describe('sortEntries', () => {
    it('sorts VSM entry objects as specified in the documentation', cb => {
      const arr = [
        { id: 'e', dictID: 'rnacentral', terms: [{ str: 'a'}] },
        { id: 'd', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'c', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'b', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'a', dictID: 'rnacentral', terms: [{ str: 'c'}] }
      ];
      const arrIdSorted = [
        { id: 'a', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'b', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'c', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'd', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'e', dictID: 'rnacentral', terms: [{ str: 'a'}] }
      ];
      const arrStrSorted = [
        { id: 'e', dictID: 'rnacentral', terms: [{ str: 'a'}] },
        { id: 'b', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'd', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'a', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'c', dictID: 'rnacentral', terms: [{ str: 'c'}] }
      ];

      const options = {};
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = {};
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = '';
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = 'dictID';
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = 'id';
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = 'str';
      dict.sortEntries(arr, options).should.deep.equal(arrStrSorted);

      cb();
    });
  });

  describe('trimEntryObjArray', () => {
    it('properly trims given array of VSM entry objects', cb => {
      const arr = [
        { id:'a', dictID: 'A', terms: [{ str: 'aaa'}] },
        { id:'b', dictID: 'B', terms: [{ str: 'bbb'}] },
        { id:'c', dictID: 'C', terms: [{ str: 'ccc'}] }
      ];

      let options = {};
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr);

      options.page = 2;
      dict.trimEntryObjArray([], options).should.deep.equal([]);

      options.page = -1;
      options.perPage = 'no';
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr);

      options.page = 1;
      options.perPage = 2;
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr.slice(0,2));

      options.page = 2;
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr.slice(2,3));

      options.page = 3;
      dict.trimEntryObjArray(arr, options).should.deep.equal([]);

      cb();
    });
  });

  describe('hasProperEntrySortProperty', () => {
    it('returns true or false whether the `options.sort` property for an ' +
      'entry VSM object is properly defined', cb => {
      const options = {};
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = [];
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = {};
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = '';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = 45;
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = 'dictID';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(true);
      options.sort = 'id';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(true);
      options.sort = 'str';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(true);
      options.sort = noResultsStr;
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);

      cb();
    });
  });
});
