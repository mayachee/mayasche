/* An original, locally synthesized ambient loop. No remote audio or autoplay. */
const toggle=document.querySelector('#music-toggle');
const volume=document.querySelector('#music-volume');
const player=document.querySelector('.music-controls');
const copy={de:{play:'Musik abspielen',pause:'Musik pausieren',label:'Musik',volume:'Musiklautstärke',error:'Audio nicht verfügbar'},en:{play:'Play music',pause:'Pause music',label:'Music',volume:'Music volume',error:'Audio unavailable'}};
let context,master,bus,timer,nextBeat=0,nextTime=0,playing=false,busy=false,failed=false,operation=0;
const beat=60/72;
const chords=[
 {bass:73.416,notes:[146.832,174.614,220,261.626,329.628]},
 {bass:58.270,notes:[116.541,146.832,174.614,220,261.626]},
 {bass:87.307,notes:[174.614,220,261.626,329.628,391.995]},
 {bass:65.406,notes:[130.813,164.814,195.998,293.665,329.628]}
];
try{const saved=localStorage.getItem('portfolio-music-volume');if(saved!==null&&Number.isFinite(Number(saved)))volume.value=String(Math.max(0,Math.min(100,Number(saved))));}catch{}
function labels(){const t=copy[document.documentElement.lang]||copy.de;toggle.setAttribute('aria-label',failed?t.error:playing?t.pause:t.play);toggle.setAttribute('aria-pressed',String(playing));toggle.querySelector('.music-caption').textContent=failed?t.error:t.label;toggle.querySelector('.music-icon').textContent=playing?'Ⅱ':'♫';volume.setAttribute('aria-label',t.volume);volume.title=t.volume;player.dataset.musicState=failed?'unavailable':playing?'playing':'paused';}
function voice(frequency,start,duration,level,type='sine',pan=0){const osc=context.createOscillator(),gain=context.createGain(),stereo=context.createStereoPanner();osc.type=type;osc.frequency.value=frequency;stereo.pan.value=pan;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level,start+Math.min(duration*.3,1.3));gain.gain.setValueAtTime(level,start+duration*.55);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain);gain.connect(stereo);stereo.connect(bus);osc.onended=()=>{osc.disconnect();gain.disconnect();stereo.disconnect();};osc.start(start);osc.stop(start+duration+.02);}
function schedule(){if(!playing||context.state!=='running')return;while(nextTime<context.currentTime+.25){const chord=chords[Math.floor(nextBeat/8)%chords.length],position=nextBeat%8;if(position===0){chord.notes.forEach((n,i)=>voice(n,nextTime,beat*9,.035,'sine',(i-2)*.2));voice(chord.bass,nextTime,beat*7,.06);}
 const pattern=[0,2,4,1,3,2,4,1];voice(chord.notes[pattern[position]]*2,nextTime,beat*1.9,.045,'sine',position%2?.32:-.32);nextBeat++;nextTime+=beat;}}
function stopTimer(){clearInterval(timer);timer=null;}
function init(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('unsupported');context=new Audio();master=context.createGain();master.gain.value=Number(volume.value)/100*.8;bus=context.createBiquadFilter();bus.type='lowpass';bus.frequency.value=1500;bus.Q.value=.3;const compressor=context.createDynamicsCompressor();compressor.threshold.value=-20;compressor.ratio.value=3;const delay=context.createDelay(2),feedback=context.createGain(),wet=context.createGain();delay.delayTime.value=beat*.75;feedback.gain.value=.24;wet.gain.value=.18;bus.connect(master);bus.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(master);master.connect(compressor);compressor.connect(context.destination);}
async function syncPlayback(){const id=++operation;stopTimer();if(!context)return;if(playing&&!document.hidden){await context.resume();if(id!==operation)return;if(context.state!=='running')throw Error('suspended');nextTime=Math.max(nextTime,context.currentTime+.04);schedule();timer=setInterval(schedule,100);}else if(context.state==='running'){await context.suspend();}}
toggle.addEventListener('click',async()=>{if(busy)return;busy=true;toggle.disabled=true;try{if(!context)init();playing=!playing;failed=false;await syncPlayback();}catch{playing=false;failed=true;stopTimer();if(context?.state==='running')await context.suspend().catch(()=>{});}finally{busy=false;toggle.disabled=false;labels();}});
volume.addEventListener('input',()=>{const value=Number(volume.value)/100*.8;if(master)master.gain.setTargetAtTime(value,context.currentTime,.06);try{localStorage.setItem('portfolio-music-volume',volume.value);}catch{}});
document.addEventListener('worldlanguage',labels);
document.addEventListener('visibilitychange',()=>{if(context)syncPlayback().catch(()=>{playing=false;failed=true;stopTimer();labels();});});
window.addEventListener('pagehide',()=>{playing=false;stopTimer();context?.close().catch(()=>{});labels();});
window.addEventListener('pageshow',()=>{if(context?.state==='closed'){context=null;master=null;bus=null;nextBeat=0;nextTime=0;}labels();});
labels();
