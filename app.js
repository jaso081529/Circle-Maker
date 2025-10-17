/* Circle Logo Maker — v3.2 (robust live update & compatibility) */
const $ = sel => document.querySelector(sel);

function val(el){
  if(!el) return null;
  if(el.type === 'checkbox') return el.checked;
  return el.value;
}

const ids = ['text1','text2','text3','r1','r2','r3','startAngle','sweep','dir1','dir2','fontSize','letterSpace','fontFamily','fontWeight','fillColor','strokeColor','strokeWidth','offset','outerW','outerC','innerR','innerO','coreR','coreO','centerSize','qrSize','hideBg','printMode','bgColor','dpi','artboard','pxSize','mmSize','gamma','saturation','contrast','brightness'];
const E = {};
ids.forEach(id => E[id] = document.getElementById(id));

const svg = document.getElementById('stage');
const textsG = document.getElementById('texts');
const pathsDef = document.getElementById('pathsDef');
const ringOuter = document.getElementById('ringOuter');
const ringInner = document.getElementById('ringInner');
const ringCore  = document.getElementById('ringCore');
const centerImage = document.getElementById('centerImage');
const qrOverlay = document.getElementById('qrOverlay');
const bgChecker = document.getElementById('bgChecker');
const renderDot = document.getElementById('renderDot');

const BUILTIN_PRESETS = {
  presetA: { name:"Brustlogo (ohne Ring)", text1:"Stammtisch – Finsterbrunner – Dummbabbler", text2:"", text3:"",
    dir1:"cw", dir2:"ccw", r1:398, r2:398, r3:300, sweep:360, startAngle:22, fontSize:92, letterSpace:10,
    fontFamily:"Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", fontWeight:"800", fillColor:"#111827",
    strokeColor:"#111827", strokeWidth:0, offset:0, outerW:0, outerC:"#111827", innerR:370, innerO:0, coreR:220, coreO:0, qrSize:140, centerSize:300, hideBg:true },
  presetB: { name:"Siegel (Außenring)", text1:"Stammtisch – Finsterbrunner – Dummbabbler", text2:"", text3:"",
    dir1:"cw", dir2:"ccw", r1:398, r2:398, r3:300, sweep:360, startAngle:22, fontSize:92, letterSpace:10,
    fontFamily:"Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", fontWeight:"900", fillColor:"#111827",
    strokeColor:"#111827", strokeWidth:0, offset:0, outerW:30, outerC:"#111827", innerR:370, innerO:40, coreR:220, coreO:20, qrSize:140, centerSize:300, hideBg:true }
};

function applyPreset(p){
  if(!p) return;
  // Support both v2 (arrays) and v3 (flat) shapes
  const texts = p.texts || [p.text1||'', p.text2||'', p.text3||''];
  const radii = p.radii || [p.r1||398, p.r2||398, p.r3||300];
  E.text1.value = texts[0] || ""; E.text2.value = texts[1] || ""; E.text3.value = texts[2] || "";
  E.dir1.value = p.dir1 || (p.dirs ? p.dirs[0] : "cw");
  E.dir2.value = p.dir2 || (p.dirs ? p.dirs[1] : "ccw");
  E.r1.value = radii[0]; E.r2.value = radii[1]; E.r3.value = radii[2];
  E.sweep.value = p.sweep ?? 320;
  E.startAngle.value = p.startAngle ?? 0;
  E.fontSize.value = p.fontSize ?? 92;
  E.letterSpace.value = p.letterSpace ?? 10;
  E.fontFamily.value = p.fontFamily ?? "Inter, system-ui, -apple-system, Segoe UI, Roboto";
  E.fontWeight.value = p.fontWeight ?? "700";
  E.fillColor.value = p.fillColor ?? "#111827";
  E.strokeColor.value = p.strokeColor ?? "#111827";
  E.strokeWidth.value = p.strokeWidth ?? 0;
  E.offset.value = p.offset ?? 0;
  E.outerW.value = p.outerW ?? 40; E.outerC.value = p.outerC ?? "#111827";
  E.innerR.value = p.innerR ?? 370; E.innerO.value = p.innerO ?? 40;
  E.coreR.value = p.coreR ?? 220; E.coreO.value = p.coreO ?? 20;
  E.qrSize.value = p.qrSize ?? 140; E.centerSize.value = p.centerSize ?? 300;
  E.hideBg.checked = (p.hideBg ?? true);
  // print block (optional)
  if(p.print){
    E.printMode.value = p.print.mode || E.printMode.value;
    E.dpi.value = p.print.dpi || E.dpi.value;
    E.pxSize.value = p.print.pxSize || E.pxSize.value;
    E.mmSize.value = p.print.mmSize || E.mmSize.value;
    E.gamma.value = p.print.gamma || E.gamma.value;
    E.saturation.value = p.print.saturation || E.saturation.value;
    E.contrast.value = p.print.contrast || E.contrast.value;
    E.brightness.value = p.print.brightness || E.brightness.value;
    E.artboard.value = p.print.artboard || E.artboard.value;
    E.bgColor.value = p.print.bgColor || E.bgColor.value;
  }
  if(p.centerImage){ centerImage.setAttribute('href', p.centerImage); centerImage.setAttribute('visibility','visible'); }
  if(p.qrImage){ qrOverlay.setAttribute('href', p.qrImage); qrOverlay.setAttribute('visibility','visible'); }
  render(true);
}

