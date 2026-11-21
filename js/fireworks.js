import { CONFIG } from 'winter/config';
import { random,glow } from 'winter/landscape';

const TAU=Math.PI*2;
function sprite(color){const canvas=document.createElement('canvas');canvas.width=canvas.height=48;const c=canvas.getContext('2d'),g=c.createRadialGradient(24,24,0,24,24,24),rgb=color.join(',');g.addColorStop(0,'#fff9eb');g.addColorStop(.07,`rgba(${rgb},1)`);g.addColorStop(.2,`rgba(${rgb},.55)`);g.addColorStop(.48,`rgba(${rgb},.13)`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(0,0,48,48);return canvas;}

export class Fireworks{
  constructor(canvas,landscape,onSound){
    this.canvas=canvas;this.c=canvas.getContext('2d');this.landscape=landscape;this.onSound=onSound;
    this.rockets=[];this.sparks=[];this.halos=[];this.smoke=[];this.rings=[];this.scheduled=[];this.count=0;this.burstCount=0;
    this.rng=random(866);this.sprites=CONFIG.fireworkPalette.map(sprite);this.light={x:0,intensity:0,color:CONFIG.fireworkPalette[0]};
    this.charge=null;this.reduced=false;this.lastLaunched=-10;this.time=0;this.lastPower=0;
  }
  resize(w,h,dpr){this.w=w;this.h=h;this.dpr=dpr;this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);this.c.setTransform(dpr,0,0,dpr,0,0);this.rockets.length=0;this.sparks.length=0;this.halos.length=0;this.rings.length=0;this.smoke.length=0;this.scheduled.length=0;this.charge=null;}
  safeTarget(x,y){const w=this.w,h=this.h,narrow=w/h<.8;return{x:Math.max(w*(narrow?.16:.12),Math.min(w*.90,x)),y:Math.max(h*.15,Math.min(h*.55,y))};}
  launch(x,y,power=1,options={}){
    if(this.rockets.length>=5||this.sparks.length>CONFIG.maximumParticles-250)return false;
    const target=this.safeTarget(x,y),color=options.color??this.count%CONFIG.fireworkPalette.length;
    const type=options.type??(power>1.35?'willow':['willow','peony','ring','silver'][this.count%4]);
    if(this.time-this.lastLaunched<.15)return false;this.lastLaunched=this.time;this.lastPower=power;++this.count;
    const startX=this.w*(.4+this.rng()*.25),startY=this.h*.728;
    if(this.reduced){this.staticBurst(target.x,target.y,power,color,type);this.onSound?.('burst',power,options.silent);return true;}
    const duration=.85+this.rng()*.28;
    this.rockets.push({sx:startX,sy:startY,x:startX,y:startY,tx:target.x,ty:target.y,duration,age:0,power,color,type,trail:[],silent:!!options.silent});
    this.onSound?.('launch',power,options.silent);return true;
  }
  show(silent=false){
    const w=this.w,h=this.h,narrow=w/h<.8;
    const shots=[
      [0,narrow?.63:.56,.28,1.15,0,'willow'],
      [1.4,narrow?.35:.35,.34,.76,1,'silver'],
      [2.7,narrow?.72:.77,.38,.95,2,'peony'],
      [5,narrow?.53:.57,.20,1.55,0,'willow'],
      [7.2,narrow?.30:.40,.36,.84,3,'ring'],
      [8.1,narrow?.74:.75,.29,1.0,1,'silver'],
      [10.4,narrow?.56:.59,.25,1.65,0,'willow'],
    ];
    if(this.reduced){this.launch(w*.58,h*.32,1.1,{color:0,type:'willow',silent});return;}
    if(this.scheduled.length)return;
    for(const [delay,x,y,power,color,type] of shots)this.scheduled.push({at:this.time+delay,x:x*w,y:y*h,power,color,type,silent});
  }
  burst(rocket){
    ++this.burstCount;const{x,y,power,color,type}=rocket,rng=this.rng;
    const scale=Math.min(this.w,this.h)*.0011;
    const count=Math.min(Math.round((type==='willow'?185:135)*power),330);
    const available=Math.max(0,CONFIG.maximumParticles-this.sparks.length),total=Math.min(count,available);
    for(let i=0;i<total;i++){
      const phi=Math.acos(1-2*(i+.5)/total),theta=i*2.3999632297+rng()*.12;
      let vx=Math.cos(theta)*Math.sin(phi),vy=Math.sin(theta)*Math.sin(phi);
      const layer=type==='ring'?(.78+rng()*.22):(.40+rng()*.6);
      if(type==='ring'){const a=i/total*TAU;vx=Math.cos(a);vy=Math.sin(a)*.72;}
      const speed=(type==='willow'?205:218)*scale*power*layer;
      const life=(type==='willow'?3.5:2.2)+(rng()*.9),twinkle=(type==='silver'||i%8===0);
      this.sparks.push({x,y,px:x,py:y,vx:vx*speed,vy:vy*speed,age:0,life,color,twinkle,phase:rng()*TAU,size:(.55+rng()*.75)*Math.max(.7,scale),history:[],trailClock:0,willow:type==='willow',gravity:(type==='willow'?24:28)*scale,drag:type==='willow'?.44:.68,depth:.6+rng()*.6});
    }
    // A denser, slightly delayed inner bloom gives the explosion a luminous center.
    for(let i=0;i<Math.min(40,available-total);i++){
      const a=i/40*TAU,speed=(12+rng()*25)*scale*power;
      this.sparks.push({x,y,px:x,py:y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,age:-.045,life:.85+rng()*.55,color:1,twinkle:false,phase:0,size:.7*scale,history:[],trailClock:0,willow:false,gravity:19*scale,drag:1.2,depth:1});
    }
    this.halos.push({x,y,age:0,power,color,life:.65});this.smoke.push({x,y,age:0,color,life:5.0,power});
    this.rings.push({x,y,age:0,power,color,life:.42});
    this.light={x,intensity:Math.min(.8,.45*power),color:CONFIG.fireworkPalette[color]};
    this.onSound?.('burst',power,rocket.silent);
  }
  staticBurst(x,y,power,color,type){
    this.c.clearRect(0,0,this.w,this.h);const rng=this.rng,radius=Math.min(this.w,this.h)*.18*power;
    const c=this.c;c.save();c.globalCompositeOperation='lighter';
    for(let i=0;i<90;i++){const a=i/90*TAU,r=radius*(.45+rng()*.55),tx=x+Math.cos(a)*r,ty=y+Math.sin(a)*r;c.beginPath();c.moveTo(x+Math.cos(a)*r*.58,y+Math.sin(a)*r*.58);c.quadraticCurveTo(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9,tx,ty+(type==='willow'?r*.18:0));c.strokeStyle=`rgba(${CONFIG.fireworkPalette[color].join(',')},${.3+rng()*.5})`;c.lineWidth=.7;c.stroke();c.drawImage(this.sprites[color],tx-3,ty-3,6,6);}c.restore();++this.burstCount;
  }
  setCharge(x,y,amount){this.charge={x,y,amount};}
  update(dt,time){
    this.time=time;
    for(let i=this.scheduled.length-1;i>=0;i--){const shot=this.scheduled[i];if(time>=shot.at){this.launch(shot.x,shot.y,shot.power,shot);this.scheduled.splice(i,1);}}
    if(this.reduced)return;
    this.light.intensity*=Math.exp(-dt*2.2);
    for(let i=this.rockets.length-1;i>=0;i--){
      const r=this.rockets[i];r.age+=dt;const t=Math.min(1,r.age/r.duration),e=1-(1-t)**1.55;
      r.x=r.sx+(r.tx-r.sx)*e;r.y=r.sy+(r.ty-r.sy)*e;r.trail.unshift({x:r.x,y:r.y});if(r.trail.length>24)r.trail.pop();
      if(t===1){this.burst(r);this.rockets.splice(i,1);}
    }
    for(let i=this.sparks.length-1;i>=0;i--){
      const p=this.sparks[i];p.age+=dt;if(p.age>p.life){this.sparks.splice(i,1);continue;}if(p.age<0)continue;
      p.px=p.x;p.py=p.y;p.vx*=Math.exp(-p.drag*dt);p.vy*=Math.exp(-p.drag*dt);p.vy+=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.trailClock+=dt;if(p.trailClock>.027){p.trailClock=0;p.history.unshift({x:p.x,y:p.y});if(p.history.length>(p.willow?29:15))p.history.pop();}
    }
    for(const list of [this.halos,this.rings,this.smoke])for(let i=list.length-1;i>=0;i--){list[i].age+=dt;if(list[i].age>list[i].life)list.splice(i,1);}
  }
  draw(){
    if(this.reduced)return;
    const c=this.c,w=this.w,h=this.h;c.clearRect(0,0,w,h);
    // A hint of drifting powder-blue smoke remains after the firework has fallen.
    for(const p of this.smoke){const t=p.age/p.life;c.save();c.translate(p.x+t*15,p.y-t*11);c.scale(1,.55);glow(c,0,0,Math.min(w,h)*(.035+t*.07)*p.power,'111,120,147',Math.sin(t*Math.PI)*.08);c.restore();}
    c.save();c.globalCompositeOperation='lighter';
    for(const ring of this.rings){const t=ring.age/ring.life;c.beginPath();c.arc(ring.x,ring.y,t*Math.min(w,h)*.12*ring.power,0,TAU);c.strokeStyle=`rgba(${CONFIG.fireworkPalette[ring.color]},${(1-t)*.12})`;c.lineWidth=.6;c.stroke();}
    for(const halo of this.halos){const t=halo.age/halo.life;glow(c,halo.x,halo.y,Math.min(w,h)*(.035+t*.04)*halo.power,CONFIG.fireworkPalette[halo.color].join(','),(1-t)**2*.5);}
    for(const rocket of this.rockets){
      const trail=rocket.trail;c.lineCap='round';
      for(let j=1;j<trail.length;j++){c.beginPath();c.moveTo(trail[j-1].x,trail[j-1].y);c.lineTo(trail[j].x,trail[j].y);c.strokeStyle=`rgba(241,198,128,${(1-j/trail.length)*.72})`;c.lineWidth=Math.max(.5,1.4*(1-j/trail.length));c.stroke();}
      c.drawImage(this.sprites[0],rocket.x-6,rocket.y-6,12,12);
    }
    for(const p of this.sparks){
      if(p.age<0)continue;
      const progress=p.age/p.life,fade=Math.min(1,p.age*15)*Math.pow(1-progress,p.willow?.65:1.1);
      const twinkle=p.twinkle&&progress>.40?.35+.65*Math.max(0,Math.sin(p.age*21+p.phase)):1;
      const alpha=fade*twinkle,history=p.history,color=CONFIG.fireworkPalette[p.color];
      if(alpha<.01)continue;
      c.lineCap='round';
      if(history.length>2){
        const middle=Math.max(2,Math.floor(history.length*.45));
        c.beginPath();c.moveTo(p.x,p.y);for(let j=1;j<middle;j+=2)c.lineTo(history[j].x,history[j].y);c.strokeStyle=`rgba(${color},${alpha*.65})`;c.lineWidth=p.size*(p.willow?1.0:1.1);c.stroke();
        c.beginPath();c.moveTo(history[middle-1].x,history[middle-1].y);for(let j=middle;j<history.length;j+=2)c.lineTo(history[j].x,history[j].y);c.strokeStyle=`rgba(${color},${alpha*.16})`;c.lineWidth=p.size*.65;c.stroke();
      }
      const size=(p.twinkle?6:4.2)*p.size;c.globalAlpha=alpha;c.drawImage(this.sprites[p.color],p.x-size*.5,p.y-size*.5,size,size);c.globalAlpha=1;
      // Fine, bright cores make small stars remain legible on phones.
      c.fillStyle=`rgba(255,246,222,${alpha*.78})`;c.fillRect(p.x-p.size*.35,p.y-p.size*.35,p.size*.7,p.size*.7);
    }
    c.restore();
    // Reflections are broken horizontal marks, clipped to the exact river silhouette.
    c.save();c.clip(this.landscape.waterPath);c.globalCompositeOperation='screen';
    for(const p of this.sparks){
      if(p.age<.1||p.age>p.life*.93||p.depth>.97)continue;
      const fade=(1-p.age/p.life)*.15,yy=h*.724+(h*.66-p.y)*.16+(p.depth-.6)*h*.10,x=p.x+(Math.sin(yy*.21+this.time*1.5)*2);
      const ww=(1+p.depth)*Math.max(2,Math.min(w,h)*.006);c.strokeStyle=`rgba(${CONFIG.fireworkPalette[p.color]},${fade})`;c.lineWidth=.8;c.beginPath();c.moveTo(x-ww,yy);c.lineTo(x+ww,yy);c.stroke();
    }
    if(this.light.intensity>.01)glow(c,this.light.x,h*.77,Math.min(w,h)*.16,this.light.color.join(','),this.light.intensity*.10);
    c.restore();
    if(this.charge){
      const{x,y,amount}=this.charge;c.save();c.globalCompositeOperation='lighter';glow(c,x,y,13+amount*28,'241,206,151',.2+amount*.18);
      for(let i=0;i<14;i++){const a=i/14*TAU+this.time*(1.1+amount),r=(12+17*(1-amount))*(.7+Math.sin(this.time*3+i)*.18);const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;c.drawImage(this.sprites[0],px-2,py-2,4,4);}c.restore();
    }
  }
  snapshot(){return{launched:this.count,bursts:this.burstCount,rockets:this.rockets.length,particles:this.sparks.length,scheduled:this.scheduled.length,charged:!!this.charge,lastPower:this.lastPower};}
}
