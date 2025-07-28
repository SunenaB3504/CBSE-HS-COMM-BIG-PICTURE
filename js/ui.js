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
        // If node has a corresponding JSON file, fetch and show its content
        const jsonMap = {
          'Short story': 'data/story-small.json',
          'Long Story': 'data/long-story.json',
          'Partnership': 'data/partnership.json',
          'Companies': 'data/companies.json',
          'Financial Statements': 'data/financial-statements.json'
        };
        const jsonFile = jsonMap[node.label];
        if (jsonFile) {
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
                            : `<p><strong>${p.speaker ? p.speaker + ':' : ''}</strong> ${p.text}</p>`
                        ).join('') +
                      `</div>` +
                      `<button id='closeBtn'>Close</button>`;
                    modal.classList.add('visible');

                    // Improved play/pause/resume logic for multi-speaker
                    let synth = window.speechSynthesis;
                    let voices = synth.getVoices();
                    let getVoice = (speaker) => {
                      if (speaker === 'Neil') return { voice: voices[0] || null, pitch: 1.2 };
                      if (speaker === 'Kanishq') return { voice: voices[1] || null, pitch: 0.9 };
                      return { voice: voices[2] || null, pitch: 1 };
                    };
                    let idx = 0;
                    let paused = false;
                    let utter = null;
                    let wasPaused = false;

                    function speakNext() {
                      if (idx < data.paragraphs.length && !paused) {
                        let p = data.paragraphs[idx];
                        let text = typeof p === 'string' ? p : p.text;
                        let speaker = typeof p === 'string' ? data.speaker : p.speaker;
                        utter = new SpeechSynthesisUtterance(text);
                        let v = getVoice(speaker);
                        if (v.voice) utter.voice = v.voice;
                        utter.pitch = v.pitch;
                        utter.rate = 1;
                        utter.onend = function(event) {
                          if (!paused && event.elapsedTime > 0) {
                            idx++;
                          }
                          if (!paused) {
                            speakNext();
                          }
                        };
                        synth.speak(utter);
                      }
                    }

                    function playStoryWithSpeakers() {
                      paused = false;
                      wasPaused = false;
                      speakNext();
                    }

                    function pauseStory() {
                      paused = true;
                      wasPaused = true;
                      synth.cancel();
                    }

                    function stopStory() {
                      paused = false;
                      wasPaused = false;
                      idx = 0;
                      synth.cancel();
                    }

                    window.stopAudio = stopStory;
                    window.pauseAudio = pauseStory;

                    document.getElementById('playBtn').addEventListener('click', function() {
                      if (wasPaused) {
                        paused = false;
                        wasPaused = false;
                        speakNext();
                      } else {
                        stopStory();
                        idx = 0;
                        speakNext();
                      }
                    });
                    document.getElementById('pauseBtn').addEventListener('click', pauseStory);
                    document.getElementById('stopBtn').addEventListener('click', stopStory);
                    document.getElementById('closeBtn').addEventListener('click', function() {
                      stopStory();
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