document.getElementById('presetSelect').addEventListener('change', e => applyPreset(BUILTIN_PRESETS[e.target.value]));
document.getElementById('savePreset').addEventListener('click', ()=>{
  const preset = collectState();
  const blob = new Blob([JSON.stringify(preset, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'circle-logo-preset.json'; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById('saveProject').addEventListener('click', ()=>{
  const proj = collectState(); proj.version="v3.2";
  const blob = new Blob([JSON.stringify(proj, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'circle-logo-project.json'; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById('loadProject').addEventListener('click', ()=> document.getElementById('loadProjectFile').click());
document.getElementById('loadProjectFile').addEventListener('change', async e => {
  const f = e.target.files?.[0]; if(!f) return;
  try{ applyPreset(JSON.parse(await f.text())); }catch(err){ alert('Projekt JSON ungültig.'); }
});
document.getElementById('forceRender').addEventListener('click', ()=> render(true));

let customFont = null;
document.getElementById('loadFontBtn').addEventListener('click', async ()=>{
  const f = document.getElementById('fontFile').files?.[0];
  if(!f){ alert('Wähle eine Schriftdatei (TTF/OTF/WOFF/WOFF2).'); return; }
  try{
    const buf = await f.arrayBuffer();
    const font = new FontFace('UploadedFont', buf);
    await font.load();
    if (document.fonts && document.fonts.add) document.fonts.add(font);
    customFont = 'UploadedFont';
    E.fontFamily.value = 'UploadedFont';
    render(true);
  }catch(err){ console.error(err); alert('Schrift konnte nicht geladen werden.'); }
});

function rad(deg){ return deg * Math.PI / 180; }

function makeCirclePath(id, radius, startDeg, sweepDeg, invert=false){
  const r = radius;
  const start = rad(startDeg);
  const end = rad(startDeg + sweepDeg);
  const sx = Math.cos(start)*r, sy = Math.sin(start)*r;
  const ex = Math.cos(end)*r,   ey = Math.sin(end)*r;
  const largeArc = Math.abs(sweepDeg) > 180 ? 1 : 0;
  const sweepFlag = sweepDeg >= 0 ? 1 : 0;
  const sf = invert ? (sweepFlag?0:1) : sweepFlag;
  const d = `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} ${sf} ${ex} ${ey}`;
  let p = document.getElementById(id);
  if(!p){
    p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('id', id);
    pathsDef.appendChild(p);
  }
  p.setAttribute('d', d);
  return p;
}

function ensureTextGroup(idx){
  let g = document.getElementById('tgroup'+idx);
  if(!g){
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id','tgroup'+idx);
    textsG.appendChild(g);
  }
  let tp = document.getElementById('tp'+idx);
  if(!tp){
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('id','tp'+idx);
    text.setAttribute('dominant-baseline','middle');
    text.setAttribute('text-anchor','middle');
    text.style.paintOrder = 'stroke';
    g.appendChild(text);
    tp = text;
  }
  return g;
}

function clearUnused(count){
  const gs = [...textsG.children];
  gs.forEach(g => {
    const idx = +g.id.replace('tgroup','');
    if(idx >= count){ g.remove(); }
  });
}

function collectState(){
  return {
    text1: E.text1.value, text2: E.text2.value, text3: E.text3.value,
    dir1: E.dir1.value, dir2: E.dir2.value,
    r1: +E.r1.value, r2: +E.r2.value, r3: +E.r3.value,
    sweep: +E.sweep.value, startAngle: +E.startAngle.value,
    fontSize: +E.fontSize.value, letterSpace: +E.letterSpace.value,
    fontFamily: E.fontFamily.value, fontWeight: E.fontWeight.value,
    fillColor: E.fillColor.value, strokeColor: E.strokeColor.value,
    strokeWidth: +E.strokeWidth.value, offset: +E.offset.value,
    outerW: +E.outerW.value, outerC: E.outerC.value,
    innerR: +E.innerR.value, innerO: +E.innerO.value,
    coreR: +E.coreR.value, coreO: +E.coreO.value,
    qrSize: +E.qrSize.value, centerSize: +E.centerSize.value,
    hideBg: E.hideBg.checked,
    print: { mode:E.printMode.value, dpi:+E.dpi.value, pxSize:+E.pxSize.value, mmSize:+E.mmSize.value, gamma:+E.gamma.value, saturation:+E.saturation.value, contrast:+E.contrast.value, brightness:+E.brightness.value, artboard:E.artboard.value, bgColor:E.bgColor.value },
    centerImage: centerImage.getAttribute('href') || null,
    qrImage: qrOverlay.getAttribute('href') || null
  };
}

function render(force=false){
  // rings
  ringOuter.setAttribute('stroke-width', E.outerW.value);
  ringOuter.setAttribute('stroke', E.outerC.value);
  ringInner.setAttribute('r', E.innerR.value);
  ringInner.setAttribute('opacity', (+E.innerO.value)/100);
  ringCore.setAttribute('r', E.coreR.value);
  ringCore.setAttribute('opacity', (+E.coreO.value)/100);
  // bg
  bgChecker.setAttribute('visibility', E.hideBg.checked ? 'hidden':'visible');

  // texts
  const entries = [];
  const t1 = E.text1.value.trim(), t2 = E.text2.value.trim(), t3 = E.text3.value.trim();
  if(t1) entries.push({txt:t1, radius:+E.r1.value, dir: E.dir1.value, idx:0});
  if(t2) entries.push({txt:t2, radius:+E.r2.value, dir: E.dir2.value, idx:1, invert:true});
  if(t3) entries.push({txt:t3, radius:+E.r3.value, dir: 'cw', idx:2});

  clearUnused(entries.length);

  const sweep = +E.sweep.value * (entries.length===1 ? 360/320 : 1);
  const startAngle = +E.startAngle.value;
  const offset = +E.offset.value;

  entries.forEach((e, i) => {
    const g = ensureTextGroup(i);
    const textEl = g.querySelector('text');
    const invert = e.invert || (e.dir==='ccw');
    const arcStart = startAngle - sweep/2 + offset;
    const pid = 'arc'+i;
    makeCirclePath(pid, e.radius, arcStart, invert ? -sweep : sweep, invert);
    textEl.setAttribute('font-size', E.fontSize.value);
    textEl.setAttribute('font-family', E.fontFamily.value);
    textEl.setAttribute('font-weight', E.fontWeight.value);
    textEl.setAttribute('fill', E.fillColor.value);
    textEl.setAttribute('stroke', E.strokeColor.value);
    textEl.setAttribute('stroke-width', E.strokeWidth.value);
    while(textEl.firstChild) textEl.removeChild(textEl.firstChild);
    const tp = document.createElementNS('http://www.w3.org/2000/svg','textPath');
    tp.setAttribute('href','#'+pid);
    tp.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href','#'+pid);
    tp.setAttribute('startOffset','50%');
    const ls = +E.letterSpace.value;
    const chars = e.txt.split('');
    chars.forEach((ch, ci) => {
      const sp = document.createElementNS('http://www.w3.org/2000/svg','tspan');
      sp.textContent = ch;
      if(ci>0 && ls!==0){ sp.setAttribute('dx', ls); }
      tp.appendChild(sp);
    });
    textEl.appendChild(tp);
  });

  // center image sizing
  const size = +E.centerSize.value;
  centerImage.setAttribute('x', -size/2);
  centerImage.setAttribute('y', -size/2);
  centerImage.setAttribute('width', size);
  centerImage.setAttribute('height', size);

  // qr sizing
  const qsize = +E.qrSize.value;
  qrOverlay.setAttribute('width', qsize);
  qrOverlay.setAttribute('height', qsize);
  qrOverlay.setAttribute('x', 1000 - (qsize + 20));
  qrOverlay.setAttribute('y', 1000 - (qsize + 20));

  // print mode quick defaults (non-destructive)
  if(!force){
    if(E.printMode.value === 'textile'){
      E.gamma.value = E.gamma.value || 2.0; E.saturation.value = E.saturation.value || 1.10; E.contrast.value = E.contrast.value || 1.05; E.brightness.value = E.brightness.value || 1.00;
    }else if(E.printMode.value === 'sticker'){
      E.gamma.value = E.gamma.value || 2.2; E.saturation.value = E.saturation.value || 1.00; E.contrast.value = E.contrast.value || 1.00; E.brightness.value = E.brightness.value || 1.00;
    }
  }

  // flash render dot
  renderDot.classList.add('on'); setTimeout(()=>renderDot.classList.remove('on'), 120);
}

/* Strong event binding */
['input','change','keyup','blur'].forEach(evt => {
  ids.forEach(id => {
    const el = E[id]; if(!el) return;
    el.addEventListener(evt, ()=>render(false), {passive:true});
  });
});

/* Heartbeat fallback (handles browsers that swallow events) */
let lastSnap = null;
setInterval(()=>{
  const snap = ids.map(id=>val(E[id])).join('|');
  if(snap !== lastSnap){
    lastSnap = snap;
    render(false);
  }
}, 150);

/* File inputs */
function fileToDataURL(file){ return new Promise((res, rej)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
document.getElementById('centerFile').addEventListener('change', async e => {
  const f = e.target.files?.[0]; if(!f) return;
  const url = await fileToDataURL(f);
  centerImage.setAttribute('href', url);
  centerImage.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', url);
  centerImage.setAttribute('visibility','visible');
  render(true);
});
document.getElementById('qrFile').addEventListener('change', async e => {
  const f = e.target.files?.[0];
  if(!f){ qrOverlay.setAttribute('visibility','hidden'); return; }
  const url = await fileToDataURL(f);
  qrOverlay.setAttribute('href', url);
  qrOverlay.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', url);
  qrOverlay.setAttribute('visibility','visible');
  render(true);
});

/* Export helpers */
function mmToPx(mm, dpi){ return Math.round(mm/25.4 * dpi); }
document.getElementById('artboard').addEventListener('change', ()=>{
  const choice = E.artboard.value;
  if(choice === 'A4_300'){ E.dpi.value = 300; E.pxSize.value = 3508; E.mmSize.value = 297; }
  if(choice === 'A4_600'){ E.dpi.value = 600; E.pxSize.value = 7016; E.mmSize.value = 297; }
  if(choice === 'A3_300'){ E.dpi.value = 300; E.pxSize.value = 4961; E.mmSize.value = 420; }
  if(choice === 'A3_600'){ E.dpi.value = 600; E.pxSize.value = 9922; E.mmSize.value = 420; }
});
E.mmSize.addEventListener('input', ()=>{ E.pxSize.value = mmToPx(+E.mmSize.value, +E.dpi.value); });
E.dpi.addEventListener('input', ()=>{ E.pxSize.value = mmToPx(+E.mmSize.value, +E.dpi.value); });

function svgToDataURL(){
  const prev = bgChecker.getAttribute('visibility');
  bgChecker.setAttribute('visibility','hidden');
  const serializer = new XMLSerializer();
  const src = serializer.serializeToString(svg);
  bgChecker.setAttribute('visibility', prev);
  const svg64 = btoa(unescape(encodeURIComponent(src)));
  return 'data:image/svg+xml;base64,' + svg64;
}

function applyPixelAdjustments(ctx, w, h){
  const gamma = +E.gamma.value, sat=+E.saturation.value, con=+E.contrast.value, bri=+E.brightness.value;
  const img = ctx.getImageData(0,0,w,h); const d = img.data;
  const wl = 0.2126, wlG = 0.7152, wlB = 0.0722;
  for(let i=0;i<d.length;i+=4){
    let r=d[i]/255, g=d[i+1]/255, b=d[i+2]/255;
    r = Math.pow(r, 2.2/gamma); g = Math.pow(g, 2.2/gamma); b = Math.pow(b, 2.2/gamma);
    const l = r*wl + g*wlG + b*wlB;
    r = l + (r-l)*sat; g = l + (g-l)*sat; b = l + (b-l)*sat;
    r = (r-0.5)*con + 0.5; g = (g-0.5)*con + 0.5; b = (b-0.5)*con + 0.5;
    r *= bri; g *= bri; b *= bri;
    d[i]  = Math.max(0, Math.min(255, Math.round(r*255)));
    d[i+1]= Math.max(0, Math.min(255, Math.round(g*255)));
    d[i+2]= Math.max(0, Math.min(255, Math.round(b*255)));
  }
  ctx.putImageData(img,0,0);
}

/* PNG pHYs DPI tag */
function crc32(buf){ let c = 0xffffffff; for(let n=0;n<buf.length;n++){ c ^= buf[n]; for(let k=0;k<8;k++){ c = (c>>>1) ^ (0xedb88320 & -(c & 1)); } } return (c ^ 0xffffffff) >>> 0; }
function u32(n){ return new Uint8Array([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]); }
async function addDPIChunk(pngBlob, dpi){
  const ab = await pngBlob.arrayBuffer(); const u8 = new Uint8Array(ab);
  const pngSig = [137,80,78,71,13,10,26,10];
  for(let i=0;i<8;i++){ if(u8[i]!==pngSig[i]) throw new Error('Not a PNG'); }
  let pos = 8, insertPos = -1;
  while(pos < u8.length){
    const len = (u8[pos]<<24) | (u8[pos+1]<<16) | (u8[pos+2]<<8) | (u8[pos+3]);
    const type = String.fromCharCode(u8[pos+4],u8[pos+5],u8[pos+6],u8[pos+7]);
    const chunkEnd = pos + 12 + len;
    if(type === 'IHDR'){ insertPos = chunkEnd; break; }
    pos = chunkEnd;
  }
  if(insertPos<0) insertPos = 8;
  const ppm = Math.round(dpi / 0.0254);
  const data = new Uint8Array(9); data.set(u32(ppm),0); data.set(u32(ppm),4); data[8] = 1;
  const typeBytes = new TextEncoder().encode('pHYs');
  const crc = u32(crc32(new Uint8Array([...typeBytes, ...data])));
  const len = u32(9);
  const chunk = new Uint8Array([...len, ...typeBytes, ...data, ...crc]);
  const out = new Uint8Array(u8.length + chunk.length);
  out.set(u8.slice(0,insertPos),0); out.set(chunk, insertPos); out.set(u8.slice(insertPos), insertPos+chunk.length);
  return new Blob([out], {type:'image/png'});
}

async function exportPNG(withBG=false){
  const px = +E.pxSize.value || 4000;
  const url = svgToDataURL();
  const img = new Image();
  img.onload = async ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = px; canvas.height = px;
    const ctx = canvas.getContext('2d');
    if(withBG){ ctx.fillStyle = E.bgColor.value; ctx.fillRect(0,0,px,px); } else { ctx.clearRect(0,0,px,px); }
    ctx.drawImage(img, 0,0, px, px);
    applyPixelAdjustments(ctx, px, px);
    canvas.toBlob(async b => {
      const tagged = await addDPIChunk(b, +E.dpi.value);
      const url2 = URL.createObjectURL(tagged);
      const a = document.createElement('a'); a.href = url2; a.download = 'circle-logo.png'; a.click();
      URL.revokeObjectURL(url2);
    }, 'image/png');
  };
  img.src = url;
}

function exportSVG(){
  const prev = bgChecker.getAttribute('visibility'); bgChecker.setAttribute('visibility','hidden');
  const serializer = new XMLSerializer();
  const clone = svg.cloneNode(true); const mm = +E.mmSize.value || 340;
  clone.setAttribute('width', mm+'mm'); clone.setAttribute('height', mm+'mm');
  const src = serializer.serializeToString(clone);
  const blob = new Blob([src], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'circle-logo.svg'; a.click();
  URL.revokeObjectURL(url);
  bgChecker.setAttribute('visibility', prev);
}

document.getElementById('exportSvg').addEventListener('click', exportSVG);
document.getElementById('exportPng').addEventListener('click', ()=>exportPNG(false));
document.getElementById('exportPngFlat').addEventListener('click', ()=>exportPNG(true));

document.getElementById('howTo').addEventListener('click', (e)=>{ e.preventDefault(); document.getElementById('helpDlg').showModal(); });
document.getElementById('closeHelp').addEventListener('click', ()=>document.getElementById('helpDlg').close());

// Initial preset (so text shows immediately)
applyPreset(BUILTIN_PRESETS.presetA);
