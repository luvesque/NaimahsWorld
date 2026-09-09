const stage = document.getElementById('stage');
const scene = document.getElementById('scene');
const inventory = document.getElementById('inventory');
const trash = document.getElementById('trash');
const poseBtn = document.getElementById('poseBtn');
const homeBtn = document.getElementById('homeBtn');

const catalog = {
  beds: [
    ['bed-single-01','assets/beds/bed-single-01.png',0.34],
    ['bed-single-02','assets/beds/bed-single-02.png',0.34],
    ['bed-single-03','assets/beds/bed-single-03.png',0.34],
    ['bed-bunk-01','assets/beds/bed-bunk-01.png',0.34],
    ['bed-bunk-02','assets/beds/bed-bunk-02.png',0.34],
  ],
  character: [
    ['character','assets/character/standing.png',0.27],
  ]
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
    btn.innerHTML = `<img src="${src}" alt="${id}">`;
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
    setSize(img, scale);
    positionFromData(img);
    setDepth(img);
    persist();
  }, {once:true});
  makeDraggable(img);
  selectItem(img);
}

function setSize(el,scale){
  const base = stage.clientHeight;
  el.style.height = `${Math.round(base * scale)}px`;
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
  positionFromData(el);
  setDepth(el);
}

function setDepth(el){
  const y = Number(el.dataset.y || .5);
  el.style.zIndex = String(10 + Math.round(y*800));
  if(el.dataset.type === 'character') el.style.zIndex = String(20 + Math.round(y*800));
}

function selectItem(el){
  document.querySelectorAll('.placeable.selected').forEach(x=>x.classList.remove('selected'));
  selected = el;
  if(el) el.classList.add('selected');
}

function makeDraggable(el){
  let pointerId=null;
  el.addEventListener('pointerdown', e=>{
    pointerId=e.pointerId;
    el.setPointerCapture(pointerId);
    el.classList.add('dragging');
    stage.classList.add('drag-active');
    selectItem(el);
    e.preventDefault();
  });
  el.addEventListener('pointermove', e=>{
    if(pointerId!==e.pointerId) return;
    const r=stage.getBoundingClientRect();
    const x=e.clientX-r.left;
    const y=e.clientY-r.top;
    updateNormalized(el,x,y);
    const tr=trash.getBoundingClientRect();
    trash.classList.toggle('hot',e.clientX>=tr.left&&e.clientX<=tr.right&&e.clientY>=tr.top&&e.clientY<=tr.bottom);
  });
  const end=e=>{
    if(pointerId!==e.pointerId) return;
    const tr=trash.getBoundingClientRect();
    const over=e.clientX>=tr.left&&e.clientX<=tr.right&&e.clientY>=tr.top&&e.clientY<=tr.bottom;
    if(over && el.dataset.type!=='character') { el.remove(); selected=null; }
    pointerId=null;
    el.classList.remove('dragging');
    stage.classList.remove('drag-active');
    trash.classList.remove('hot');
    persist();
  };
  el.addEventListener('pointerup',end);
  el.addEventListener('pointercancel',end);
}

poseBtn.addEventListener('click',()=>{
  const girl=scene.querySelector('[data-type="character"]');
  if(!girl) return addItem('character','assets/character/standing.png',0.27);
  characterPose = characterPose === 'standing' ? 'sitting' : 'standing';
  girl.src = `assets/character/${characterPose}.png`;
  girl.dataset.scale = characterPose === 'standing' ? 0.27 : 0.29;
  girl.addEventListener('load',()=>{ setSize(girl,+girl.dataset.scale); positionFromData(girl); persist(); },{once:true});
});

homeBtn.addEventListener('click',()=>{
  if(confirm('Reset the room?')) { scene.innerHTML=''; localStorage.removeItem('her-world-layout-v1'); characterPose='standing'; }
});

document.querySelectorAll('.dock-tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.dock-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  category=btn.dataset.category;
  renderInventory();
}));

stage.addEventListener('pointerdown',e=>{ if(e.target===stage||e.target===scene) selectItem(null); });

function persist(){
  const items=[...scene.querySelectorAll('.placeable')].map(el=>({
    type:el.dataset.type, src:el.getAttribute('src'), x:+el.dataset.x, y:+el.dataset.y, scale:+el.dataset.scale
  }));
  localStorage.setItem('her-world-layout-v1',JSON.stringify({items,characterPose}));
}

function restore(){
  try{
    const saved=JSON.parse(localStorage.getItem('her-world-layout-v1'));
    if(!saved?.items?.length) return;
    characterPose=saved.characterPose||'standing';
    for(const it of saved.items){
      const img=document.createElement('img');
      img.src=it.src; img.draggable=false; img.className='placeable';
      img.dataset.type=it.type; img.dataset.uid=++uid; img.dataset.x=it.x; img.dataset.y=it.y; img.dataset.scale=it.scale;
      scene.appendChild(img); makeDraggable(img);
      img.addEventListener('load',()=>{setSize(img,it.scale);positionFromData(img);setDepth(img);},{once:true});
    }
  }catch{}
}

window.addEventListener('resize',()=>document.querySelectorAll('.placeable').forEach(el=>{setSize(el,+el.dataset.scale);positionFromData(el)}));

renderInventory();
restore();
