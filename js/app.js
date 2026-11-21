import { CONFIG } from 'winter/config';
import { WinterAudio } from 'winter/audio';
import { WinterLandscape,random,glow } from 'winter/landscape';
import { Fireworks } from 'winter/fireworks';

const $=s=>document.querySelector(s),root=$('#night'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
await Promise.allSettled([document.fonts.load('36px WinterTitle'),document.fonts.load('16px WinterLetter')]);
const audio=new WinterAudio(CONFIG.music),landscape=new WinterLandscape($('#landscape'));
const fireworks=new Fireworks($('#fireworks'),landscape,(kind,power,silent)=>{if(!silent)audio.effect(kind,power);});
const weather=$('#weather'),c=weather.getContext('2d'),touch=$('#sky-touch');
const rng=random(291),snow=[],pointer={x:0,y:0},smooth={x:0,y:0};
let w=0,h=0,dpr=1,frameId=0,lastFrame=0,elapsed=0,ready=false,holding=null,captionTimer=0,focusBeforeNote=null,firstGesture=false;
let lastInteraction=-10,actualFrames=0,lastFpsSample=0,fps=0,staticPaint=true;

function resize(){
  w=root.clientWidth;h=root.clientHeight;dpr=Math.min(devicePixelRatio||1,CONFIG.maximumPixelRatio);
  landscape.resize(w,h,dpr);fireworks.resize(w,h,dpr);weather.width=Math.round(w*dpr);weather.height=Math.round(h*dpr);c.setTransform(dpr,0,0,dpr,0,0);
  const count=Math.round(Math.min(230,Math.max(90,w*h/6500)));snow.length=0;
  for(let i=0;i<count;i++)snow.push({x:rng()*w,y:rng()*h,z:rng(),phase:rng()*Math.PI*2,drift:rng()});
  for(const [name,id] of [['lamp','lamp-toggle'],['note','note-open']]){$('#'+id).style.left=landscape.anchors[name].x+'px';$('#'+id).style.top=landscape.anchors[name].y+'px';}
  fireworks.reduced=reduced.matches;staticPaint=true;
}
function say(text,duration=6500){clearTimeout(captionTimer);$('#caption').textContent=text;$('#status').textContent=text;if(duration)captionTimer=setTimeout(()=>{$('#caption').textContent='雪慢慢落，我们慢慢看。';},duration);}
function awaken(){
  audio.unlock().catch(()=>{});
  if(!firstGesture){firstGesture=true;if(!audio.wantsMusic)audio.play();$('#launch-label').textContent='再放一场';}
}
function fire(x,y,power=1){awaken();fireworks.time=elapsed;const target=fireworks.safeTarget(x,y);if(fireworks.launch(target.x,target.y,power)){lastInteraction=elapsed;say(power>1.35?'这一朵，攒得久一点，也亮得久一点。':['你点的这片天空，亮了。','这一朵，是香槟色的。','雪还在下，烟花刚好。','再看一朵，就一朵。'][fireworks.count%4]);staticPaint=true;}}

touch.addEventListener('pointerdown',event=>{
  if(holding||event.button>0)return;event.preventDefault();audio.unlock().catch(()=>{});
  holding={id:event.pointerId,x:event.clientX,y:event.clientY,start:performance.now()};touch.setPointerCapture(event.pointerId);
});
touch.addEventListener('pointermove',event=>{
  pointer.x=(event.clientX/w-.5);pointer.y=(event.clientY/h-.5);
  if(holding&&holding.id===event.pointerId){holding.x=event.clientX;holding.y=event.clientY;}
});
touch.addEventListener('pointerup',event=>{
  if(!holding||holding.id!==event.pointerId)return;
  const press=holding;holding=null;fireworks.charge=null;
  const duration=(performance.now()-press.start)/1000;fire(event.clientX,event.clientY,1+Math.min(1,duration/1.6)*.8);
});
touch.addEventListener('pointercancel',()=>{holding=null;fireworks.charge=null;staticPaint=true;});touch.addEventListener('lostpointercapture',()=>{if(holding){holding=null;fireworks.charge=null;}});
touch.addEventListener('pointerleave',()=>{if(!holding){pointer.x=pointer.y=0;}});
touch.addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();if(!event.repeat)fire(w*(.48+Math.random()*.25),h*(.26+Math.random()*.13),1.15);}});
$('#launch').addEventListener('click',()=>{awaken();fireworks.time=elapsed;fireworks.show();lastInteraction=elapsed;say('这一小场烟花，慢慢看。',12000);$('#launch-label').textContent='再放一场';staticPaint=true;});
$('#music-toggle').addEventListener('click',()=>{audio.unlock().catch(()=>{});audio.toggle();firstGesture=true;});
$('#sound-toggle').addEventListener('click',()=>{audio.unlock().catch(()=>{});audio.setMuted(!audio.muted);});
$('#lamp-toggle').addEventListener('click',()=>{landscape.setLamp(!landscape.lampLit);$('#lamp-toggle').setAttribute('aria-pressed',String(landscape.lampLit));$('#lamp-toggle').setAttribute('aria-label',landscape.lampLit?'调暗湖岸的路灯':'把湖岸的路灯调亮');audio.effect('switch');say(landscape.lampLit?'给雪地，留一盏暖灯。':'灯暗一点，烟花就更清楚了。');staticPaint=true;});
const note=$('#note-dialog');
$('#note-open').addEventListener('click',()=>{focusBeforeNote=document.activeElement;audio.effect('paper');note.showModal();});
note.addEventListener('close',()=>focusBeforeNote?.focus({preventScroll:true}));
note.addEventListener('click',event=>{if(event.target===note){const r=note.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)note.close();}});
audio.addEventListener('statechange',({detail:{status,muted,wantsMusic}})=>{
  document.body.classList.toggle('is-playing',status==='playing');document.body.classList.toggle('is-loading',status==='loading');document.body.classList.toggle('is-muted',muted);
  $('#music-toggle').setAttribute('aria-pressed',String(wantsMusic));$('#music-toggle').setAttribute('aria-label',wantsMusic?'暂停音乐':'播放冯提莫的 What Are Words');
  $('#sound-toggle').setAttribute('aria-pressed',String(muted));$('#sound-toggle').setAttribute('aria-label',muted?'打开声音':'关闭声音');
  $('#music-label').textContent=status==='loading'?'歌在路上…':status==='playing'?'What Are Words':status==='error'?'再试一次':'听首歌';
  $('#music-status').textContent=status==='loading'?'歌在路上，烟花可以先放。':status==='error'?'音乐暂时未加载，点右上角重试。':status==='paused'?'音乐歇一会儿，烟花继续。':'What Are Words · 冯提莫';
  if(status==='playing')say('歌慢慢响起来了。',5000);
  staticPaint=true;
});
function snowflake(p){
  const radius=.45+p.z*p.z*2.3;c.globalAlpha=.18+p.z*.45;c.fillStyle=p.z>.85?'#dae8f3':'#c4d5e8';
  if(p.z>.85){const sx=p.x,sy=p.y;c.save();c.translate(sx,sy);c.rotate(p.phase+elapsed*.11);c.beginPath();for(let i=0;i<3;i++){const angle=i*Math.PI/3,x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;c.moveTo(-x,-y);c.lineTo(x,y);}c.lineWidth=.6;c.strokeStyle='#dbe9f2';c.stroke();c.restore();}else{c.beginPath();c.arc(p.x,p.y,radius,0,Math.PI*2);c.fill();}
  c.globalAlpha=1;
}
function drawWeather(dt){
  c.clearRect(0,0,w,h);
  if(!reduced.matches){
    // Chimney smoke is a quiet moving veil, not another particle effect competing with the sky.
    const source=landscape.chimney;
    for(let i=0;i<7;i++){const t=((elapsed*.13+i/7)%1),x=source.x+Math.sin(t*4)*8+t*15,y=source.y-t*h*.08;c.save();c.translate(x,y);c.scale(1,.65);glow(c,0,0,(4+t*13),'133,151,172',Math.sin(t*Math.PI)*.045);c.restore();}
  }
  landscape.drawForeground(c,fireworks.light);
  if(!reduced.matches){for(const p of snow){p.y+=dt*(8+p.z*p.z*27);p.x+=dt*(3+p.drift*6+Math.sin(elapsed*.2+p.phase)*4);if(p.y>h+8){p.y=-8;p.x=rng()*w;}if(p.x>w+10)p.x=-10;snowflake(p);}}
  else{for(let i=0;i<snow.length;i+=4)snowflake(snow[i]);}
}
const startedAt=performance.now();let openingStarted=false;
function frame(now){
  frameId=0;if(document.hidden)return;frameId=requestAnimationFrame(frame);
  if(now-lastFrame<1000/CONFIG.maximumFps-.4)return;
  const dt=Math.min(.04,(now-lastFrame)/1000||.016);lastFrame=now;elapsed+=dt;
  actualFrames++;if(now-lastFpsSample>=1000){fps=actualFrames*1000/(now-lastFpsSample);actualFrames=0;lastFpsSample=now;}
  if(reduced.matches&&!staticPaint&&!holding)return;
  if(holding&&!reduced.matches){const amount=Math.min(1,(now-holding.start)/1600);fireworks.setCharge(holding.x,holding.y,amount);}
  fireworks.update(dt,elapsed);fireworks.draw();drawWeather(dt);staticPaint=false;
  if(!ready){ready=true;requestAnimationFrame(()=>document.body.classList.add('is-ready'));}
  if(!openingStarted&&!reduced.matches&&now-startedAt>1550){openingStarted=true;fireworks.launch(w*(w/h<.8?.64:.64),h*(w/h<.8?.44:.34),1.1,{color:0,type:'willow',silent:true});}
  if(!reduced.matches&&firstGesture&&elapsed-lastInteraction>25&&!note.open&&fireworks.sparks.length<50){fireworks.launch(w*(.4+Math.random()*.4),h*(.25+Math.random()*.18),.7,{color:fireworks.count%3,type:'peony',silent:true});lastInteraction=elapsed;}
}
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(root);
reduced.addEventListener('change',()=>{fireworks.reduced=reduced.matches;fireworks.scheduled.length=0;fireworks.rockets.length=0;fireworks.sparks.length=0;fireworks.c.clearRect(0,0,w,h);holding=null;fireworks.charge=null;staticPaint=true;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;holding=null;fireworks.charge=null;}else{lastFrame=performance.now();staticPaint=true;if(!frameId)frameId=requestAnimationFrame(frame);}});
resize();lastFrame=performance.now();lastFpsSample=lastFrame;frameId=requestAnimationFrame(frame);
if(new URLSearchParams(location.search).has('debug'))window.winter={audio,landscape,fireworks,snapshot:()=>({ready,width:w,height:h,dpr,reducedMotion:reduced.matches,time:elapsed,fps,maximumFps:CONFIG.maximumFps,fireworks:fireworks.snapshot(),music:audio.snapshot(),lampLit:landscape.lampLit,noteOpen:note.open})};
