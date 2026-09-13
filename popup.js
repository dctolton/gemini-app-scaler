const DEFAULT_PRESETS_PX = [
  { name: 'Narrow', val: 800 }, { name: 'Default', val: 900 },
  { name: 'Wider', val: 1200 }, { name: 'Ultra', val: 1600 }, { name: 'Max', val: 2400 }
];
const DEFAULT_PRESETS_PCT = [
  { name: 'Narrow', val: 50 }, { name: 'Default', val: 70 },
  { name: 'Wider', val: 85 }, { name: 'Ultra', val: 95 }, { name: 'Max', val: 100 }
];

let state = {};
let debounceTimer;

function init() {
  chrome.storage.sync.get({
    mode: '%', customPx: 1200, customPct: 85,
    presetsPx: DEFAULT_PRESETS_PX, presetsPct: DEFAULT_PRESETS_PCT,
    compactness: 5, lineHeight: 1.5, paraSpacing: 1.0, codeWrap: true
  }, (res) => {
    state = res;
    render();
    attachListeners();
  });
}

function saveState() {
  chrome.storage.sync.set(state, render);
}

function debouncedSaveState() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => saveState(), 300);
}

function render() {
  document.querySelector(`input[name="mode"][value="${state.mode}"]`).checked = true;
  document.getElementById('unit-label').innerText = state.mode;
  document.getElementById('custom-width').value = state.mode === 'px' ? state.customPx : state.customPct;
  document.getElementById('compactness').value = state.compactness;
  document.getElementById('line-height').value = state.lineHeight;
  document.getElementById('para-spacing').value = state.paraSpacing;
  document.getElementById('code-wrap').checked = state.codeWrap;

  const presetsContainer = document.getElementById('presets-container');
  presetsContainer.innerHTML = '';
  const currentPresets = state.mode === 'px' ? state.presetsPx : state.presetsPct;
  
  currentPresets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.innerText = preset.name;
    const currentVal = state.mode === 'px' ? state.customPx : state.customPct;
    if (currentVal == preset.val) btn.classList.add('active');
    btn.onclick = () => {
      if (state.mode === 'px') state.customPx = preset.val;
      else state.customPct = preset.val;
      saveState();
    };
    presetsContainer.appendChild(btn);
  });
}

function renderPresetEditor() {
  const rowsContainer = document.getElementById('preset-editor-rows');
  rowsContainer.innerHTML = ''; 
  const currentPresets = state.mode === 'px' ? state.presetsPx : state.presetsPct;
  
  currentPresets.forEach((preset, index) => {
    const row = document.createElement('div');
    row.className = 'preset-row';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = `p-name-${index}`;
    nameInput.value = preset.name;
    
    const valInput = document.createElement('input');
    valInput.type = 'number';
    valInput.id = `p-val-${index}`;
    valInput.value = preset.val;
    
    row.appendChild(nameInput);
    row.appendChild(valInput);
    rowsContainer.appendChild(row);
  });
}

function attachListeners() {
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.mode = e.target.value;
      saveState();
    });
  });

  document.getElementById('custom-width').addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (state.mode === 'px') state.customPx = val; else state.customPct = val;
    debouncedSaveState();
  });

  document.getElementById('compactness').addEventListener('input', (e) => {
    state.compactness = parseInt(e.target.value, 10);
    state.lineHeight = (1.8 - (state.compactness * 0.05)).toFixed(2);
    state.paraSpacing = (1.5 - (state.compactness * 0.1)).toFixed(2);
    debouncedSaveState();
  });

  document.getElementById('line-height').addEventListener('input', (e) => {
    state.lineHeight = parseFloat(e.target.value);
    debouncedSaveState();
  });

  document.getElementById('para-spacing').addEventListener('input', (e) => {
    state.paraSpacing = parseFloat(e.target.value);
    debouncedSaveState();
  });

  document.getElementById('code-wrap').addEventListener('change', (e) => {
    state.codeWrap = e.target.checked;
    saveState();
  });

  document.getElementById('edit-presets-btn').addEventListener('click', () => {
    const editor = document.getElementById('preset-editor');
    editor.classList.toggle('hidden');
    if (!editor.classList.contains('hidden')) renderPresetEditor();
  });

  document.getElementById('save-presets-btn').addEventListener('click', () => {
    const currentPresets = state.mode === 'px' ? state.presetsPx : state.presetsPct;
    currentPresets.forEach((preset, index) => {
      preset.name = document.getElementById(`p-name-${index}`).value;
      preset.val = parseInt(document.getElementById(`p-val-${index}`).value, 10);
    });
    document.getElementById('preset-editor').classList.add('hidden');
    saveState();
  });
}

init();