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
        // If node is 'Short story' or 'Long Story', fetch and show JSON content
        if (node.label === 'Short story' || node.label === 'Long Story') {
            const jsonFile = node.label === 'Short story' ? 'data/story-small.json' : 'data/long-story.json';
            fetch(jsonFile)
                .then(res => res.json())
                .then(data => {
                    modal.innerHTML = `<h2>${data.title}</h2>` +
                      `<div class='audio-controls'>
                        <button id='playBtn'>Play</button>
                        <button id='pauseBtn'>Pause</button>
                        <button id='stopBtn'>Stop</button>
                      </div>` +
                      `<div id='storyText'>` +
                        data.paragraphs.map((p) =>
                          typeof p === 'string'
                            ? `<p>${p}</p>`
                            : `<p><strong>${p.speaker}:</strong> ${p.text}</p>`
                        ).join('') +
                      `</div>` +
                      `<button id='closeBtn'>Close</button>`;
                    modal.classList.add('visible');

                    // Play logic for multi-speaker
                    function playStoryWithSpeakers() {
                      window.stopAudio();
                      let synth = window.speechSynthesis;
                      let voices = synth.getVoices();
                      let getVoice = (speaker) => {
                        // Pick different voices or pitch for each speaker
                        if (speaker === 'Neil') return { voice: voices[0] || null, pitch: 1.2 };
                        if (speaker === 'Kanishq') return { voice: voices[1] || null, pitch: 0.9 };
                        return { voice: voices[2] || null, pitch: 1 };
                      };
                      let idx = 0;
                      function speakNext() {
                        if (idx < data.paragraphs.length) {
                          let p = data.paragraphs[idx];
                          let text = typeof p === 'string' ? p : p.text;
                          let speaker = typeof p === 'string' ? data.speaker : p.speaker;
                          let utter = new SpeechSynthesisUtterance(text);
                          let v = getVoice(speaker);
                          if (v.voice) utter.voice = v.voice;
                          utter.pitch = v.pitch;
                          utter.rate = 1;
                          utter.onend = function() {
                            idx++;
                            speakNext();
                          };
                          synth.speak(utter);
                        }
                      }
                      speakNext();
                    }

                    document.getElementById('playBtn').addEventListener('click', playStoryWithSpeakers);
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
