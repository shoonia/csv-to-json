const fs = require('fs');
const path = require('path');
const unescape = require('unescape-js');
const csvjson = require('csvjson');

const ids = require('./ids');
const csvInput = path.resolve(process.argv[2] || 'solution.csv');

const distDir = path.resolve(__dirname, '../dist');
const jsonOutput = path.resolve(distDir, 'solution.json');
const csvOutput = path.resolve(distDir, 'solution.csv');

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

const optionsCSV = {
  delimiter: ',',
  wrap: false
};

function transformSolution({ id, data }) {
  return {
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
  };
}

function findSolutionById(solution) {
  return function(id) {
    const elem = solution.find(item => item.id === id);
    if (elem === undefined) {
      throw new Error(`Not Found! id=${id}`);
    }
    return elem;
  };
}

function parseSolution({ id, data }) {
  return {
    id,
    data: JSON.parse(unescape(data))
  };
}

function main() {
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

    const csvResult = csvjson.toCSV(jsonResult, optionsCSV);

    fs.writeFileSync(jsonOutput, JSON.stringify(jsonResult));
    fs.writeFileSync(csvOutput, csvResult);

    console.info(
      greenColor,
      'Yeah! Done! Your files are here:',
      blueColor,
      `\n${jsonOutput}\n${csvOutput}`,
      reset
    );
  } catch (error) {
    console.error(redColor, `Oh, no! ${error.message}`, reset);
  }
}

main();
