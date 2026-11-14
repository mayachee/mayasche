import * as THREE from './vendor/three.module.js';

const canvas=document.querySelector('#workspace');
const figure=canvas.closest('figure');
const status=document.querySelector('#scene-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch(error){status.textContent='Explore the projects below. The illustration is shown without live 3D.';canvas.hidden=true;document.querySelectorAll('.scene-controls button').forEach(button=>button.disabled=true);}
if(renderer) start();

function start(){
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(33,1,.1,80);camera.position.set(7.2,5.7,10.8);camera.lookAt(0,1.1,0);
 scene.add(new THREE.HemisphereLight(0xbedfe8,0x101c2c,2.4));
 const key=new THREE.DirectionalLight(0xd8f7f4,4.2);key.position.set(-4,8,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.035;scene.add(key);
 const rim=new THREE.PointLight(0x62edc8,32,15);rim.position.set(3,3,-3);scene.add(rim);
 const blue=new THREE.PointLight(0x4d88d8,16,15);blue.position.set(-5,2,2);scene.add(blue);
 const world=new THREE.Group();world.rotation.y=-.16;scene.add(world);
 const metal=new THREE.MeshStandardMaterial({color:0x203442,metalness:.65,roughness:.36});
 const dark=new THREE.MeshStandardMaterial({color:0x10212c,metalness:.45,roughness:.44});
 const edge=new THREE.MeshStandardMaterial({color:0x355360,metalness:.72,roughness:.28});
 const light=new THREE.MeshStandardMaterial({color:0x95f4da,emissive:0x56e6bf,emissiveIntensity:.7,metalness:.2,roughness:.25});
 const black=new THREE.MeshStandardMaterial({color:0x07131e,metalness:.2,roughness:.44});
 function box(w,h,d,material,x=0,y=0,z=0,parent=world){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function outline(mesh,color=0x577e8b,opacity=.3){const lines=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color,transparent:true,opacity}));mesh.add(lines);}
 const board=box(6.6,.16,4.25,metal,0,.03,.3);outline(board);
 box(6.2,.04,3.85,dark,0,.13,.3);
 const under=new THREE.Mesh(new THREE.PlaneGeometry(8,6),new THREE.ShadowMaterial({color:0x000000,opacity:.26}));under.rotation.x=-Math.PI/2;under.position.y=-.44;under.receiveShadow=true;scene.add(under);
 // Small corner details make the 3D workspace feel like an assembled object.
 for(const x of [-3.05,3.05])for(const z of [-1.58,2.15]){const screw=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.017,16),edge);screw.position.set(x,.14,z);world.add(screw);}
 const monitor=new THREE.Group();monitor.position.set(-.77,0,-.26);monitor.rotation.y=.04;world.add(monitor);
 box(1.4,.08,.8,edge,0,.23,.04,monitor);box(.17,1.12,.16,metal,0,.8,-.09,monitor);
 const frame=box(3.5,2.24,.17,edge,0,2.22,0,monitor);outline(frame,0x83c9c4,.4);
 box(3.34,2.08,.035,black,0,2.22,.103,monitor);
 const screenCanvas=document.createElement('canvas');screenCanvas.width=1152;screenCanvas.height=704;
 const ctx=screenCanvas.getContext('2d');const gradient=ctx.createLinearGradient(0,0,1152,704);gradient.addColorStop(0,'#112a37');gradient.addColorStop(1,'#06141f');ctx.fillStyle=gradient;ctx.fillRect(0,0,1152,704);
 ctx.strokeStyle='#25434e';ctx.lineWidth=2;ctx.strokeRect(22,22,1108,660);ctx.fillStyle='#7899a8';ctx.font='18px Consolas,monospace';ctx.fillText('MAYACHE / CONNECTED WORKSPACE',55,68);
 for(let i=0;i<3;i++){ctx.fillStyle=['#7aeac8','#5484a6','#375a6e'][i];ctx.beginPath();ctx.arc(1045+i*25,61,5,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle='#d1ece8';ctx.font='bold 44px Segoe UI,sans-serif';ctx.fillText('Build. Connect. Deploy.',57,151);
 const code=[['01','#4e6e80','  const idea = understand(problem);'],['02','#79d9bd','  const system = build(idea);'],['03','#8baed1','  connect(interface, services);'],['04','#75bea8','  deploy({ with: "care" });']];
 ctx.font='24px Consolas,monospace';code.forEach((row,i)=>{ctx.fillStyle='#365365';ctx.fillText(row[0],57,227+i*49);ctx.fillStyle=row[1];ctx.fillText(row[2],99,227+i*49);});
 ctx.strokeStyle='#22414e';ctx.beginPath();ctx.moveTo(56,439);ctx.lineTo(1092,439);ctx.stroke();
 const chips=[['INTERFACE','React / Next.js'],['SERVICES','Python / Django'],['DELIVERY','Docker / CI']];chips.forEach((v,i)=>{const x=57+i*350;ctx.fillStyle='#122c38';ctx.fillRect(x,473,319,133);ctx.strokeStyle='#2b5157';ctx.strokeRect(x,473,319,133);ctx.fillStyle='#60858f';ctx.font='15px Consolas,monospace';ctx.fillText(v[0],x+22,510);ctx.fillStyle='#9ac9c7';ctx.font='21px Segoe UI,sans-serif';ctx.fillText(v[1],x+22,551);});
 const texture=new THREE.CanvasTexture(screenCanvas);texture.colorSpace=THREE.SRGBColorSpace;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.26,1.99),new THREE.MeshBasicMaterial({map:texture}));screen.position.set(0,2.22,.124);monitor.add(screen);
 const power=new THREE.Mesh(new THREE.SphereGeometry(.022,12,12),light);power.position.set(1.47,1.16,.11);monitor.add(power);
 monitor.traverse(object=>{if(object.isMesh)object.userData.project='studio';});
 const keyboard=new THREE.Group();keyboard.position.set(-.8,.23,1.3);world.add(keyboard);box(2.65,.1,.94,metal,0,0,0,keyboard);outline(keyboard.children[0]);
 const keys=new THREE.InstancedMesh(new THREE.BoxGeometry(.155,.028,.13),edge,48);const dummy=new THREE.Object3D();let n=0;for(let row=0;row<4;row++)for(let col=0;col<12;col++){dummy.position.set(-1.08+col*.195,.069,-.29+row*.17);dummy.updateMatrix();keys.setMatrixAt(n++,dummy.matrix);}keyboard.add(keys);box(.9,.02,.1,edge,0,.07,.35,keyboard);
 const servers=new THREE.Group();servers.position.set(2.08,0,-.05);world.add(servers);
 for(let row=0;row<3;row++){const housing=box(1.02,.49,1.37,row===2?edge:metal,0,.47+row*.55,0,servers);outline(housing,0x6c9aa2,.35);box(.91,.35,.018,black,0,.47+row*.55,.696,servers);for(let i=0;i<4;i++)box(.075,.032,.022,edge,-.29+i*.14,.47+row*.55,.713,servers);const led=new THREE.Mesh(new THREE.SphereGeometry(.026,12,12),light);led.position.set(.36,.47+row*.55,.719);servers.add(led);}
 servers.traverse(object=>{if(object.isMesh)object.userData.project='airbcar';});
 const node=box(.74,.32,.65,dark,-2.56,.4,.55);outline(node);box(.4,.025,.2,edge,-2.56,.58,.55);for(let i=0;i<3;i++)box(.05,.025,.05,light,-2.75+i*.12,.4,.89);
 const routes=[];[[new THREE.Vector3(-2.2,.23,.55),new THREE.Vector3(-1.8,.23,.6),new THREE.Vector3(-1.6,.23,-.7),new THREE.Vector3(1.55,.23,-.7)],[new THREE.Vector3(-.5,.24,.3),new THREE.Vector3(.4,.24,.55),new THREE.Vector3(1.1,.24,1.55),new THREE.Vector3(2.08,.24,.75)]].forEach(points=>{const curve=new THREE.CatmullRomCurve3(points);const route=new THREE.Mesh(new THREE.TubeGeometry(curve,50,.012,6,false),new THREE.MeshBasicMaterial({color:0x377b74,transparent:true,opacity:.65}));world.add(route);const dot=new THREE.Mesh(new THREE.SphereGeometry(.032,12,12),light);world.add(dot);routes.push({curve,dot});});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,.012,8,110),new THREE.MeshBasicMaterial({color:0x3c6f75,transparent:true,opacity:.36}));ring.position.set(0,1.7,-1.4);ring.rotation.y=.15;ring.rotation.x=.13;world.add(ring);
 const stars=new Float32Array(32*3);let seed=17;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}for(let i=0;i<stars.length;i+=3){stars[i]=(random()-.5)*11;stars[i+1]=random()*5;stars[i+2]=-2-random()*3;}const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.BufferAttribute(stars,3));scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0x7099a1,size:.024,transparent:true,opacity:.5})));
 let rotation=-.16,targetRotation=rotation,paused=reduced.matches,visible=true,dragging=false,startX=0,startY=0,moved=0,frameId,previous=performance.now(),elapsed=0;
 const pointer=new THREE.Vector2();const raycaster=new THREE.Raycaster();
 function render(now=performance.now()){frameId=null;const delta=Math.min((now-previous)/1000,.05);previous=now;if(!paused)elapsed+=delta;rotation=THREE.MathUtils.lerp(rotation,targetRotation,.14);world.rotation.y=rotation;world.position.y=paused?0:Math.sin(elapsed*.65)*.055;routes.forEach((route,i)=>route.dot.position.copy(route.curve.getPointAt((elapsed*.075+i*.42)%1)));renderer.render(scene,camera);if(canvas.dataset.renderWidth!==canvas.dataset.targetWidth)canvas.dataset.renderWidth=canvas.dataset.targetWidth;if(visible&&!document.hidden&&(!paused||Math.abs(rotation-targetRotation)>.0002))frameId=requestAnimationFrame(render);}
 function requestRender(){if(!frameId&&!document.hidden){previous=performance.now();frameId=requestAnimationFrame(render);}}
 function resize(){const box=figure.getBoundingClientRect();canvas.dataset.targetWidth=String(Math.round(box.width));renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.updateProjectionMatrix();requestRender();}
 new ResizeObserver(resize).observe(figure);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestRender();else if(frameId){cancelAnimationFrame(frameId);frameId=null;}},{threshold:.05});observer.observe(figure);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frameId){cancelAnimationFrame(frameId);frameId=null;}else requestRender();});
 canvas.addEventListener('pointerdown',event=>{dragging=true;startX=event.clientX;startY=event.clientY;moved=0;canvas.setPointerCapture(event.pointerId);});
 canvas.addEventListener('pointermove',event=>{if(!dragging)return;const dx=event.clientX-startX;moved+=Math.abs(dx)+Math.abs(event.clientY-startY);targetRotation+=dx*.008;startX=event.clientX;startY=event.clientY;requestRender();});
 canvas.addEventListener('pointerup',event=>{if(!dragging)return;dragging=false;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);if(moved>7)return;const bounds=canvas.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects([monitor,servers],true).find(item=>item.object.userData.project);if(hit)document.dispatchEvent(new CustomEvent('projectselect',{detail:hit.object.userData.project}));});
 canvas.addEventListener('pointercancel',()=>{dragging=false;});
 function rotate(amount){targetRotation+=amount;requestRender();}
 document.querySelector('#rotate-left').addEventListener('click',()=>rotate(-.3));document.querySelector('#rotate-right').addEventListener('click',()=>rotate(.3));document.querySelector('#reset-scene').addEventListener('click',()=>{targetRotation=-.16;requestRender();});
 canvas.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();rotate(event.key==='ArrowLeft'?-.3:.3);}});
 const pause=document.querySelector('#pause-scene');function showPause(){pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume 3D motion':'Pause 3D motion');pause.textContent=paused?'▷':'Ⅱ';}showPause();pause.addEventListener('click',()=>{paused=!paused;showPause();requestRender();});
 reduced.addEventListener('change',event=>{paused=event.matches;showPause();requestRender();});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(frameId)cancelAnimationFrame(frameId);figure.classList.remove('scene-ready');status.textContent='3D paused by this device. The projects below remain available.';});
 canvas.addEventListener('webglcontextrestored',()=>{figure.classList.add('scene-ready');requestRender();});
 resize();renderer.render(scene,camera);figure.classList.add('scene-ready');canvas.dataset.ready='true';status.textContent='Drag to rotate · Select an object to explore';requestRender();
}
