function getBook(id) {
  return getData().books.find(b => b.id === id) || null;
}

function saveBook(b) {
  const data = getData();
  const idx = data.books.findIndex(x => x.id === b.id);
  if (idx >= 0) {
    data.books[idx] = b;
  } else {
    data.books.push(b);
  }
  saveData(data);
}

// ─── State ───────────────────────────────────────────────────────────────────

let book = {
  id: genId(), title: '', author: '', synopsis: '', genre: '', coverUrl: '',
  chapters: [], createdAt: new Date().toISOString(),
};
let editingChapterId = null;
let isNewChapter = false;
let modalGlossary = [];
let modalCharacters = [];

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (id) {
    const existing = getBook(id);
    if (existing) {
      book = JSON.parse(JSON.stringify(existing));
      document.getElementById('book-title').value    = existing.title    || '';
      document.getElementById('book-author').value   = existing.author   || '';
      document.getElementById('book-synopsis').value = existing.synopsis || '';
      document.getElementById('book-genre').value    = existing.genre    || '';
      document.getElementById('cover-url-input').value = existing.coverUrl || '';
      if (existing.coverUrl) updateCoverPreview(existing.coverUrl);
      document.getElementById('page-heading').textContent = 'Edit Manuscript';
      updateGenreTags(existing.genre || '');
    }
  }
  renderChapterList();
}

// ─── Cover ────────────────────────────────────────────────────────────────────

function updateCoverPreview(url) {
  const img = document.getElementById('cover-preview');
  const placeholder = document.getElementById('cover-placeholder');
  if (url && url.trim()) {
    img.src = url.trim();
    img.classList.remove('hidden');
    placeholder.classList.add('hidden');
    book.coverUrl = url.trim();
  } else {
    img.classList.add('hidden');
    placeholder.classList.remove('hidden');
    book.coverUrl = '';
  }
}

// ─── Genre Tags ───────────────────────────────────────────────────────────────

