/* MiniPDF – a tiny dependency-free PDF writer (text only, standard fonts).
   Enough for a multi-page evaluation report; no external libraries needed. */
(function () {
  "use strict";
  const FONTS = { normal: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique", mono: "Courier" };
  const AVG = { normal: 0.52, bold: 0.56, italic: 0.52, mono: 0.6 }; // approx. average glyph width (em)

  function MiniPDF(opts) {
    this.w = 595.28; this.h = 841.89; // A4 points
    this.margin = (opts && opts.margin) || 40;
    this.pages = []; this.newPage();
  }
  MiniPDF.prototype.newPage = function () { this.cur = []; this.pages.push(this.cur); this.y = this.margin; };
  MiniPDF.prototype.ensure = function (h) { if (this.y + h > this.h - this.margin) this.newPage(); };
  MiniPDF.prototype.width = function (str, style, size) { return str.length * AVG[style] * size; };
  MiniPDF.prototype.wrap = function (str, style, size, maxW) {
    const out = []; const words = String(str).split(/\s+/); let line = "";
    const maxChars = Math.max(8, Math.floor(maxW / (AVG[style] * size)));
    for (let w of words) {
      while (w.length > maxChars) { if (line) { out.push(line); line = ""; } out.push(w.slice(0, maxChars)); w = w.slice(maxChars); }
      const t = line ? line + " " + w : w;
      if (t.length > maxChars) { out.push(line); line = w; } else line = t;
    }
    if (line || !out.length) out.push(line);
    return out;
  };
  // Draw a paragraph, wrapping and paginating automatically
  MiniPDF.prototype.text = function (str, size, style, color, indent) {
    style = style || "normal"; color = color || [0.1, 0.13, 0.18]; indent = indent || 0;
    const lh = size * 1.35; const maxW = this.w - 2 * this.margin - indent;
    const lines = String(str).split("\n").flatMap(l => this.wrap(l, style, size, maxW));
    for (const l of lines) { this.ensure(lh); this.cur.push({ x: this.margin + indent, y: this.y + size, s: l, style, size, color }); this.y += lh; }
  };
  MiniPDF.prototype.mono = function (str, size, maxLines, color) {
    let lines = String(str).replace(/\t/g, "    ").split("\n");
    if (maxLines && lines.length > maxLines) lines = lines.slice(0, maxLines).concat(["... (truncated)"]);
    this.text(lines.join("\n"), size, "mono", color || [0.2, 0.2, 0.25], 10);
  };
  MiniPDF.prototype.gap = function (h) { this.y += h; };
  MiniPDF.prototype.rule = function () { this.ensure(8); this.cur.push({ rule: true, y: this.y + 3 }); this.y += 10; };

  function esc(s) {
    // Latin-1 only; replace others with '?'
    let out = "";
    const map = { "–": "-", "—": "-", "‘": "'", "’": "'", "“": '"', "”": '"', "…": "...", "→": "->", "✓": "v", " ": " " };
    for (let ch of String(s)) {
      if (map[ch]) ch = map[ch]; const c = ch.charCodeAt(0); out += c > 255 ? "?" : (ch === "(" || ch === ")" || ch === "\\") ? "\\" + ch : ch; }
    return out;
  }
  function latin1(str) { let b = ""; for (let i = 0; i < str.length; i++) b += String.fromCharCode(str.charCodeAt(i) & 0xff); return b; }

  MiniPDF.prototype.build = function () {
    const objs = []; const add = (s) => { objs.push(s); return objs.length; };
    const fontIds = {}; for (const k in FONTS) fontIds[k] = add(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS[k]} /Encoding /WinAnsiEncoding >>`);
    const fontRes = "<< " + Object.keys(FONTS).map(k => `/F_${k} ${fontIds[k]} 0 R`).join(" ") + " >>";
    const pagesId = objs.length + 1 + this.pages.length * 2; // placeholder position computed below
    const pageIds = [];
    const pageObjs = [];
    for (const page of this.pages) {
      let c = "";
      for (const it of page) {
        if (it.rule) { c += `0.8 G ${this.margin} ${(this.h - it.y).toFixed(2)} m ${(this.w - this.margin)} ${(this.h - it.y).toFixed(2)} l S\n`; continue; }
        c += `BT /F_${it.style} ${it.size} Tf ${it.color.map(v => v.toFixed(3)).join(" ")} rg ${it.x.toFixed(2)} ${(this.h - it.y).toFixed(2)} Td (${esc(it.s)}) Tj ET\n`;
      }
      pageObjs.push(c);
    }
    // content streams
    const contentIds = pageObjs.map(c => add(`<< /Length ${latin1(c).length} >>\nstream\n${c}\nendstream`));
    const pagesObjId = objs.length + pageObjs.length + 1;
    contentIds.forEach(cid => pageIds.push(add(`<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 ${this.w} ${this.h}] /Resources << /Font ${fontRes} >> /Contents ${cid} 0 R >>`)));
    const pid = add(`<< /Type /Pages /Kids [${pageIds.map(i => i + " 0 R").join(" ")}] /Count ${pageIds.length} >>`);
    const catalog = add(`<< /Type /Catalog /Pages ${pid} 0 R >>`);
    let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"; const offsets = [];
    objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("");
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return latin1(out);
  };
  MiniPDF.prototype.blob = function () { const s = this.build(); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return new Blob([b], { type: "application/pdf" }); };
  MiniPDF.prototype.base64 = function () { return btoa(this.build()); };
  window.MiniPDF = MiniPDF;
})();
