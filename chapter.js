function toggleSummaries() {
  const panel   = document.getElementById('summaries-panel');
  const overlay = document.getElementById('panel-overlay');
  const isOpen  = !panel.classList.contains('translate-x-full');

  if (isOpen) {
    panel.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  } else {
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    panel.classList.remove('translate-x-full');
  }
}

function renderChapter(book, chapter) {
  const bookId     = book.id;
  const chIdx      = book.chapters.findIndex(c => c.id === chapter.id);
  const prevChapter = chIdx > 0 ? book.chapters[chIdx - 1] : null;
  const nextChapter = chIdx < book.chapters.length - 1 ? book.chapters[chIdx + 1] : null;
  const backUrl    = `book.html?id=${esc(bookId)}`;

  document.getElementById('back-to-book-link').href = backUrl;
  document.getElementById('back-to-book-btn').href  = backUrl;
  document.title = `${chapter.title} | ${book.title} | [App Name]`;

  // Past summaries panel
  const pastChapters = book.chapters.slice(0, chIdx);
  document.getElementById('summaries-list').innerHTML = pastChapters.length
    ? pastChapters.map((ch, i) => `
        <div class="group cursor-pointer ${i > 0 ? 'border-t border-outline-variant/10 pt-4' : ''}"
             onclick="window.location.href='chapter.html?bookId=${esc(bookId)}&chapterId=${esc(ch.id)}'">
          <div class="flex justify-between items-baseline mb-1">
            <span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Chapter ${ch.number}</span>
            <span class="text-xs text-outline italic truncate ml-2 max-w-[120px]">${esc(ch.title)}</span>
          </div>
          <p class="font-body-md text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">
            ${esc(ch.summary ? ch.summary.substring(0, 150) + (ch.summary.length > 150 ? '…' : '') : 'No summary.')}
          </p>
        </div>`).join('')
    : '<p class="font-body-md text-on-surface-variant/60 italic text-sm">This is the first chapter.</p>';

  // Preface
  const prefaceHtml = chapter.preface
    ? `<section class="mb-stack-lg bg-surface-container-low p-stack-md rounded shadow-sm border-l-4 border-secondary/40" id="chapter-preface">
         <div class="flex items-start gap-4">
           <span class="material-symbols-outlined text-secondary mt-1">info</span>
           <div>
             <h2 class="font-headline-md text-headline-md text-primary mb-2">Before you enter this chapter</h2>
             <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed italic">${esc(chapter.preface)}</p>
           </div>
         </div>
       </section>`
    : '<div id="chapter-preface"></div>';

  // Summary
  const summaryHtml = chapter.summary
    ? `<article class="prose prose-slate max-w-none mb-stack-lg" id="chapter-summary">
         <div class="space-y-stack-md font-body-lg text-body-lg text-on-surface leading-relaxed">
           ${chapter.summary.split('\n\n').filter(p => p.trim()).map(p => `<p>${esc(p)}</p>`).join('') || `<p>${esc(chapter.summary)}</p>`}
         </div>
         <div class="py-12 flex justify-center">
           <span class="text-outline text-2xl font-serif">❦</span>
         </div>
       </article>`
    : `<article class="mb-stack-lg" id="chapter-summary">
         <p class="font-body-lg text-on-surface-variant/60 italic">No summary written yet.</p>
       </article>`;

  // Glossary
  const glossaryHtml = chapter.glossary && chapter.glossary.length
    ? `<section class="mb-stack-lg py-stack-lg border-t border-outline-variant/10" id="chapter-glossary">
         <h2 class="font-headline-md text-headline-md text-primary mb-stack-md">Chapter Glossary</h2>
         <div class="space-y-2">
           ${chapter.glossary.map((g, i) => `
             <div class="grid grid-cols-[1fr_2fr] gap-4 p-4 ${i % 2 === 1 ? 'bg-surface-container-lowest border-y border-outline-variant/5' : 'hover:bg-surface-container-low transition-colors rounded'}">
               <span class="font-label-md text-label-md text-primary font-bold uppercase tracking-tighter self-start">${esc(g.term)}</span>
               <p class="font-body-md text-body-md text-on-surface-variant">${esc(g.definition)}</p>
             </div>`).join('')}
         </div>
       </section>`
    : '<div id="chapter-glossary"></div>';

  // Characters
  const charactersHtml = chapter.characters && chapter.characters.length
    ? `<section class="mb-stack-lg" id="chapter-characters">
         <h2 class="font-headline-md text-headline-md text-primary mb-stack-md">Characters</h2>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
           ${chapter.characters.map(c => `
             <div class="paper-elevation p-6 rounded-lg bg-surface flex gap-4 items-center">
               <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                 <span class="text-on-primary-container font-headline-md text-2xl">${esc((c.name || '?')[0].toUpperCase())}</span>
               </div>
               <div>
                 <h4 class="font-headline-md text-label-md text-primary">${esc(c.name)}</h4>
                 <p class="font-body-md text-label-sm text-on-surface-variant">${esc(c.role)}</p>
               </div>
             </div>`).join('')}
         </div>
       </section>`
    : '<div id="chapter-characters"></div>';

  // Prev / Next navigation
  const navHtml = `
    <div class="flex justify-between items-center mt-16 pt-8 border-t border-outline-variant/20">
      ${prevChapter
        ? `<a href="chapter.html?bookId=${esc(bookId)}&chapterId=${esc(prevChapter.id)}" class="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
             <span class="material-symbols-outlined">chevron_left</span>
             <div class="text-left">
               <div class="font-label-sm text-outline text-xs uppercase tracking-widest">Previous</div>
               <div class="font-label-md text-label-md">${esc(prevChapter.title)}</div>
             </div>
           </a>`
        : '<div></div>'}
      <a href="${backUrl}" class="text-outline font-label-sm text-label-sm hover:text-primary transition-colors">Contents</a>
      ${nextChapter
        ? `<a href="chapter.html?bookId=${esc(bookId)}&chapterId=${esc(nextChapter.id)}" class="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
             <div class="text-right">
               <div class="font-label-sm text-outline text-xs uppercase tracking-widest">Next</div>
               <div class="font-label-md text-label-md">${esc(nextChapter.title)}</div>
             </div>
             <span class="material-symbols-outlined">chevron_right</span>
           </a>`
        : '<div></div>'}
    </div>`;

  document.getElementById('chapter-content').innerHTML = `
    <header class="mb-stack-lg">
      <span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-widest">${esc(book.title)}</span>
      <h1 class="font-headline-lg text-headline-lg text-primary mt-2 mb-4">
        <span class="text-outline/60 mr-2">Chapter ${chapter.number}:</span>${esc(chapter.title)}
      </h1>
      <div class="w-16 h-1 bg-primary-container/20 mb-8"></div>
    </header>
    ${prefaceHtml}
    ${summaryHtml}
    ${glossaryHtml}
    ${charactersHtml}
    ${navHtml}`;
}

function renderNotFound() {
  document.getElementById('chapter-content').innerHTML = `
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <span class="material-symbols-outlined text-on-surface-variant/30 text-7xl mb-6">menu_book</span>
      <h1 class="font-headline-lg text-headline-lg text-primary mb-4">Chapter not found</h1>
      <p class="font-body-lg text-on-surface-variant mb-8">No chapter ID provided, or the chapter was deleted.</p>
      <a href="home.html" class="bg-primary text-on-primary px-8 py-3 font-label-md rounded hover:opacity-90 transition-opacity">
        Back to Library
      </a>
    </div>`;
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

function init() {
  const params    = new URLSearchParams(window.location.search);
  const bookId    = params.get('bookId');
  const chapterId = params.get('chapterId');

  if (!bookId || !chapterId) {
    renderNotFound();
    return;
  }

  const book = getData().books.find(b => b.id === bookId);
  if (!book) {
    renderNotFound();
    return;
  }

  const chapter = book.chapters && book.chapters.find(c => c.id === chapterId);
  if (chapter) {
    renderChapter(book, chapter);
  } else {
    renderNotFound();
  }
}

init();
