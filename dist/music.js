const audio=document.querySelector('#background-audio');
const toggle=document.querySelector('#music-toggle');
const volume=document.querySelector('#music-volume');
const controls=document.querySelector('.music-controls');
const status=document.querySelector('#music-status');
const welcome=document.querySelector('#welcome-screen');
const enter=document.querySelector('#enter-world');
const welcomeCopy={
 de:{title:'Willkommen in<br><em>meiner Welt.</em>',description:'Linux. Netzwerke. Systemintegration.',enter:'Meine Welt betreten',sound:'Ein Portfolio mit Musik. Jederzeit pausierbar.'},
 en:{title:'Welcome to<br><em>my world.</em>',description:'Linux. Networks. System integration.',enter:'Enter my world',sound:'A portfolio with music. Pause it anytime.'}
};
let entered=false;
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
 const w=welcomeCopy[document.documentElement.lang]||welcomeCopy.de;
 document.querySelector('#welcome-title').innerHTML=w.title;
 document.querySelector('#welcome-description').textContent=w.description;
 enter.innerHTML=w.enter+' <span aria-hidden="true">&#8599;</span>';
 document.querySelector('#welcome-sound').textContent=w.sound;
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
 if(document.hidden||!entered)return;
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
enter.addEventListener('click',()=>{
 entered=true;
 wanted=true;
 // Call play synchronously inside this click to retain browser user activation.
 play();
 welcome.close();
 document.querySelector('#story').focus({preventScroll:true});
});
welcome.addEventListener('cancel',event=>event.preventDefault());
document.addEventListener('worldlanguage',labels);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){resumeOnVisible=wanted&&!audio.paused;attempt++;audio.pause();}
 else if(resumeOnVisible&&wanted){resumeOnVisible=false;play();}
});
window.addEventListener('pagehide',()=>{attempt++;audio.pause();});
labels();
setState('paused');
welcome.showModal();
