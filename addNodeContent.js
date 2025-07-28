// Usage: node addNodeContent.js "Node Name" path/to/file.txt
// Saves JSON to big-picture/data/<node-name>.json

const fs = require('fs');
const path = require('path');

const [,, nodeName, txtFile] = process.argv;
if (!nodeName || !txtFile) {
  console.error('Usage: node addNodeContent.js "Node Name" path/to/file.txt');
  process.exit(1);
}

const txt = fs.readFileSync(txtFile, 'utf8');
const lines = txt.split(/\r?\n/).filter(l => l.trim());

// Improvements:
// - Speaker identification: "Speaker: Text" format
// - No narrative tags (should not be present in txt)
// - One paragraph per speech
// - Consistent formatting
// - No embedded actions or quotes
// - No empty lines

const paragraphs = lines.map(line => {
  // Match "Speaker: Text" format
  const match = line.match(/^([A-Za-z][A-Za-z0-9 ]*):\s*(.*)$/);
  if (match) {
    return { speaker: match[1].trim(), text: match[2].trim() };
  }
  // Try to infer speaker from narrative or quoted speech
  if (/Neil (said|declared|affirmed|continued|added|confirmed|smiled)/i.test(line)) {
    return { speaker: 'Neil', text: line.replace(/Neil (said|declared|affirmed|continued|added|confirmed|smiled)[,:]?/i, '').trim().replace(/^"|"$/g, '') };
  }
  if (/Kanishq (nodded|grinned|remembered|clarified|interjected|prompted)/i.test(line)) {
    return { speaker: 'Kanishq', text: line.replace(/Kanishq (nodded|grinned|remembered|clarified|interjected|prompted)[,:]?/i, '').trim().replace(/^"|"$/g, '') };
  }
  if (/Krish (said|added|joined)/i.test(line)) {
    return { speaker: 'Krish', text: line.replace(/Krish (said|added|joined)[,:]?/i, '').trim().replace(/^"|"$/g, '') };
  }
  if (/Stop \d/i.test(line)) {
    return { speaker: 'Narrator', text: line.trim() };
  }
  if (/^"/.test(line)) {
    // If line starts with a quote, default to Narrator
    return { speaker: 'Narrator', text: line.replace(/^"|"$/g, '') };
  }
  // Default to Narrator
  return { speaker: 'Narrator', text: line.trim() };
});

const json = {
  title: nodeName,
  metadata: {
    source: path.basename(txtFile),
    type: 'story',
    length: paragraphs.length > 10 ? 'long' : 'short'
  },
  speaker: 'Narrator',
  paragraphs
};

const outFile = path.join(__dirname, 'data', `${nodeName.toLowerCase().replace(/\s+/g, '-')}.json`);
fs.writeFileSync(outFile, JSON.stringify(json, null, 2));
console.log('Saved:', outFile);

// Integrate node with mindmap.json
const mindmapFile = path.join(__dirname, 'data', 'mindmap.json');
let mindmap;
try {
  mindmap = JSON.parse(fs.readFileSync(mindmapFile, 'utf8'));
} catch (e) {
  mindmap = { nodes: [] };
}

// Add or update node in mindmap
const nodeId = nodeName.toLowerCase().replace(/\s+/g, '-');
const nodePath = `data/${nodeId}.json`;
let node = mindmap.nodes.find(n => n.id === nodeId);
if (!node) {
  node = {
    id: nodeId,
    name: nodeName,
    content: nodePath
  };
  mindmap.nodes.push(node);
} else {
  node.name = nodeName;
  node.content = nodePath;
}
fs.writeFileSync(mindmapFile, JSON.stringify(mindmap, null, 2));
console.log('Integrated node with mindmap:', nodeId);
