const stage = document.getElementById('stage');
const scene = document.getElementById('scene');
const inventory = document.getElementById('inventory');
const trash = document.getElementById('trash');
const poseBtn = document.getElementById('poseBtn');
const homeBtn = document.getElementById('homeBtn');

const I = (id, path, scale) => [id, path, scale];

const catalog = {
  beds: [
    I('bed-single-01','assets/beds/bed-single-01.png',0.34),
    I('bed-single-02','assets/beds/bed-single-02.png',0.34),
    I('bed-single-03','assets/beds/bed-single-03.png',0.34),
    I('bed-bunk-01','assets/beds/bed-bunk-01.png',0.37),
    I('bed-bunk-02','assets/beds/bed-bunk-02.png',0.37),
  ],
  furniture: [
    I('chair-01','assets/furniture/chair-01.png',0.22), I('chair-02','assets/furniture/chair-02.png',0.22),
    I('desk-01','assets/furniture/desk-01.png',0.27), I('desk-02','assets/furniture/desk-02.png',0.27),
    I('dresser-01','assets/furniture/dresser-01.png',0.27), I('dresser-02','assets/furniture/dresser-02.png',0.27),
    I('nightstand-01','assets/furniture/nightstand-01.png',0.18), I('nightstand-02','assets/furniture/nightstand-02.png',0.18),
    I('vanity-01','assets/furniture/vanity-01.png',0.31), I('vanity-02','assets/furniture/vanity-02.png',0.31),
    I('wardrobe-01','assets/furniture/wardrobe-01.png',0.38), I('wardrobe-02','assets/furniture/wardrobe-02.png',0.38),
    I('mirror-01','assets/furniture/mirror-01.png',0.29), I('mirror-02','assets/furniture/mirror-02.png',0.29),
    I('lamp-01','assets/furniture/lamp-01.png',0.17), I('lamp-02','assets/furniture/lamp-02.png',0.17),
    I('ottoman-01','assets/furniture/ottoman-01.png',0.16), I('ottoman-02','assets/furniture/ottoman-02.png',0.16),
    I('side-table-01','assets/furniture/side-table-01.png',0.18), I('side-table-02','assets/furniture/side-table-02.png',0.18),
    I('beanbag-01','assets/furniture/beanbag-01.png',0.22), I('beanbag-02','assets/furniture/beanbag-02.png',0.22),
    I('bookshelf-01','assets/furniture/bookshelf-01.png',0.31), I('bookshelf-02','assets/furniture/bookshelf-02.png',0.31),
  ],
  decor: [
    I('rug-01','assets/decor/rug-01.png',0.20), I('rug-02','assets/decor/rug-02.png',0.20),
    I('wall-art-01','assets/decor/wall-art-01.png',0.17), I('wall-art-02','assets/decor/wall-art-02.png',0.17),
    I('wall-shelf-01','assets/decor/wall-shelf-01.png',0.18), I('wall-shelf-02','assets/decor/wall-shelf-02.png',0.18),
    I('flower-vase-01','assets/decor/flower-vase-01.png',0.12), I('flower-vase-02','assets/decor/flower-vase-02.png',0.12),
    I('alarm-clock-01','assets/decor/alarm-clock-01.png',0.09), I('alarm-clock-02','assets/decor/alarm-clock-02.png',0.09),
    I('books-01','assets/decor/books-01.png',0.10), I('books-02','assets/decor/books-02.png',0.10),
    I('snow-globe-01','assets/decor/snow-globe-01.png',0.12),
  ],
  toys: [
    I('building-blocks-01','assets/toys/building-blocks-01.png',0.13),
    I('doll-01','assets/toys/doll-01.png',0.15), I('doll-02','assets/toys/doll-02.png',0.15), I('doll-03','assets/toys/doll-03.png',0.15), I('doll-04','assets/toys/doll-04.png',0.15), I('doll-05','assets/toys/doll-05.png',0.15),
    I('rocking-horse-01','assets/toys/rocking-horse-01.png',0.22), I('tea-set-01','assets/toys/tea-set-01.png',0.12),
    I('teddy-bear-01','assets/toys/teddy-bear-01.png',0.15), I('teddy-bear-02','assets/toys/teddy-bear-02.png',0.15),
    I('toy-castle-01','assets/toys/toy-castle-01.png',0.20), I('toy-chest-01','assets/toys/toy-chest-01.png',0.20), I('toy-chest-02','assets/toys/toy-chest-02.png',0.20),
    I('toy-dollhouse-01','assets/toys/toy-dollhouse-01.png',0.24), I('toy-drum-set-01','assets/toys/toy-drum-set-01.png',0.20),
    I('toy-guitar-01','assets/toys/toy-guitar-01.png',0.18), I('toy-kitchen-01','assets/toys/toy-kitchen-01.png',0.25), I('toy-piano-01','assets/toys/toy-piano-01.png',0.22), I('toy-unicorn-01','assets/toys/toy-unicorn-01.png',0.16),
  ],
  character: [I('character','assets/character/base-standing.png',0.30)]
};

let category = 'beds';
let selected = null;
let characterPose = 'standing';
let uid = 0;

function renderInventory(){
  inventory.innerHTML = '';
  for (const [id,src,scale] of catalog[category]) {
    const btn = document.createElement('button');
    btn.className = 'inventory-card';
    btn.title = id;
    btn.innerHTML = `<img src="${src}" alt="${id}"><span>${id.replace(/-0\d$/,'').replaceAll('-',' ')}</span>`;
    btn.addEventListener('click', () => addItem(id,src,scale));
    inventory.appendChild(btn);
  }
}

