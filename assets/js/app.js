
(function(){
'use strict';
const KEY='fataatuTimurCMS_v1';
const seed={
  site:{name:'Desa Fataatu Timur',location:'Kec. Wewaria · Kab. Ende',email:'[ISI EMAIL RESMI DESA]',phone:'[ISI NOMOR TELEPON]'},
  stats:{penduduk:0,kk:0,dusun:0,aparatur:8},
  news:[
    {id:1,cat:'Pemerintahan',title:'Musyawarah Desa Penyusunan RKP Desa',date:'2026-08-01',summary:'Informasi kegiatan musyawarah dan penyusunan rencana kerja pemerintah desa.',body:'Detail kegiatan dapat diperbarui melalui Dashboard Admin.'},
    {id:2,cat:'Pertanian',title:'Penyaluran Bantuan Bibit Pertanian',date:'2026-07-20',summary:'Kegiatan dukungan bibit untuk meningkatkan produktivitas masyarakat.',body:'Detail kegiatan dapat diperbarui melalui Dashboard Admin.'},
    {id:3,cat:'Kesehatan',title:'Kegiatan Posyandu Balita Bulanan',date:'2026-07-10',summary:'Pelayanan kesehatan ibu dan anak di wilayah desa.',body:'Detail kegiatan dapat diperbarui melalui Dashboard Admin.'}
  ],
  agenda:[
    {id:1,title:'Musyawarah Desa',date:'2026-09-05',time:'09:00',place:'Balai Desa',desc:'Agenda musyawarah desa.'},
    {id:2,title:'Posyandu Bulanan',date:'2026-09-10',time:'08:00',place:'Posyandu Desa',desc:'Pelayanan kesehatan ibu dan anak.'}
  ],
  gallery:[]
};
function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch(e){return structuredClone(seed)}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
window.DesaCMS={load,save,seed,reset(){save(structuredClone(seed));location.reload()}};

function escape(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function fmtDate(v){if(!v)return '';try{return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(v+'T00:00:00'))}catch(e){return v}}
function toast(msg,type='success'){
 let t=document.querySelector('.toast-desa'); if(t)t.remove();
 t=document.createElement('div');t.className='toast-desa alert alert-'+(type==='error'?'danger':'success')+' shadow-lg';t.innerHTML='<i class="bi '+(type==='error'?'bi-exclamation-circle':'bi-check-circle')+' me-2"></i>'+escape(msg);
 document.body.appendChild(t);setTimeout(()=>t.remove(),3200);
}
window.DesaToast=toast;

function enhance(){
 document.body.classList.add('page-loading');setTimeout(()=>document.body.classList.remove('page-loading'),280);
 const progress=document.createElement('div');progress.id='scrollProgress';document.body.prepend(progress);
 const nav=document.querySelector('.navbar-desa');
 const update=()=>{if(nav)nav.classList.toggle('nav-scrolled',scrollY>10);progress.style.width=(scrollY/(document.documentElement.scrollHeight-innerHeight)*100)+'%'}
 addEventListener('scroll',update,{passive:true});update();

 document.querySelectorAll('section,.card-desa,.stat-card,.page-hero').forEach((el,i)=>{el.classList.add('reveal');el.style.transitionDelay=Math.min(i*35,240)+'ms'});
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.08});
 document.querySelectorAll('.reveal').forEach(e=>io.observe(e));

 document.querySelectorAll('[data-counter]').forEach(el=>{
   const target=parseInt(el.dataset.counter||'0',10);let done=false;
   const cio=new IntersectionObserver(es=>{if(es[0].isIntersecting&&!done){done=true;let start=0,steps=45;const tick=()=>{start+=Math.max(1,Math.ceil(target/steps));el.textContent=start>=target?target.toLocaleString('id-ID'):start.toLocaleString('id-ID');if(start<target)requestAnimationFrame(tick)};tick();cio.disconnect()}});
   cio.observe(el);
 });
}
function renderNews(){
 const d=load(),grid=document.getElementById('newsGrid');if(!grid)return;
 const q=(document.getElementById('newsSearch')?.value||'').toLowerCase(),cat=document.getElementById('newsFilter')?.value||'';
 const rows=d.news.filter(n=>(!q||(n.title+' '+n.summary+' '+n.cat).toLowerCase().includes(q))&&(!cat||n.cat===cat));
 grid.innerHTML=rows.length?rows.map(n=>`<div class="col-md-6 col-lg-4 news-card" data-category="${escape(n.cat)}"><article class="card-desa h-100 p-3"><span class="badge text-bg-light mb-2">${escape(n.cat)}</span><div class="small text-muted mb-2">${fmtDate(n.date)}</div><h3 class="h5">${escape(n.title)}</h3><p class="small text-muted">${escape(n.summary)}</p><button class="btn btn-brand-outline btn-sm" data-read="${n.id}">Baca Selengkapnya <i class="bi bi-arrow-right"></i></button></article></div>`).join(''):'<div class="col-12"><div class="empty-state"><i class="bi bi-newspaper fs-1 d-block mb-2"></i>Tidak ada berita yang cocok.</div></div>';
 grid.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>{const n=d.news.find(x=>x.id==b.dataset.read);if(!n)return;const modal=document.getElementById('newsModal');if(modal){modal.querySelector('#newsTitle').textContent=n.title;modal.querySelector('#newsBody').innerHTML='<div class="small text-muted mb-3">'+fmtDate(n.date)+' · '+escape(n.cat)+'</div><p>'+escape(n.body).replace(/\n/g,'</p><p>')+'</p>';bootstrap.Modal.getOrCreateInstance(modal).show()}});
}
function syncNews(){
 const grid=document.getElementById('newsGrid');if(!grid)return;
 const d=load();const cats=[...new Set(d.news.map(n=>n.cat))];const f=document.getElementById('newsFilter');
 if(f&&f.options.length<=1)cats.forEach(c=>f.insertAdjacentHTML('beforeend',`<option value="${escape(c)}">${escape(c)}</option>`));
 document.getElementById('newsSearch')?.addEventListener('input',renderNews);f?.addEventListener('change',renderNews);renderNews();
}
function syncHome(){
 const d=load();
 document.querySelectorAll('[data-cms-stat]').forEach(el=>{el.dataset.counter=d.stats[el.dataset.cmsStat]??0;el.textContent='0'});
 const homeGrid=document.querySelector('[data-home-news]');
 if(homeGrid){homeGrid.innerHTML=d.news.slice(0,3).map(n=>`<div class="col-md-4"><article class="card-desa p-3 h-100"><span class="badge text-bg-light mb-2">${escape(n.cat)}</span><div class="small text-muted mb-2">${fmtDate(n.date)}</div><h3 class="h5">${escape(n.title)}</h3><p class="small text-muted">${escape(n.summary)}</p><a href="berita.html" class="btn btn-brand-outline btn-sm">Baca Selengkapnya</a></article></div>`).join('')}
}
document.addEventListener('DOMContentLoaded',()=>{enhance();syncHome();syncNews()});
})();
