function deleteBook(id) {
  if (!confirm('Delete this book? This cannot be undone.')) return;
  const data = getData();
  data.books = data.books.filter(b => b.id !== id);
  saveData(data);
  renderBooks();
}

function coverPlaceholder(book) {
  const palette = ['#2c3e50', '#46645a', '#570000', '#4e6073', '#1b3a4b'];
  const colorIndex = book.id ? book.id.charCodeAt(0) % palette.length : 0;
  return `
    <div class="w-full h-full flex flex-col items-center justify-center" style="background: ${palette[colorIndex]}">
      <span class="material-symbols-outlined text-white/40 text-5xl mb-2">menu_book</span>
      <span class="text-white/60 text-xs font-label-sm text-center px-2">${esc(book.genre || 'Book')}</span>
    </div>`;
}

function renderBooks() {
  const data = getData();
  const grid = document.getElementById('books-grid');
  let html = '';

  data.books.forEach(book => {
    const cover = book.coverUrl
      ? `<img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${esc(book.coverUrl)}" alt="${esc(book.title)}"/>`
      : coverPlaceholder(book);

    const genreTag = book.genre
      ? `<span class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-label-sm uppercase tracking-widest">${esc(book.genre)}</span>`
      : '';

    html += `
      <div class="book-card-wrapper relative">
        <button
          onclick="event.stopPropagation(); deleteBook('${esc(book.id)}')"
          class="delete-btn absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          title="Delete book"
        >
          <span class="material-symbols-outlined text-[16px]">delete</span>
        </button>
        <div
          class="ambient-card bg-surface-container-lowest rounded-DEFAULT overflow-hidden p-stack-sm flex flex-col cursor-pointer"
          onclick="window.location.href='book.html?id=${esc(book.id)}'"
        >
          <div class="aspect-[2/3] overflow-hidden rounded-DEFAULT mb-stack-sm relative group">
            ${cover}
            <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button class="bg-surface text-primary p-3 rounded-full shadow-lg">
                <span class="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>
          <div class="px-2 pb-2">
            <div class="flex gap-2 mb-2">${genreTag}</div>
            <h3 class="font-headline-md text-body-lg text-primary leading-tight mb-1">${esc(book.title)}</h3>
            <p class="font-body-md text-on-surface-variant opacity-80 text-sm italic">${esc(book.author)}</p>
          </div>
        </div>
      </div>`;
  });

  html += `
    <a href="add_book.html" class="border-2 border-dashed border-outline-variant/30 rounded-DEFAULT p-stack-sm flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors group">
      <div class="aspect-[2/3] w-full rounded-DEFAULT mb-stack-sm flex flex-col items-center justify-center bg-surface-container text-on-surface-variant/40 group-hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-4xl mb-2">add_circle</span>
        <span class="font-label-md">Add to Collection</span>
      </div>
    </a>`;

  grid.innerHTML = html;
}

function exportJSON() {
  const data = getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'library-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !Array.isArray(parsed.books)) {
        alert('Invalid file: JSON must have a "books" array.');
        return;
      }
      if (!confirm(`Import ${parsed.books.length} book(s)? This will replace your current library.`)) return;
      saveData(parsed);
      renderBooks();
      alert('Import successful!');
    } catch (err) {
      alert('Failed to parse JSON file: ' + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

renderBooks();
