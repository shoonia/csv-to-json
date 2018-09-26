const fs = require('fs');
const util = require('util');
const path = require('path');
const unescape = require('unescape-js')
const csvjson = require('csvjson');
const ids = require('./ids');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const jsonPath = path.resolve(__dirname, '../json', 'solution.json');

// console colors: ----------
const reset = '\x1b[0m';
const redColor = '\x1b[31m';
const blueColor = '\x1b[34m';
const greenColor = '\x1b[32m';
// --------------------------

function transformSolution({ id, data }) {
  return {
    _id: id.replace(/(_)/g,'-'),
    contentHtml: data.contentHtml || undefined,
    subtitle: data.subtitle || undefined,
    title: data.title || undefined,
    topic: data.topic || undefined,
    note: data.note || undefined,
    template: data.template || undefined,
    readTime: data.readTime || undefined,
    allowContact: data.allowContact || undefined,
    actionText: data.action ? data.action.text : undefined,
    actionUrl: data.action ? data.action.url : undefined,
  }
};

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

async function main() {
  const csvPath = process.argv[2] || 'solution.csv'; // Path to file
  const options = {
    delimiter: ',',
    quote: '"'
  };

  try {
    const csvFile = await readFile(path.resolve(csvPath), 'utf8');
    const json = csvjson.toObject(csvFile, options);
    const result = ids
      .map(findSolutionById(json))
      .map(parseSolution)
      .map(transformSolution);
    
    await writeFile(jsonPath, JSON.stringify(result));

    console.info(greenColor, 'Yeah! Done! Your file is here:\n', blueColor, jsonPath, reset);
  } catch (error) {
    console.error(redColor, 'Oh, no! ', error.message, reset);
  }
}

main();
