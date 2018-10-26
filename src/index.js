const fs = require('fs');
const path = require('path');
const unescape = require('unescape-js');
const csvjson = require('csvjson');

const ids = require('./ids');
const csvInput = path.resolve(process.argv[2] || 'solution.csv');

const distDir = path.resolve(__dirname, '../dist');
const jsonOutput = path.resolve(distDir, 'solution.json');

// console colors: ----------
const reset = '\x1b[0m';
const redColor = '\x1b[31m';
const blueColor = '\x1b[34m';
const greenColor = '\x1b[32m';
// --------------------------

const optionsJSON = {
  delimiter: ',',
  quote: '"'
};

const transformSolution = ({ id, data }) => ({
  _id: id.replace(/(_)/g, '-'),
  contentHtml: data.contentHtml || undefined,
  subtitle: data.subtitle || undefined,
  title: data.title || undefined,
  topic: data.topic || undefined,
  note: data.note || undefined,
  template: data.template || undefined,
  readTime: data.readTime || undefined,
  allowContact: data.allowContact || undefined,
  actionText: data.action ? data.action.text : undefined,
  actionUrl: data.action ? data.action.url : undefined
});

const findSolutionById = solution => id => {
  const elem = solution.find(item => item.id === id);
  if (elem === undefined) {
    throw new Error(`Not Found! id=${id}`);
  }
  return elem;
};

const parseSolution = ({ id, data }) => ({
  id,
  data: JSON.parse(unescape(data))
});

(() => {
  try {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }

    const csv = fs.readFileSync(csvInput, 'utf8');
    const json = csvjson.toObject(csv, optionsJSON);

    const jsonResult = ids
      .map(findSolutionById(json))
      .map(parseSolution)
      .map(transformSolution);

    fs.writeFileSync(jsonOutput, JSON.stringify(jsonResult));

    console.info(
      greenColor,
      'Yeah! Done! Your file is here:',
      blueColor,
      `\n${jsonOutput}`,
      reset
    );
  } catch (error) {
    console.error(redColor, `Oh, no! ${error.message}`, reset);
  }
})();