function updateGenreTags(genre) {
  book.genre = genre;
  const container = document.getElementById('genre-tags');
  container.innerHTML = genre.trim()
    ? `<span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm">${esc(genre)}</span>`
    : '<span class="font-label-sm text-label-sm text-on-surface-variant/60 italic">Add a genre above</span>';
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

function addChapter() {
  isNewChapter = true;
  editingChapterId = null;
  document.getElementById('modal-heading').textContent = 'New Chapter';
  document.getElementById('modal-chapter-title').value = `Chapter ${book.chapters.length + 1}`;
  document.getElementById('modal-preface').value = '';
  document.getElementById('modal-summary').value = '';
  modalGlossary = [];
  modalCharacters = [];
  renderModalGlossary();
  renderModalCharacters();
  document.getElementById('chapter-modal').classList.remove('hidden');
}

function deleteChapter(id) {
  if (!confirm('Remove this chapter?')) return;
  book.chapters = book.chapters.filter(c => c.id !== id);
  book.chapters.forEach((c, i) => { c.number = i + 1; });
  renderChapterList();
}

function renderChapterList() {
  const list = document.getElementById('chapters-list');
  if (!book.chapters.length) {
    list.innerHTML = '<p class="font-body-md text-on-surface-variant/60 italic text-sm">No chapters yet. Click "Add Chapter" to begin.</p>';
    return;
  }
  list.innerHTML = book.chapters.map(ch => {
    const summaryPreview = ch.summary
      ? `<p class="font-label-sm text-label-sm text-on-surface-variant/70 mt-1">${esc(ch.summary.substring(0, 100))}${ch.summary.length > 100 ? '…' : ''}</p>`
      : '';
    const glossaryCount = ch.glossary.length
      ? `<span class="text-[10px] text-outline">${ch.glossary.length} term${ch.glossary.length !== 1 ? 's' : ''}</span>`
      : '';
    const characterCount = ch.characters.length
      ? `<span class="text-[10px] text-outline">${ch.characters.length} character${ch.characters.length !== 1 ? 's' : ''}</span>`
      : '';

    return `
      <div class="chapter-entry bg-surface-container-lowest border border-outline-variant/10 p-4 ambient-shadow marginalia-line hover:bg-surface-container transition-colors group">
        <div class="flex justify-between items-start">
          <div class="flex items-start gap-4 flex-1 min-w-0">
            <span class="font-label-sm text-outline mt-1 flex-shrink-0">${String(ch.number).padStart(2, '0')}</span>
            <div class="min-w-0">
              <h3 class="font-body-lg font-bold text-primary truncate">${esc(ch.title)}</h3>
              ${summaryPreview}
              <div class="flex gap-3 mt-1">${glossaryCount}${characterCount}</div>
            </div>
          </div>
          <div class="flex items-center gap-3 ml-4 flex-shrink-0">
            <button class="material-symbols-outlined text-outline hover:text-primary cursor-pointer transition-colors" onclick="openChapterModal('${esc(ch.id)}')" title="Edit">edit_note</button>
            <button class="material-symbols-outlined text-outline hover:text-error cursor-pointer transition-colors" onclick="deleteChapter('${esc(ch.id)}')" title="Delete">delete</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ─── Chapter Modal ────────────────────────────────────────────────────────────

function openChapterModal(id) {
  const ch = book.chapters.find(c => c.id === id);
  if (!ch) return;
  isNewChapter = false;
  editingChapterId = id;
  document.getElementById('modal-heading').textContent = `Edit Chapter ${ch.number}`;
  document.getElementById('modal-chapter-title').value = ch.title   || '';
  document.getElementById('modal-preface').value        = ch.preface || '';
  document.getElementById('modal-summary').value        = ch.summary || '';
  modalGlossary   = JSON.parse(JSON.stringify(ch.glossary   || []));
  modalCharacters = JSON.parse(JSON.stringify(ch.characters || []));
  renderModalGlossary();
  renderModalCharacters();
  document.getElementById('chapter-modal').classList.remove('hidden');
}

function closeChapterModal() {
  document.getElementById('chapter-modal').classList.add('hidden');
  editingChapterId = null;
  isNewChapter = false;
  modalGlossary = [];
  modalCharacters = [];
}

function saveChapterModal() {
  const title      = document.getElementById('modal-chapter-title').value.trim();
  const preface    = document.getElementById('modal-preface').value;
  const summary    = document.getElementById('modal-summary').value;
  const glossary   = JSON.parse(JSON.stringify(modalGlossary));
  const characters = JSON.parse(JSON.stringify(modalCharacters));

  if (isNewChapter) {
    book.chapters.push({
      id: genId(),
      number: book.chapters.length + 1,
      title: title || `Chapter ${book.chapters.length + 1}`,
      preface, summary, glossary, characters,
    });
  } else {
    const ch = book.chapters.find(c => c.id === editingChapterId);
    if (ch) {
      ch.title      = title || ch.title;
      ch.preface    = preface;
      ch.summary    = summary;
      ch.glossary   = glossary;
      ch.characters = characters;
    }
  }
  closeChapterModal();
  renderChapterList();
}

// ─── Modal Glossary ───────────────────────────────────────────────────────────

function renderModalGlossary() {
  const list = document.getElementById('modal-glossary-list');
  if (!modalGlossary.length) {
    list.innerHTML = '<p class="font-label-sm text-on-surface-variant/60 italic text-sm">No terms yet.</p>';
    return;
  }
  list.innerHTML = modalGlossary.map((g, idx) => `
    <div class="flex gap-3 items-center border-b border-outline-variant/10 py-2">
      <input class="manuscript-input font-label-md py-1 flex-1" placeholder="Term" type="text" value="${esc(g.term)}"
        oninput="modalGlossary[${idx}].term = this.value"/>
      <input class="manuscript-input font-body-md py-1 flex-1" placeholder="Definition" type="text" value="${esc(g.definition)}"
        oninput="modalGlossary[${idx}].definition = this.value"/>
      <button class="material-symbols-outlined text-sm text-outline hover:text-error flex-shrink-0" onclick="deleteModalGlossaryEntry(${idx})">close</button>
    </div>`).join('');
}

function addModalGlossaryEntry() {
  modalGlossary.push({ id: genId(), term: '', definition: '' });
  renderModalGlossary();
  const inputs = document.getElementById('modal-glossary-list').querySelectorAll('input');
  if (inputs.length) inputs[inputs.length - 2].focus();
}

function deleteModalGlossaryEntry(idx) {
  modalGlossary.splice(idx, 1);
  renderModalGlossary();
}

// ─── Modal Characters ─────────────────────────────────────────────────────────

function renderModalCharacters() {
  const list = document.getElementById('modal-characters-list');
  if (!modalCharacters.length) {
    list.innerHTML = '<p class="font-label-sm text-on-surface-variant/60 italic text-sm">No characters yet.</p>';
    return;
  }
  list.innerHTML = modalCharacters.map((c, idx) => `
    <div class="flex gap-3 items-center border-b border-outline-variant/10 py-2">
      <input class="manuscript-input font-label-md py-1 flex-1" placeholder="Name" type="text" value="${esc(c.name)}"
        oninput="modalCharacters[${idx}].name = this.value"/>
      <input class="manuscript-input font-body-md py-1 flex-1" placeholder="Role / Description" type="text" value="${esc(c.role)}"
        oninput="modalCharacters[${idx}].role = this.value"/>
      <button class="material-symbols-outlined text-sm text-outline hover:text-error flex-shrink-0" onclick="deleteModalCharacterEntry(${idx})">close</button>
    </div>`).join('');
}

function addModalCharacterEntry() {
  modalCharacters.push({ id: genId(), name: '', role: '' });
  renderModalCharacters();
  const inputs = document.getElementById('modal-characters-list').querySelectorAll('input');
  if (inputs.length) inputs[inputs.length - 2].focus();
}

function deleteModalCharacterEntry(idx) {
  modalCharacters.splice(idx, 1);
  renderModalCharacters();
}

// ─── Save / Export ────────────────────────────────────────────────────────────

function saveBookToStorage() {
  book.title    = document.getElementById('book-title').value.trim();
  book.author   = document.getElementById('book-author').value.trim();
  book.synopsis = document.getElementById('book-synopsis').value.trim();
  book.genre    = document.getElementById('book-genre').value.trim();
  book.coverUrl = document.getElementById('cover-url-input').value.trim();
  if (!book.title) { alert('Please enter a book title.'); return; }
  saveBook(book);
  window.location.href = 'home.html';
}

function exportSingleBook() {
  book.title  = document.getElementById('book-title').value.trim();
  book.author = document.getElementById('book-author').value.trim();
  const blob = new Blob([JSON.stringify({ books: [book] }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${book.title || 'manuscript'}-export.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

document.getElementById('chapter-modal').addEventListener('click', function (e) {
  if (e.target === this) closeChapterModal();
});

init();
