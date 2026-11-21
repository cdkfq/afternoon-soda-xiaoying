import * as THREE from 'three';
import { CONFIG } from 'soda/config';
import { makeMaterials } from 'soda/art';
import { createWorld } from 'soda/world';
import { createObjects } from 'soda/objects';
import { AfternoonAudio } from 'soda/audio';

const $=selector=>document.querySelector(selector);
const canvas=$('#scene'),container=$('#experience'),caption=$('#caption');
const audio=new AfternoonAudio(CONFIG.music);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
await Promise.allSettled([document.fonts.load('40px AfternoonDisplay'),document.fonts.load('18px AfternoonLetter')]);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,CONFIG.maximumPixelRatio));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.03;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const scene=new THREE.Scene();scene.background=new THREE.Color('#dce4cc');
const camera=new THREE.PerspectiveCamera(30,1,.1,110);
const materials=makeMaterials(renderer);scene.environment=materials.env;scene.environmentIntensity=.35;
scene.add(new THREE.HemisphereLight('#f5fbf5','#9da896',1.8));
const sunlight=new THREE.DirectionalLight('#fff9eb',2.5);sunlight.position.set(-3,8,4.5);sunlight.target.position.set(.3,1.4,-.4);
sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);sunlight.shadow.camera.left=-6;sunlight.shadow.camera.right=6;sunlight.shadow.camera.top=6;sunlight.shadow.camera.bottom=-5;sunlight.shadow.camera.near=.5;sunlight.shadow.camera.far=25;sunlight.shadow.normalBias=.03;sunlight.shadow.bias=-.00025;sunlight.shadow.radius=3;
scene.add(sunlight,sunlight.target);
const fill=new THREE.DirectionalLight('#d6ead9',.8);fill.position.set(5,5,-1);scene.add(fill);
const world=createWorld(scene,materials),objects=createObjects(scene,materials);
const intro=$('.intro'),objectUI=$('.objects'),hits=[...document.querySelectorAll('[data-object]')];
const dialog=$('#note-dialog'),musicButton=$('#music-toggle'),soundButton=$('#sound-toggle');
const pointer=new THREE.Vector2(),smoothPointer=new THREE.Vector2(),point=new THREE.Vector3();
const target=new THREE.Vector3(),home=new THREE.Vector3();
let width=0,height=0,narrow=false,elapsed=0,lastFrame=0,frameId=0,ready=false;
let captionTimer=0,interactions=0,drag=null,dragged=false,savedFocus=null;
let staticTime=0,needsRender=true,shadowUntil=0;

