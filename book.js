// ─── Partial Renderers ───────────────────────────────────────────────────────

function renderCover(book) {
  if (book.coverUrl) {
    return `<img
      class="w-full max-w-[400px] aspect-[2/3] object-cover"
      src="${esc(book.coverUrl)}"
      alt="${esc(book.title)}"
    />`;
  }

  const palette = ['#2c3e50', '#46645a', '#570000', '#4e6073', '#1b3a4b'];
  const colorIndex = book.id ? book.id.charCodeAt(0) % palette.length : 0;

  return `
    <div
      class="w-full max-w-[400px] aspect-[2/3] flex flex-col items-center justify-center rounded-lg"
      style="background: ${palette[colorIndex]}"
    >
      <span class="material-symbols-outlined text-white/30 text-7xl mb-3">menu_book</span>
      <span class="text-white/50 font-headline-md text-2xl text-center px-4">${esc(book.title)}</span>
    </div>`;
}

function renderChapters(chapters, bookId) {
  if (!chapters || !chapters.length) {
    return `
      <div class="px-6 py-8 text-center text-on-surface-variant/60 font-body-md italic">
        No chapters yet.
        <a href="add_book.html?id=${esc(bookId)}" class="text-primary hover:underline">Edit this book</a>
        to add some.
      </div>`;
  }

  return chapters.map((chapter, index) => {
    const activeClass = index === 0 ? 'marginalia-active bg-surface-container-low/40' : '';
    const truncated = chapter.summary
      ? esc(chapter.summary.substring(0, 80)) + (chapter.summary.length > 80 ? '…' : '')
      : null;
    const summaryHtml = truncated
      ? `<p class="font-label-sm text-label-sm text-on-surface-variant/60">${truncated}</p>`
      : `<p class="font-label-sm text-label-sm text-on-surface-variant/60 italic">No summary yet</p>`;

    return `
      <div
        class="chapter-item group cursor-pointer border-b border-outline-variant/10
               hover:bg-surface-container-low transition-colors px-6 py-5
               flex items-center justify-between ${activeClass}"
        onclick="window.location.href='chapter.html?bookId=${esc(bookId)}&chapterId=${esc(chapter.id)}'"
      >
        <div class="flex items-center gap-6">
          <span class="font-label-md text-label-md text-outline group-hover:text-primary transition-colors">
            ${String(chapter.number).padStart(2, '0')}
          </span>
          <div>
            <h3 class="font-body-lg font-bold text-primary">${esc(chapter.title)}</h3>
            ${summaryHtml}
          </div>
        </div>
        <span class="material-symbols-outlined text-outline group-hover:text-primary transition-transform group-hover:translate-x-1">
          chevron_right
        </span>
      </div>`;
  }).join('');
}

function renderGlossary(glossary) {
  if (!glossary || !glossary.length) {
    return `<p class="p-4 font-body-md text-on-surface-variant/60 italic">No glossary entries for this book.</p>`;
  }

  return glossary.map(entry => `
    <div class="grid grid-cols-[1fr_2fr] gap-4 p-4 hover:bg-surface-container-low transition-colors rounded">
      <span class="font-label-md text-label-md text-primary font-bold uppercase tracking-tighter self-start">
        ${esc(entry.term)}
      </span>
      <p class="font-body-md text-body-md text-on-surface-variant">${esc(entry.definition)}</p>
    </div>`).join('');
}

function renderCharacters(characters) {
  if (!characters || !characters.length) {
    return `<p class="font-body-md text-on-surface-variant/60 italic">No characters listed for this book.</p>`;
  }

  return characters.map(character => `
    <div class="ambient-card p-6 rounded-lg bg-surface flex gap-4 items-center">
      <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
        <span class="text-on-primary-container font-headline-md text-2xl">
          ${esc((character.name || '?')[0].toUpperCase())}
        </span>
      </div>
      <div>
        <h4 class="font-headline-md text-label-md text-primary">${esc(character.name)}</h4>
        <p class="font-body-md text-label-sm text-on-surface-variant">${esc(character.role)}</p>
      </div>
    </div>`).join('');
}

