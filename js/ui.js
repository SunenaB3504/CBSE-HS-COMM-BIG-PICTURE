// UI logic for rendering mindmap and modal

function createNode(node, level = 0) {
  const el = document.createElement('div');
  el.className = 'node level-' + level;
  el.innerHTML = `<strong>${node.label}</strong>` +
    (node.duration ? `<div class="duration">${node.duration}</div>` : '');
  
  // Only show modal for leaf nodes (no children)
  if (!node.children || !node.children.length) {
    el.onclick = function(e) {
      e.stopPropagation();
      showModal(node);
    };
  }
  
  // Collapsible logic for main branches
  let collapsed = false;
  if (node.children && node.children.length) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'children level-' + (level + 1);
    if (level === 1) {
      // Start collapsed for subnodes
      collapsed = true;
      childrenContainer.style.display = 'none';
      el.classList.add('collapsible');
      el.style.cursor = 'pointer';
      el.onclick = function(e) {
        e.stopPropagation();
        collapsed = !collapsed;
        childrenContainer.style.display = collapsed ? 'none' : 'flex';
        el.classList.toggle('expanded', !collapsed);
      };
    }
    // For top-level children (main branches), align horizontally
    if (level === 0) {
      childrenContainer.style.display = 'flex';
      childrenContainer.style.justifyContent = 'center';
      childrenContainer.style.gap = '32px';
      childrenContainer.style.marginTop = '32px';
    } else if (level > 1) {
      childrenContainer.style.display = 'flex';
      childrenContainer.style.flexDirection = 'column';
      childrenContainer.style.alignItems = 'center';
      childrenContainer.style.gap = '16px';
      childrenContainer.style.marginTop = '16px';
    }
    node.children.forEach(child => {
      childrenContainer.appendChild(createNode(child, level + 1));
    });
    el.appendChild(childrenContainer);
  }
  return el;
}

function renderMindmap() {
  const container = document.getElementById('mindmap-container');
  container.innerHTML = '';
  container.appendChild(createNode(window.mindmapData, 0));
}

function showModal(node) {
  const modal = document.getElementById('modal');
  modal.innerHTML = `<h2>${node.label}</h2>` +
    (node.duration ? `<p><em>${node.duration}</em></p>` : '') +
    `<div class="audio-controls">
      <button onclick="window.playAudio && window.playAudio('${node.label}')">Play</button>
      <button onclick="window.pauseAudio && window.pauseAudio()">Pause</button>
      <button onclick="window.stopAudio && window.stopAudio()">Stop</button>
    </div>
    <button onclick="hideModal()">Close</button>`;
  modal.classList.add('visible');
}

function hideModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('visible');
}

window.onload = renderMindmap;
// UI logic for rendering mindmap and modal
// ...existing code...
