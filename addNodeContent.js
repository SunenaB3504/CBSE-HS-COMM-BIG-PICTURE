// Usage: node addNodeContent.js "Node Name" path/to/file.txt
// Saves JSON to big-picture/data/<node-name>.json

const fs = require('fs');
const path = require('path');

const [,, nodeName, txtFile] = process.argv;
if (!nodeName || !txtFile) {
  console.error('Usage: node addNodeContent.js "Node Name" path/to/file.txt');
  process.exit(1);
}

const txtPath = path.resolve(txtFile);
const dataDir = path.resolve(__dirname, 'data');
const jsonFile = path.join(dataDir, `${nodeName.replace(/\s+/g, '-').toLowerCase()}.json`);

fs.readFile(txtPath, 'utf8', (err, content) => {
  if (err) {
    console.error('Error reading txt file:', err);
    process.exit(1);
  }
  // Split paragraphs by double newlines or single newlines
  const paragraphs = content.split(/\n\s*\n|\r?\n/).map(p => p.trim()).filter(Boolean);
  const json = {
    title: nodeName,
    metadata: {
      source: path.basename(txtFile),
      type: 'story',
      length: paragraphs.length < 10 ? 'short' : 'long'
    },
    speaker: 'Narrator',
    paragraphs
  };
  fs.writeFile(jsonFile, JSON.stringify(json, null, 2), err => {
    if (err) {
      console.error('Error writing JSON file:', err);
      process.exit(1);
    }
    console.log(`Saved: ${jsonFile}`);
  });
});