// ─── Page Renderers ──────────────────────────────────────────────────────────

function renderBook(book) {
  const genreTag = book.genre
    ? `<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm">${esc(book.genre)}</span>`
    : '';

  const genreMeta = book.genre
    ? `<div class="w-px h-8 bg-outline-variant/30"></div>
       <div class="flex flex-col">
         <span class="font-label-sm text-label-sm text-outline uppercase tracking-widest">Genre</span>
         <span class="font-body-lg text-body-lg text-primary">${esc(book.genre)}</span>
       </div>`
    : '';

  const synopsisSection = book.synopsis
    ? `<section class="mb-stack-lg">
         <h2 class="font-label-sm text-label-sm text-outline uppercase tracking-[0.2em] mb-4">About the Book</h2>
         <div class="font-body-lg text-body-lg text-on-surface leading-relaxed">
           <p>${esc(book.synopsis)}</p>
         </div>
       </section>`
    : '';

  document.getElementById('book-detail').innerHTML = `
    <div class="flex flex-col lg:flex-row gap-16 items-start">

      <!-- Book Cover -->
      <div class="w-full lg:w-5/12 flex justify-center sticky top-28">
        <div class="book-shadow overflow-hidden rounded-lg border border-primary/10 bg-white">
          ${renderCover(book)}
        </div>
      </div>

      <!-- Book Details -->
      <div class="w-full lg:w-7/12">

        <div class="mb-stack-md">
          <div class="flex gap-2 mb-4">${genreTag}</div>
          <h1 class="font-headline-lg text-headline-lg text-primary mb-2">${esc(book.title)}</h1>
          <div class="flex items-center gap-4 mb-stack-lg border-b border-outline-variant/10 pb-6 flex-wrap">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm text-outline uppercase tracking-widest">Author</span>
              <span class="font-body-lg text-body-lg text-primary">${esc(book.author || '—')}</span>
            </div>
            ${genreMeta}
            <div class="w-px h-8 bg-outline-variant/30"></div>
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm text-outline uppercase tracking-widest">Chapters</span>
              <span class="font-body-lg text-body-lg text-primary">${book.chapters ? book.chapters.length : 0}</span>
            </div>
          </div>
        </div>

        ${synopsisSection}

        <section class="mb-12">
          <h2 class="font-label-sm text-label-sm text-outline uppercase tracking-[0.2em] mb-6">Contents</h2>
          <div class="space-y-0 ambient-card rounded-lg bg-surface-container-lowest overflow-hidden">
            ${renderChapters(book.chapters, book.id)}
          </div>
        </section>

        <section class="mb-stack-lg py-stack-lg border-t border-outline-variant/10" id="book-glossary">
          <h2 class="font-headline-md text-headline-md text-primary mb-stack-md">Book Glossary</h2>
          <div class="space-y-2">${renderGlossary(book.glossary)}</div>
        </section>

        <section class="mb-stack-lg" id="book-characters">
          <h2 class="font-headline-md text-headline-md text-primary mb-stack-md">Characters</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">${renderCharacters(book.characters)}</div>
        </section>

      </div>
    </div>`;
}

function renderNotFound() {
  document.getElementById('book-detail').innerHTML = `
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <span class="material-symbols-outlined text-on-surface-variant/30 text-7xl mb-6">menu_book</span>
      <h1 class="font-headline-lg text-headline-lg text-primary mb-4">Book not found</h1>
      <p class="font-body-lg text-on-surface-variant mb-8">No book ID provided, or the book was deleted.</p>
      <a href="home.html" class="bg-primary text-on-primary px-8 py-3 font-label-md rounded hover:opacity-90 transition-opacity">
        Back to Library
      </a>
    </div>`;
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

function init() {
  const bookId = new URLSearchParams(window.location.search).get('id');
  if (!bookId) {
    renderNotFound();
    return;
  }

  const book = getData().books.find(b => b.id === bookId);
  if (book) {
    document.title = `${book.title} | Folio & Ink`;
    renderBook(book);
  } else {
    renderNotFound();
  }
}

init();