function resize(){
  width=container.clientWidth;height=container.clientHeight;narrow=width<650;
  renderer.setSize(width,height,false);
  const aspect=width/height;
  // Portrait keeps the counter intact and leaves a quiet patch of sky for the letter.
  const viewHeight=narrow?Math.max(7.65,4.5/aspect):Math.min(9.4,Math.max(6.9,10.2/aspect));
  home.set(narrow?.12:.3,narrow?6.25:6.3,narrow?13.5:13.3);target.set(0,narrow?3.1:2.8,-.65);
  camera.aspect=aspect;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(viewHeight/(2*home.distanceTo(target))));
  objects.responsive(narrow);world.responsive?.(narrow);
  document.body.classList.toggle('is-portrait',aspect<1);
  objects.chime.root.position.x=narrow?1.79:2.65;
  camera.position.copy(home);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  updateHits();
  needsRender=true;
  renderer.shadowMap.needsUpdate=true;
}
function updateHits(){
  camera.updateMatrixWorld();
  for(const hit of hits){
    objects.anchors[hit.dataset.object].getWorldPosition(point);point.project(camera);
    const x=(point.x*.5+.5)*width,y=(-point.y*.5+.5)*height;
    hit.style.left=`${x}px`;hit.style.top=`${y}px`;
    hit.hidden=point.z<-1||point.z>1||x<22||x>width-22||y<22||y>height-22;
  }
}
function say(text,restoreAfter=6000){
  clearTimeout(captionTimer);caption.textContent=text;$('#status').textContent=text;
  if(restoreAfter)captionTimer=setTimeout(()=>{caption.textContent=audio.status==='playing'?'有风，有歌，刚好有你来坐坐。':'风是轻的，汽水是冰的。';},restoreAfter);
}
function familiar(){if(++interactions>=3)objectUI.classList.add('is-familiar');}
function action(name){
  if(dragged)return;
  familiar();
  staticTime=elapsed+1.7;needsRender=true;shadowUntil=elapsed+3;
  if(name==='bottle'){
    objects.bottle.pop(elapsed);audio.effect('pop');
    say(objects.bottle.opened?'噗——把今天拧松一点。':'汽水刚刚好。');
    $('[data-object="bottle"]').setAttribute('aria-label','轻轻碰一下冰汽水');
    if(!audio.wantsMusic)audio.play();
  }else if(name==='chime'){
    objects.chime.ring(elapsed);audio.effect('chime');say('风替你，轻轻敲了一声。');
  }else if(name==='cat'){
    objects.cat.pet(elapsed);audio.effect('cat');say('它醒了一下，又放心地眯起眼。');
  }else if(name==='note'){
    audio.effect('paper');savedFocus=document.activeElement;dialog.showModal();
  }else if(name==='radio'){audio.effect('ice');audio.toggle();}
}
for(const hit of hits)hit.addEventListener('click',()=>action(hit.dataset.object));
$('#begin').addEventListener('click',()=>action('bottle'));
musicButton.addEventListener('click',()=>{audio.unlock().catch(()=>{});audio.toggle();});
soundButton.addEventListener('click',()=>{audio.unlock().catch(()=>{});audio.setMuted(!audio.muted);});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>savedFocus?.focus({preventScroll:true}));
audio.addEventListener('statechange',({detail})=>{
  const {status,muted,wantsMusic}=detail;
  document.body.classList.toggle('is-playing',status==='playing');document.body.classList.toggle('is-loading',status==='loading');document.body.classList.toggle('is-muted',muted);
  objects.radio.playing=status==='playing'&&!muted;
  needsRender=true;
  const label=status==='playing'?'What Are Words':status==='loading'?'歌在路上…':status==='error'?'再听一次':'听首歌';
  $('#music-label').textContent=label;musicButton.setAttribute('aria-pressed',String(wantsMusic));
  musicButton.setAttribute('aria-label',status==='loading'?'取消音乐播放':status==='playing'?'暂停音乐':'播放冯提莫的 What Are Words');
  soundButton.setAttribute('aria-pressed',String(muted));soundButton.setAttribute('aria-label',muted?'打开声音':'关闭声音');
  if(status==='loading')say('歌在路上，先听一声风铃。',0);
  else if(status==='playing')say('这首歌，慢慢听。',8000);
  else if(status==='error')say('歌暂时没接上，点收音机再试一次。',0);
  else if(status==='paused')say('歌先歇一会儿，风还在。');
});
canvas.addEventListener('pointerdown',event=>{
  drag={x:event.clientX,y:event.clientY,id:event.pointerId};dragged=false;canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{
  if(reduced.matches)return;
  if(drag){
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>8)dragged=true;
    pointer.set(THREE.MathUtils.clamp(dx/width*3,-1,1),THREE.MathUtils.clamp(dy/height*2,-1,1));
    if(dragged)objects.bottle.nudge(-dx/width*.13);
  }else if(event.pointerType==='mouse')pointer.set((event.clientX/width-.5)*.75,(event.clientY/height-.5)*.45);
});
function endDrag(){if(dragged)audio.effect('ice');drag=null;pointer.multiplyScalar(.3);setTimeout(()=>{dragged=false;},0);}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',()=>{drag=null;pointer.set(0,0);});canvas.addEventListener('pointerleave',()=>{if(!drag)pointer.set(0,0);});
// Raycasting makes the whole object respond, while the native buttons remain keyboard accessible.
const raycaster=new THREE.Raycaster();
canvas.addEventListener('click',event=>{
  if(dragged)return;
  const ndc=new THREE.Vector2(event.clientX/width*2-1,1-event.clientY/height*2);raycaster.setFromCamera(ndc,camera);
  const candidates={bottle:objects.bottle.root,chime:objects.chime.root,cat:objects.cat.root,note:objects.note,radio:objects.radio.root};
  const intersections=raycaster.intersectObjects(Object.values(candidates),true);
  if(!intersections.length)return;let node=intersections[0].object;
  while(node){const name=Object.keys(candidates).find(key=>candidates[key]===node);if(name){action(name);break;}node=node.parent;}
});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();$('#fallback-scene').hidden=false;say('午后先停在这一帧，刷新可以继续走走。',0);});
const startedAt=performance.now();
function frame(now){
  frameId=0;if(document.hidden)return;
  frameId=requestAnimationFrame(frame);
  if(now-lastFrame<1000/CONFIG.maximumFps-.5)return;
  const dt=Math.min(.05,(now-lastFrame)/1000||.016);lastFrame=now;elapsed+=dt;
  smoothPointer.lerp(pointer,1-Math.exp(-dt*3));
  const entrance=reduced.matches?1:THREE.MathUtils.smoothstep((now-startedAt)/1000,0,2.8);
  camera.position.copy(home);camera.position.x+=smoothPointer.x*.24;camera.position.y-=smoothPointer.y*.12;
  camera.zoom=1-(1-entrance)*.045;camera.updateProjectionMatrix();
  camera.lookAt(target.x+smoothPointer.x*.1,target.y-(1-entrance)*.16,target.z);
  if(reduced.matches&&!needsRender&&ready)return;
  if(!reduced.matches){world.update(elapsed);objects.update(elapsed);}else{world.update(0);objects.update(staticTime);}
  if(elapsed<shadowUntil)renderer.shadowMap.needsUpdate=true;
  renderer.render(scene,camera);updateHits();
  needsRender=false;
  if(!ready){ready=true;requestAnimationFrame(()=>document.body.classList.add('is-ready'));}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else{lastFrame=performance.now();if(!frameId)frameId=requestAnimationFrame(frame);if(audio.context?.state==='suspended'&&audio.wantsMusic)audio.unlock().catch(()=>{});}});
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(container);
reduced.addEventListener('change',()=>{pointer.set(0,0);smoothPointer.set(0,0);needsRender=true;});
resize();frameId=requestAnimationFrame(frame);
if(new URLSearchParams(location.search).has('debug')){
  window.afternoon={audio,objects,camera,scene,renderer,world,snapshot:()=>({ready,narrow,width,height,time:elapsed,reducedMotion:reduced.matches,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,music:audio.snapshot(),bottleOpened:objects.bottle.opened,dialogOpen:dialog.open,maximumFps:CONFIG.maximumFps})};
}
