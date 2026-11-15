const audio=document.querySelector('#background-audio');
const toggle=document.querySelector('#music-toggle');
const volume=document.querySelector('#music-volume');
const controls=document.querySelector('.music-controls');
const status=document.querySelector('#music-status');
const copy={
 de:{play:'Musik abspielen',pause:'Musik pausieren',label:'Musik',volume:'Musiklautstärke',blocked:'Zum Anhören auf Musik drücken.',playing:'Musik wird abgespielt.',paused:'Musik pausiert.',loading:'Musik wird geladen.',error:'Musik konnte nicht geladen werden.'},
 en:{play:'Play music',pause:'Pause music',label:'Music',volume:'Music volume',blocked:'Music starts with your first interaction on the page.',playing:'Music is playing.',paused:'Music paused.',loading:'Loading music.',error:'Music could not be loaded.'}
};
let state='loading',wanted=true,resumeOnVisible=false,attempt=0;
try{
 const saved=localStorage.getItem('portfolio-music-volume');
 if(saved!==null&&Number.isFinite(Number(saved)))volume.value=String(Math.max(0,Math.min(100,Number(saved))));
}catch{}
audio.volume=Number(volume.value)/100;
function labels(){
 const t=copy[document.documentElement.lang]||copy.de;
 const playing=state==='playing';
 toggle.setAttribute('aria-label',playing?t.pause:t.play);
 toggle.setAttribute('aria-pressed',String(playing));
 toggle.title=t[state]||t.paused;
 toggle.querySelector('.music-caption').textContent=t.label;
 toggle.querySelector('.music-icon').textContent=playing?'Ⅱ':'♫';
 volume.setAttribute('aria-label',t.volume);
 volume.title=t.volume;
 status.textContent=t[state]||t.paused;
 controls.dataset.musicState=state;
}
function setState(next){state=next;labels();}
async function play(){
 if(document.hidden)return;
 const current=++attempt;
 setState('loading');
 try{
  await audio.play();
 }catch(error){
  if(current!==attempt)return;
  setState(error.name==='NotAllowedError'?'blocked':error.name==='AbortError'?'paused':'error');
 }
}
audio.addEventListener('playing',()=>setState('playing'));
audio.addEventListener('pause',()=>{if(state!=='error')setState('paused');});
audio.addEventListener('error',()=>setState('error'));
audio.addEventListener('waiting',()=>setState('loading'));
toggle.addEventListener('click',()=>{
 if(!audio.paused){wanted=false;resumeOnVisible=false;attempt++;audio.pause();}
 else{wanted=true;play();}
});
volume.addEventListener('input',()=>{
 audio.volume=Number(volume.value)/100;
 try{localStorage.setItem('portfolio-music-volume',volume.value);}catch{}
});
// Retry inside a trusted gesture when the browser blocks audible autoplay.
function startOnInteraction(event){
 if(!event.isTrusted||event.target.closest?.('.music-controls')||!wanted||!audio.paused||state==='loading')return;
 play();
}
for(const event of ['click','pointerup','touchend','keydown']){
 document.addEventListener(event,startOnInteraction,{passive:true});
}
document.addEventListener('worldlanguage',labels);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){resumeOnVisible=wanted&&!audio.paused;attempt++;audio.pause();}
 else if(resumeOnVisible&&wanted){resumeOnVisible=false;play();}
});
window.addEventListener('pagehide',()=>{attempt++;audio.pause();});
labels();
play();
