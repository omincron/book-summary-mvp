function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getData() {
  try {
    return JSON.parse(localStorage.getItem('folio_ink_data') || '{"books":[]}');
  } catch (e) {
    return { books: [] };
  }
}

function saveData(data) {
  localStorage.setItem('folio_ink_data', JSON.stringify(data));
}

function esc(value) {
  const el = document.createElement('div');
  el.textContent = value || '';
  return el.innerHTML;
}
