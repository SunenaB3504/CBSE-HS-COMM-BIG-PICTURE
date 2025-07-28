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
  // If node is 'Short story', fetch and show JSON content
  if (node.label === 'Short story') {
    fetch('data/story-small.json')
      .then(res => res.json())
      .then(data => {
                    modal.innerHTML = `<h2>${data.title}</h2>` +
                      `<div class='audio-controls'>
                        <button id='playBtn'>Play</button>
                        <button id='pauseBtn'>Pause</button>
                        <button id='stopBtn'>Stop</button>
                      </div>` +
                      `<div id='storyText'>` +
                        data.paragraphs.map((p) => `<p>${p}</p>`).join('') +
                      `</div>` +
                      `<button id='closeBtn'>Close</button>`;
                    modal.classList.add('visible');
                    const storyText = data.paragraphs.join(' ');
                    document.getElementById('playBtn').addEventListener('click', function() {
                      window.playAudio(storyText);
                    });
                    document.getElementById('pauseBtn').addEventListener('click', function() {
                      window.pauseAudio();
                    });
                    document.getElementById('stopBtn').addEventListener('click', function() {
                      window.stopAudio();
                    });
                    document.getElementById('closeBtn').addEventListener('click', function() {
                      window.stopAudio();
                      hideModal();
                    });
      });
  } else {
    modal.innerHTML = `<h2>${node.label}</h2>` +
      (node.duration ? `<p><em>${node.duration}</em></p>` : '') +
      `<div class="audio-controls">
                    <button id='playBtn'>Play</button>
                    <button id='pauseBtn'>Pause</button>
                    <button id='stopBtn'>Stop</button>
                  </div>
                  <button id='closeBtn'>Close</button>`;
             document.getElementById('playBtn').addEventListener('click', function() {
                 window.playAudio && window.playAudio('${node.label}');
             });
             document.getElementById('pauseBtn').addEventListener('click', function() {
                 window.pauseAudio && window.pauseAudio();
             });
             document.getElementById('stopBtn').addEventListener('click', function() {
                 window.stopAudio && window.stopAudio();
             });
             document.getElementById('closeBtn').addEventListener('click', function() {
                 hideModal();
             });
    modal.classList.add('visible');
  }
}

function hideModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('visible');
}

window.onload = renderMindmap;
// UI logic for rendering mindmap and modal
// ...existing code...