function addItem(type,src,scale){
  if(type === 'character' && scene.querySelector('[data-type="character"]')) {
    selectItem(scene.querySelector('[data-type="character"]'));
    return;
  }
  const img = document.createElement('img');
  img.src = src;
  img.draggable = false;
  img.className = 'placeable';
  img.dataset.type = type;
  img.dataset.uid = ++uid;
  img.dataset.scale = scale;
  img.dataset.x = type === 'character' ? 0.52 : 0.5;
  img.dataset.y = type === 'character' ? 0.86 : 0.78;
  scene.appendChild(img);
  img.addEventListener('load', () => {
    setSize(img, scale); positionFromData(img); setDepth(img); persist();
  }, {once:true});
  makeDraggable(img); selectItem(img);
}

function setSize(el,scale){
  el.style.height = `${Math.round(stage.clientHeight * scale)}px`;
  el.style.width = 'auto';
}
function positionFromData(el){
  const x = +el.dataset.x * stage.clientWidth;
  const y = +el.dataset.y * stage.clientHeight;
  el.style.transform = `translate(${x - el.offsetWidth/2}px, ${y - el.offsetHeight}px)`;
}
function updateNormalized(el,x,y){
  el.dataset.x = Math.max(0,Math.min(1,x/stage.clientWidth));
  el.dataset.y = Math.max(0,Math.min(1,y/stage.clientHeight));
  positionFromData(el); setDepth(el);
}
function setDepth(el){
  const y = Number(el.dataset.y || .5);
  let z = 10 + Math.round(y*800);
  if(el.dataset.type === 'character') z += 12;
  if(el.dataset.type.startsWith('rug')) z = 5;
  el.style.zIndex = String(z);
}
function selectItem(el){
  document.querySelectorAll('.placeable.selected').forEach(x=>x.classList.remove('selected'));
  selected = el; if(el) el.classList.add('selected');
}
function makeDraggable(el){
  let pointerId=null;
  el.addEventListener('pointerdown', e=>{
    pointerId=e.pointerId; el.setPointerCapture(pointerId); el.classList.add('dragging'); stage.classList.add('drag-active'); selectItem(el); e.preventDefault();
  });
  el.addEventListener('pointermove', e=>{
    if(pointerId!==e.pointerId) return;
    const r=stage.getBoundingClientRect(); updateNormalized(el,e.clientX-r.left,e.clientY-r.top);
    const tr=trash.getBoundingClientRect(); trash.classList.toggle('hot',e.clientX>=tr.left&&e.clientX<=tr.right&&e.clientY>=tr.top&&e.clientY<=tr.bottom);
  });
  const end=e=>{
    if(pointerId!==e.pointerId) return;
    const tr=trash.getBoundingClientRect();
    const over=e.clientX>=tr.left&&e.clientX<=tr.right&&e.clientY>=tr.top&&e.clientY<=tr.bottom;
    if(over && el.dataset.type!=='character') { el.remove(); selected=null; }
    pointerId=null; el.classList.remove('dragging'); stage.classList.remove('drag-active'); trash.classList.remove('hot'); persist();
  };
  el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
}

poseBtn.addEventListener('click',()=>{
  const girl=scene.querySelector('[data-type="character"]');
  if(!girl) return addItem('character','assets/character/base-standing.png',0.30);
  characterPose = characterPose === 'standing' ? 'sitting' : 'standing';
  girl.src = `assets/character/base-${characterPose}.png`;
  girl.dataset.scale = characterPose === 'standing' ? 0.30 : 0.31;
  girl.addEventListener('load',()=>{setSize(girl,+girl.dataset.scale);positionFromData(girl);persist();},{once:true});
});

homeBtn.addEventListener('click',()=>{
  if(confirm('Reset the room?')) { scene.innerHTML=''; localStorage.removeItem('her-world-layout-v2'); characterPose='standing'; }
});

document.querySelectorAll('.dock-tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.dock-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); category=btn.dataset.category; renderInventory();
}));

stage.addEventListener('pointerdown',e=>{ if(e.target===stage||e.target===scene) selectItem(null); });

function persist(){
  const items=[...scene.querySelectorAll('.placeable')].map(el=>({type:el.dataset.type,src:el.getAttribute('src'),x:+el.dataset.x,y:+el.dataset.y,scale:+el.dataset.scale}));
  localStorage.setItem('her-world-layout-v2',JSON.stringify({items,characterPose}));
}
function restore(){
  try{
    const saved=JSON.parse(localStorage.getItem('her-world-layout-v2'));
    if(!saved?.items?.length) return;
    characterPose=saved.characterPose||'standing';
    for(const it of saved.items){
      const img=document.createElement('img'); img.src=it.src; img.draggable=false; img.className='placeable';
      img.dataset.type=it.type; img.dataset.uid=++uid; img.dataset.x=it.x; img.dataset.y=it.y; img.dataset.scale=it.scale;
      scene.appendChild(img); makeDraggable(img);
      img.addEventListener('load',()=>{setSize(img,it.scale);positionFromData(img);setDepth(img);},{once:true});
    }
  }catch{}
}
window.addEventListener('resize',()=>document.querySelectorAll('.placeable').forEach(el=>{setSize(el,+el.dataset.scale);positionFromData(el)}));

renderInventory(); restore();
