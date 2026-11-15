/* Official YouTube embed: no copied recording or hidden/background video. */
const videoId='WAoLJ8GbA4Y';
const toggle=document.querySelector('#music-toggle'),volume=document.querySelector('#music-volume'),controls=document.querySelector('.music-controls');
const panel=document.querySelector('#recording-panel'),hint=document.querySelector('#recording-status'),close=document.querySelector('#recording-close');
const copy={
 de:{play:'Musik abspielen',pause:'Musik pausieren',label:'Musik',volume:'Musiklautstärke',close:'Player schließen und Musik pausieren',loading:'Aufnahme wird geladen …',blocked:'Autoplay wurde blockiert. Zum Anhören auf Play drücken.',playing:'Wiedergabe: Wiener Philharmoniker · Gustavo Dudamel',paused:'Musik pausiert.',error:'Player nicht verfügbar. Die Aufnahme kann direkt auf YouTube geöffnet werden.',source:'Auf YouTube ansehen ↗'},
 en:{play:'Play music',pause:'Pause music',label:'Music',volume:'Music volume',close:'Close player and pause music',loading:'Loading the recording …',blocked:'Autoplay was blocked. Press Play to listen.',playing:'Playing: Vienna Philharmonic · Gustavo Dudamel',paused:'Music paused.',error:'Player unavailable. Open the recording directly on YouTube.',source:'Watch on YouTube ↗'}
};
let player,ready=false,state='loading',wanted=true,playing=false,hiddenPause=false,disposed=false;
try{const saved=localStorage.getItem('portfolio-music-volume');if(saved!==null&&Number.isFinite(Number(saved)))volume.value=String(Math.max(0,Math.min(100,Number(saved))));}catch{}
function labels(){const t=copy[document.documentElement.lang]||copy.de;toggle.setAttribute('aria-label',playing?t.pause:t.play);toggle.setAttribute('aria-pressed',String(playing));toggle.setAttribute('aria-expanded',String(!panel.hidden));toggle.querySelector('.music-caption').textContent=t.label;toggle.querySelector('.music-icon').textContent=playing?'Ⅱ':'♫';volume.setAttribute('aria-label',t.volume);volume.title=t.volume;close.setAttribute('aria-label',t.close);hint.textContent=t[state]||t.paused;document.querySelector('#recording-source').textContent=t.source;controls.dataset.musicState=state;}
function setState(next){state=next;playing=next==='playing';labels();}
function play(){if(!ready||panel.hidden||document.hidden)return;player.setVolume(Number(volume.value));player.unMute();player.playVideo();}
function fail(){wanted=false;ready=false;clearTimeout(timeout);setState('error');}
function createPlayer(){if(disposed||player)return;player=new window.YT.Player('recording-player',{
 width:'360',height:'203',videoId,host:'https://www.youtube-nocookie.com',
 playerVars:{autoplay:1,playsinline:1,controls:1,loop:1,playlist:videoId,origin:location.origin},
 events:{onReady:e=>{clearTimeout(timeout);ready=true;const iframe=e.target.getIframe();iframe.title='Barber: Adagio for Strings, Op. 11 — Vienna Philharmonic & Gustavo Dudamel (SNC 2019)';iframe.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');if(wanted&&!panel.hidden&&!document.hidden)play();else{e.target.pauseVideo();setState('paused');}},
 onStateChange:e=>{if(e.data===1){if(panel.hidden||document.hidden){player.pauseVideo();return;}wanted=true;setState('playing');}else if(e.data===2){setState('paused');}else if(e.data===0){setState('paused');}else if(e.data===3&&!playing){setState('loading');}},
 onAutoplayBlocked:()=>{setState('blocked');},onError:fail}
 });}
const timeout=setTimeout(fail,18000);
toggle.addEventListener('click',()=>{if(playing){wanted=false;player.pauseVideo();setState('paused');}else{panel.hidden=false;wanted=true;if(ready)play();else if(state==='error'){setState('error');}labels();}});
close.addEventListener('click',()=>{wanted=false;hiddenPause=false;if(ready)player.pauseVideo();panel.hidden=true;setState('paused');toggle.focus();});
volume.addEventListener('input',()=>{if(ready)player.setVolume(Number(volume.value));try{localStorage.setItem('portfolio-music-volume',volume.value);}catch{}});
document.addEventListener('worldlanguage',labels);
document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenPause=wanted&&playing;if(ready)player.pauseVideo();}else if(hiddenPause&&wanted&&!panel.hidden){hiddenPause=false;play();}});
new IntersectionObserver(entries=>{const visible=entries[0].intersectionRatio>=.5;if(!visible&&ready&&playing)player.pauseVideo();},{threshold:[0,.5,1]}).observe(panel);
new MutationObserver(()=>{if(document.querySelector('#project-dialog').open&&ready&&playing)player.pauseVideo();}).observe(document.querySelector('#project-dialog'),{attributes:true,attributeFilter:['open']});
window.addEventListener('pagehide',()=>{disposed=true;wanted=false;clearTimeout(timeout);if(ready)player.pauseVideo();});
window.addEventListener('pageshow',()=>{disposed=false;});
labels();
if(window.YT?.Player)createPlayer();else{window.onYouTubeIframeAPIReady=createPlayer;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=fail;document.head.append(script);}
