/**
 * Splits paragraph elements into visual line wrappers (<span class="ln"><span>...</span></span>)
 * by measuring word bounding boxes via Range, so each line rises out of an overflow:hidden mask.
 */
export function splitLinesInContainer(container: HTMLElement): void {
  const paragraphs = container.querySelectorAll<HTMLElement>('p[data-split-lines="1"]');
  paragraphs.forEach((p) => {
    const raw = p.dataset.raw ?? p.textContent ?? '';
    p.dataset.raw = raw;
    const words = raw.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    // Temporarily render plain words in text nodes so Range measures real wrapped lines
    p.textContent = words.join(' ');
    const textNode = p.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

    const lines: string[] = [];
    let currentLineWords: string[] = [];
    let lastTop: number | null = null;
    let offset = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const start = offset;
      const end = start + word.length;
      offset = end + 1;

      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      const rect = range.getBoundingClientRect();
      const top = Math.round(rect.top);

      if (lastTop !== null && top > lastTop + 4) {
        lines.push(currentLineWords.join(' '));
        currentLineWords = [word];
      } else {
        currentLineWords.push(word);
      }
      lastTop = top;
    }

    if (currentLineWords.length > 0) {
      lines.push(currentLineWords.join(' '));
    }

    p.textContent = '';
    for (const lineText of lines) {
      const ln = document.createElement('span');
      ln.className = 'ln';
      const inner = document.createElement('span');
      inner.textContent = lineText;
      ln.appendChild(inner);
      p.appendChild(ln);
    }
  });
}
