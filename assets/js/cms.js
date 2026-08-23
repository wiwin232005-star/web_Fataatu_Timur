
(function(){
'use strict';
const KEY='fataatuTimurCMS_v2';
const seed={
 site:{name:'Desa Fataatu Timur',location:'Kec. Wewaria · Kab. Ende',email:'[ISI EMAIL RESMI DESA]',phone:'[ISI NOMOR TELEPON]',address:'[ISI ALAMAT DESA]'},
 stats:{penduduk:0,kk:0,dusun:0,aparatur:8},
 news:[], agenda:[], gallery:[], potentials:[], services:[], faqs:[],
 transparansi:{apbdes:'[ISI DATA APBDES]',documents:[]}
};
function clone(x){return JSON.parse(JSON.stringify(x))}
function get(){try{let d=JSON.parse(localStorage.getItem(KEY)); if(!d)return clone(seed); return Object.assign(clone(seed),d)}catch(e){return clone(seed)}}
function set(d){localStorage.setItem(KEY,JSON.stringify(d)); window.dispatchEvent(new CustomEvent('desaCMSChanged',{detail:d}))}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function uid(){return Date.now()+Math.floor(Math.random()*999)}
function date(v){if(!v)return '';try{return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(v+'T00:00:00'))}catch(e){return v}}
function toast(msg,type='success'){let x=document.querySelector('.cms-toast');if(x)x.remove();x=document.createElement('div');x.className='cms-toast alert alert-'+(type==='error'?'danger':'success')+' shadow';x.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;min-width:280px';x.innerHTML='<i class="bi '+(type==='error'?'bi-exclamation-circle':'bi-check-circle')+' me-2"></i>'+esc(msg);document.body.appendChild(x);setTimeout(()=>x.remove(),3000)}
window.CMS={get,set,seed,clone,uid,esc,date,toast,reset(){set(clone(seed));location.reload()}};
})();
