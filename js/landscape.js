export function random(seed=318){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
function layer(w,h,dpr){const canvas=document.createElement('canvas');canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);return{canvas,ctx};}
export function glow(c,x,y,r,color,alpha=1){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(.15,`rgba(${color},${alpha*.5})`);g.addColorStop(.5,`rgba(${color},${alpha*.12})`);g.addColorStop(1,`rgba(${color},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function line(c,points,color,width=1){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function path(c,points,fill){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=fill;c.fill();}
function ellipse(c,x,y,rx,ry,color,rotation=0){c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fillStyle=color;c.fill();}

function mountain(c,w,h,base,amplitude,color,seed){
  const rng=random(seed);c.beginPath();c.moveTo(-20,base);
  for(let x=-20;x<w+30;x+=7){const t=x/w,y=base-amplitude*(.28+Math.sin(t*7.6+seed)*.24+Math.sin(t*17+seed*2)*.10+Math.sin(t*41)*.025)-rng()*amplitude*.035;c.lineTo(x,y);}
  c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fillStyle=color;c.fill();
}
function pine(c,x,base,height,width,seed,snow=true,far=false){
  const rng=random(seed),top=base-height;
  c.lineCap='round';line(c,[[x,base+3],[x-1,top]],far?'#152c42':'#102433',Math.max(1,width*.035));
  // Fine needles and irregular branch ends give the trees a feathery silhouette.
  for(let level=0;level<15;level++){
    const v=(level+1)/15,yy=top+height*v,span=width*(.1+v*.42)*(1+rng()*.15);
    for(const side of [-1,1]){
      const endX=x+side*span,endY=yy+height*.04;
      const needleColor=far?'#1a3349':level%3?'#143040':'#1b3949';
      c.beginPath();c.moveTo(x,yy-height*.07);c.bezierCurveTo(x+side*span*.28,yy-height*.04,x+side*span*.65,yy+height*.03,endX,endY);c.bezierCurveTo(x+side*span*.85,endY+height*.018,x+side*span*.33,yy+height*.018,x,yy+height*.015);c.fillStyle=needleColor;c.fill();
      for(let j=0;j<7;j++){
        const t=j/7,bx=x+(endX-x)*t,by=yy+height*.035*t;
        line(c,[[bx-side*height*.04,by-height*.045*(1-t*.7)],[bx,by+height*.012],[bx+side*height*.035,by+height*.013]],needleColor,far?.7:1.05);
      }
      if(snow&&level>1){
        c.beginPath();c.moveTo(x+side*span*.08,yy-height*.032);c.bezierCurveTo(x+side*span*.3,yy-height*.025,x+side*span*.4,yy+height*.017,x+side*span*.83,yy+height*.018);c.bezierCurveTo(x+side*span*.68,yy+height*.038,x+side*span*.39,yy+height*.014,x+side*span*.08,yy-height*.011);c.fillStyle=far?'#647b91':level%2?'#95adc3':'#b0c3d4';c.fill();
        line(c,[[x+side*span*.13,yy-height*.031],[x+side*span*.39,yy-height*.008],[x+side*span*.75,yy+height*.017]],far?'#8197ad':'#c6d4e0',far?.5:.8);
      }
    }
  }
}
function bareTree(c,x,y,h,seed,light=false){
  const rng=random(seed);c.lineCap='round';
  function branch(bx,by,len,angle,width,depth){
    const ex=bx+Math.sin(angle)*len,ey=by-Math.cos(angle)*len,mx=bx+Math.sin(angle+.12)*len*.54,my=by-Math.cos(angle+.12)*len*.54;
    c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(mx,my,ex,ey);c.strokeStyle=light?'#71869b':'#22394c';c.lineWidth=width;c.stroke();
    if(depth>0){branch(ex,ey,len*(.58+rng()*.1),angle+(rng()-.5)*.5,width*.62,depth-1);branch(bx+(ex-bx)*.7,by+(ey-by)*.7,len*.53,angle+(rng()>.5?1:-1)*(.4+rng()*.5),width*.55,depth-1);}
  }
  branch(x,y,h*.47,-.04,Math.max(.7,h*.022),5);
  line(c,[[x-1,y],[x-3,y-h*.4]],light?'#bac9d6':'#647e96',Math.max(.4,h*.006));
}
function house(c,x,y,w,h,seed,bright=false){
  const rng=random(seed),roofH=h*.57,wallH=h*.71;
  // Dark timber, then a deep roof with a soft, uneven cap of moonlit snow.
  path(c,[[x-w*.49,y],[x-w*.49,y-wallH],[x+w*.46,y-wallH],[x+w*.46,y]],bright?'#29333e':'#243449');
  path(c,[[x+w*.46,y],[x+w*.63,y-h*.12],[x+w*.63,y-h*.75],[x+w*.46,y-wallH]],'#18283a');
  for(let j=0;j<8;j++)line(c,[[x-w*.48,y-wallH+j*wallH/8],[x+w*.45,y-wallH+j*wallH/8]],'#101f2e75',Math.max(.5,h*.01));
  const rx=x-w*.07,ry=y-wallH-roofH;
  path(c,[[x-w*.62,y-wallH+.06*h],[rx,ry],[x+w*.62,y-wallH+.06*h]],'#131f30');
  c.beginPath();c.moveTo(x-w*.64,y-wallH+.045*h);c.lineTo(rx-.02*w,ry-.055*h);c.quadraticCurveTo(rx,ry-.085*h,rx+.04*w,ry-.04*h);c.lineTo(x+w*.65,y-wallH+.025*h);c.lineTo(x+w*.58,y-wallH+.10*h);c.quadraticCurveTo(x+w*.25,y-wallH-roofH*.52,rx,ry+.04*h);c.lineTo(x-w*.56,y-wallH+.11*h);c.closePath();c.fillStyle=bright?'#b9c7d2':'#8e9fb3';c.fill();
  line(c,[[x-w*.61,y-wallH+.04*h],[rx,ry-.052*h],[x+w*.62,y-wallH+.027*h]],'#d1dbe2',Math.max(.6,h*.018));
  // Chimney and a white little rim.
  c.fillStyle='#2b3545';c.fillRect(x+w*.25,y-h*1.14,w*.095,h*.29);c.fillStyle='#c2ccd7';c.fillRect(x+w*.237,y-h*1.15,w*.12,h*.045);
  const windowW=w*.12,windowH=h*.23;
  for(let i=0;i<3;i++){
    const wx=x-w*.31+i*w*.26,wy=y-h*.44;
    if(rng()>.12){
      glow(c,wx+windowW/2,wy+windowH/2,w*.25,'249,187,100',bright?.21:.08);
      const gradient=c.createLinearGradient(wx,wy,wx,wy+windowH);gradient.addColorStop(0,bright?'#f2c78c':'#d2ae7c');gradient.addColorStop(.7,bright?'#e7a35e':'#c58f57');gradient.addColorStop(1,'#a86d3e');c.fillStyle=gradient;c.fillRect(wx,wy,windowW,windowH);
      line(c,[[wx+windowW*.5,wy],[wx+windowW*.5,wy+windowH]],'#5b4437',Math.max(.6,w*.006));line(c,[[wx,wy+windowH*.5],[wx+windowW,wy+windowH*.5]],'#74523c',Math.max(.5,w*.005));
      c.fillStyle='#8097b0';c.fillRect(wx-w*.015,wy+windowH,w*.15,h*.025);
    }
  }
  c.fillStyle='#1a2635';c.fillRect(x+w*.31,y-h*.44,w*.10,h*.44);c.fillStyle='#dcb07a';c.fillRect(x+w*.34,y-h*.39,w*.035,h*.12);
  // Drifts settle around the building's base.
  ellipse(c,x,y+h*.015,w*.6,h*.04,bright?'#95abc0':'#7189a2');
  return{x:x+w*.295,y:y-h*1.15};
}
function village(c,w,h,rng,narrow){
  const y=h*.667,span=narrow?w*.78:w*.56;
  for(let i=0;i<19;i++){
    const x=w*.025+i/19*span,size=(narrow?16:23)+rng()*(narrow?12:19);
    pine(c,x,y+3,size*1.5,size*.6,400+i,true,true);
  }
  for(let i=0;i<12;i++){
    const x=w*.045+i/12*span,ww=(narrow?17:29)+rng()*(narrow?13:23),hh=ww*.72;
    house(c,x,y+rng()*6,ww,hh,800+i,false);
  }
  // A little clocktower, almost a silhouette, gives the shore its own skyline.
  const x=w*.42,base=y-2,th=narrow?34:55,tw=th*.19;
  c.fillStyle='#25364a';c.fillRect(x-tw/2,base-th*.8,tw,th*.8);path(c,[[x-tw*.75,base-th*.8],[x,base-th*1.25],[x+tw*.75,base-th*.8]],'#17293c');
  line(c,[[x-tw*.65,base-th*.8],[x,base-th*1.25]],'#9aaebf',1);ellipse(c,x,base-th*.66,tw*.22,tw*.22,'#dfbd85');line(c,[[x,base-th*.66],[x+1,base-th*.7]],'#5e5148',.5);
}
function bridge(c,w,h,narrow){
  const cx=w*.53,y=h*.729,bw=narrow?w*.29:w*.20,bh=bw*.14;
  c.beginPath();c.moveTo(cx-bw/2,y+bh*.2);c.quadraticCurveTo(cx,y-bh,cx+bw/2,y+bh*.2);c.lineTo(cx+bw/2,y+bh*.75);c.quadraticCurveTo(cx,y-bh*.42,cx-bw/2,y+bh*.75);c.closePath();c.fillStyle='#22384e';c.fill();
  c.beginPath();c.moveTo(cx-bw/2,y+bh*.17);c.quadraticCurveTo(cx,y-bh*1.02,cx+bw/2,y+bh*.17);c.strokeStyle='#8da4bb';c.lineWidth=Math.max(1.6,bw*.015);c.stroke();
  for(let i=0;i<12;i++){const t=i/11,x=cx-bw/2+t*bw,yy=y+bh*.17-4*bh*.59*t*(1-t);line(c,[[x,yy],[x,yy-bh*.34]],'#46607b',1);}
  c.beginPath();c.moveTo(cx-bw/2,y-bh*.17);c.quadraticCurveTo(cx,y-bh*1.35,cx+bw/2,y-bh*.17);c.strokeStyle='#c0cfdd';c.lineWidth=Math.max(1.3,bw*.008);c.stroke();
  for(const sign of [-1,1]){const x=cx+sign*bw*.44,yy=y-bh*.07;line(c,[[x,yy],[x,yy-bh*1.1]],'#273a4d',2);glow(c,x,yy-bh*1.14,bh*.82,'249,192,116',.25);ellipse(c,x,yy-bh*1.14,1.5,3,'#f2d39c');}
}
function bench(c,x,y,w){
  const h=w*.39;c.save();c.translate(x,y);c.rotate(-.025);
  ellipse(c,0,h*.17,w*.68,h*.09,'#162c4260');
  for(const sign of [-1,1]){
    line(c,[[sign*w*.34,h*.1],[sign*w*.32,-h*.67]],'#152737',Math.max(2,w*.016));
    line(c,[[sign*w*.34,-h*.1],[sign*w*.43,h*.15]],'#152737',Math.max(2,w*.016));
    c.beginPath();c.moveTo(sign*w*.36,-h*.15);c.bezierCurveTo(sign*w*.52,-h*.27,sign*w*.49,-h*.47,sign*w*.35,-h*.43);c.strokeStyle='#21374a';c.lineWidth=Math.max(2,w*.016);c.stroke();
  }
  for(let j=0;j<3;j++){
    c.fillStyle=j===0?'#43556b':'#304357';c.fillRect(-w*.43,-h*.66+j*h*.14,w*.86,h*.095);
    line(c,[[-w*.43,-h*.66+j*h*.14],[w*.43,-h*.66+j*h*.14]],'#889eb3',1);
    for(const sign of [-1,1])ellipse(c,sign*w*.36,-h*.62+j*h*.14,.9,.9,'#9cadb8');
  }
  path(c,[[-w*.49,-h*.13],[w*.46,-h*.13],[w*.55,h*.02],[-w*.56,h*.02]],'#63798d');
  c.fillStyle='#30495d';c.fillRect(-w*.55,h*.02,w*1.1,h*.055);
  // Snow on the back and seat, with blue undersides.
  c.beginPath();c.moveTo(-w*.44,-h*.67);c.quadraticCurveTo(0,-h*.76,w*.44,-h*.69);c.lineTo(w*.44,-h*.64);c.quadraticCurveTo(0,-h*.69,-w*.44,-h*.62);c.closePath();c.fillStyle='#c3d0dd';c.fill();
  c.beginPath();c.moveTo(-w*.52,-h*.09);c.quadraticCurveTo(-w*.15,-h*.19,w*.16,-h*.11);c.lineTo(w*.51,-h*.02);c.lineTo(w*.51,h*.01);c.lineTo(-w*.53,h*.01);c.closePath();c.fillStyle='#afc1d2';c.fill();
  // A wool scarf hangs over one side. Small stitch lines keep it tactile.
  c.beginPath();c.moveTo(-w*.28,-h*.68);c.bezierCurveTo(-w*.16,-h*.62,-w*.23,-h*.18,-w*.19,h*.21);c.lineTo(-w*.06,h*.2);c.bezierCurveTo(-w*.12,-h*.09,-w*.05,-h*.5,-w*.15,-h*.67);c.closePath();c.fillStyle='#8b6971';c.fill();
  for(let j=0;j<15;j++){const yy=-h*.58+j*h*.052;line(c,[[-w*.205,yy],[-w*.105,yy+h*.012]],j%3?'#b59a9b55':'#cebaad99',.7);}
  for(let j=0;j<6;j++)line(c,[[-w*.18+j*w*.021,h*.19],[-w*.18+j*w*.021,h*.28]],'#8b6971',Math.max(.7,w*.005));
  // Small folded letter on the clear end of the seat.
  c.save();c.translate(w*.20,-h*.06);c.rotate(.10);c.fillStyle='#d7d4c7';c.fillRect(-w*.064,-h*.055,w*.14,h*.085);line(c,[[-w*.06,-h*.05],[0,h*.003],[w*.07,-h*.045]],'#9c988b',.7);c.restore();c.restore();
}
function lamp(c,x,y,height,lit){
  const top=y-height,s=height/230;
  if(lit){glow(c,x,top+20*s,160*s,'248,188,113',.22);glow(c,x,top+20*s,55*s,'255,204,135',.34);ellipse(c,x+6*s,y+3*s,95*s,18*s,'#edc5941c',-.1);}
  c.lineCap='round';line(c,[[x,y],[x,top+25*s]],'#122333',Math.max(2.5,5*s));line(c,[[x-1*s,y],[x-1*s,top+25*s]],'#53677b',Math.max(.7,s));
  ellipse(c,x,y,13*s,3*s,'#1b3045');ellipse(c,x,y-2*s,10*s,2*s,'#a3b8ca');
  path(c,[[x-12*s,top+8*s],[x+12*s,top+8*s],[x+9*s,top+34*s],[x-9*s,top+34*s]],'#162738');
  const gradient=c.createLinearGradient(x,top+8*s,x,top+32*s);gradient.addColorStop(0,lit?'#ffe6af':'#788696');gradient.addColorStop(.5,lit?'#edbb75':'#4d5e72');gradient.addColorStop(1,lit?'#ae7845':'#37495e');c.fillStyle=gradient;c.fillRect(x-8*s,top+11*s,16*s,20*s);
  for(const sign of [-1,1])line(c,[[x+sign*6*s,top+10*s],[x+sign*4*s,top+32*s]],'#4d493d',1*s);
  path(c,[[x-17*s,top+9*s],[x,top-4*s],[x+17*s,top+9*s]],'#20364b');
  c.beginPath();c.moveTo(x-17*s,top+8*s);c.quadraticCurveTo(x-5*s,top-10*s,x+1*s,top-5*s);c.lineTo(x+18*s,top+8*s);c.closePath();c.fillStyle='#bfceda';c.fill();
  ellipse(c,x,top-7*s,2*s,3*s,'#20364b');line(c,[[x-10*s,top+35*s],[x+10*s,top+35*s]],'#536576',1.5*s);
}

export class WinterLandscape{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.lampLit=true;this.anchors={};}
  resize(w,h,dpr){this.w=w;this.h=h;this.dpr=dpr;this.narrow=w/h<.8;this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.background=layer(w,h,dpr);this.front=layer(w,h,dpr);this.paintBackground();this.paintForeground();this.ctx.drawImage(this.background.canvas,0,0,w,h);}
  paintBackground(){
    const {w,h,narrow}=this,c=this.background.ctx,rng=random(6373);c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,w*.2,h*.78);sky.addColorStop(0,'#071224');sky.addColorStop(.36,'#101e34');sky.addColorStop(.70,'#28334b');sky.addColorStop(1,'#627182');c.fillStyle=sky;c.fillRect(0,0,w,h);
    // Low horizon bloom and a little muted blue mist, never a full aurora stripe.
    glow(c,w*.57,h*.65,w*.47,'116,124,155',.15);glow(c,w*.83,h*.33,w*.33,'75,104,146',.09);
    const moonX=w*.78,moonY=h*(narrow?.16:.15),moonR=Math.max(11,Math.min(w,h)*.023);
    glow(c,moonX,moonY,moonR*5,'191,208,230',.15);glow(c,moonX,moonY,moonR*1.6,'221,227,232',.22);
    const moon=c.createRadialGradient(moonX-moonR*.3,moonY-moonR*.3,1,moonX,moonY,moonR);moon.addColorStop(0,'#e5e4da');moon.addColorStop(.7,'#c8d3d9');moon.addColorStop(1,'#a9bbc9');ellipse(c,moonX,moonY,moonR,moonR,moon);
    c.save();c.beginPath();c.arc(moonX,moonY,moonR,0,Math.PI*2);c.clip();for(let i=0;i<120;i++){const x=moonX+(rng()-.5)*moonR*2,y=moonY+(rng()-.5)*moonR*2;ellipse(c,x,y,rng()*moonR*.16,rng()*moonR*.12,i%2?'#879dad10':'#f5ede512');}c.restore();
    for(let i=0;i<(narrow?95:185);i++){
      const x=rng()*w,y=rng()*h*.59,r=.25+rng()*.8;
      if(Math.hypot(x-moonX,y-moonY)<moonR*2.5)continue;
      ellipse(c,x,y,r,r,`rgba(210,224,240,${.1+rng()*.40})`);
      if(i%19===0){line(c,[[x-r*2.5,y],[x+r*2.5,y]],'#c2d6eb21',.7);line(c,[[x,y-r*2.5],[x,y+r*2.5]],'#c2d6eb21',.7);}
    }
    // Wisps of cold, low cloud break up the sky without covering its empty space.
    c.save();c.globalAlpha=.09;for(let i=0;i<6;i++){const cx=w*(.30+i*.15),cy=h*(.42+(i%2)*.035);const g=c.createRadialGradient(cx,cy,2,cx,cy,w*.14);g.addColorStop(0,'#94a3ba');g.addColorStop(1,'#94a3ba00');c.save();c.translate(cx,cy);c.scale(1,.12);c.translate(-cx,-cy);c.fillStyle=g;c.fillRect(cx-w*.14,cy-w*.14,w*.28,w*.28);c.restore();}c.restore();
    mountain(c,w,h,h*.665,h*.13,'#33455d',12);mountain(c,w,h,h*.674,h*.115,'#283b52',28);mountain(c,w,h,h*.692,h*.077,'#20354c',50);
    const forestY=h*.674;
    for(let i=0;i<(narrow?55:115);i++){const x=i/(narrow?55:115)*w,ht=10+rng()*h*.028;pine(c,x,forestY+rng()*8,ht,ht*.43,200+i,true,true);}
    // The far snow bank is an irregular ribbon of light.
    c.beginPath();c.moveTo(0,h*.683);c.bezierCurveTo(w*.2,h*.668,w*.4,h*.678,w*.58,h*.694);c.bezierCurveTo(w*.74,h*.701,w*.88,h*.68,w,h*.688);c.lineTo(w,h*.742);c.lineTo(0,h*.742);c.closePath();c.fillStyle='#7890aa';c.fill();
    village(c,w,h,rng,narrow);
    // A closer cabin nestles among trees on the left shore.
    this.chimney=house(c,w*.16,h*.723,narrow?w*.19:w*.11,h*(narrow?.052:.062),817,true);
    pine(c,w*.061,h*.728,h*.14,h*.058,217,true,false);pine(c,w*.27,h*.724,h*.098,h*.039,218,true,false);
    for(let i=0;i<5;i++)pine(c,w*(.76+i*.055),h*.712,h*(.075+rng()*.04),h*.04,133+i,true,true);
    // Water snakes between the banks; its own cached grain carries the reflections.
    this.waterPath=new Path2D();const p=this.waterPath;p.moveTo(w*.25,h*.708);p.bezierCurveTo(w*.48,h*.704,w*.60,h*.711,w*.81,h*.718);p.bezierCurveTo(w*.67,h*.761,w*.85,h*.784,w*1.06,h*.833);p.lineTo(w*1.06,h*.94);p.lineTo(-w*.08,h*.94);p.bezierCurveTo(w*.08,h*.825,w*.44,h*.766,w*.25,h*.708);p.closePath();
    c.save();c.clip(p);const water=c.createLinearGradient(0,h*.70,0,h*.92);water.addColorStop(0,'#23384f');water.addColorStop(.5,'#152a41');water.addColorStop(1,'#263d56');c.fillStyle=water;c.fillRect(0,h*.69,w,h*.3);
    for(let i=0;i<420;i++){const x=rng()*w,yy=h*(.712+rng()*.22),ww=(3+rng()*w*.075)*(yy/h-.66)*4;line(c,[[x,yy],[x+ww,yy]],i%3?'#7a9cbe0b':'#adc5df13',.5+rng()*.7);}
    // Warm window streaks on moving water.
    for(let i=0;i<42;i++){const yy=h*(.715+i*.0015),x=w*.16+Math.sin(i*1.9)*w*.02,spread=w*.01+i*w*.0005;line(c,[[x-spread,yy],[x+spread,yy]],`rgba(221,163,97,${.09*(1-i/43)})`,1);}
    c.restore();bridge(c,w,h,narrow);
    // Tiny footpaths and frosted reeds at the far edge.
    for(let i=0;i<34;i++){const x=w*(.03+rng()*.95),yy=h*(.707+rng()*.015);line(c,[[x,yy],[x+3,yy-4-rng()*8]],'#72869b',.6);}
    // Fine film grain gives the gradient and snow a tactile surface.
    c.save();for(let i=0;i<Math.min(20000,w*h*.024);i++){c.fillStyle=i%2?'#dce7f10a':'#0208110a';c.fillRect(rng()*w,rng()*h,.6,.6);}c.restore();
  }
  paintForeground(){
    const {w,h,narrow}=this,c=this.front.ctx,rng=random(954);c.clearRect(0,0,w,h);
    this.snowPath=new Path2D();const p=this.snowPath;p.moveTo(-10,h*.815);p.bezierCurveTo(w*.14,h*.775,w*.22,h*.805,w*.33,h*.833);p.bezierCurveTo(w*.47,h*.86,w*.58,h*.813,w*.72,h*.808);p.bezierCurveTo(w*.84,h*.793,w*.96,h*.812,w+10,h*.828);p.lineTo(w+10,h+10);p.lineTo(-10,h+10);p.closePath();
    const snow=c.createLinearGradient(0,h*.79,w*.2,h);snow.addColorStop(0,'#9ab0c5');snow.addColorStop(.2,'#849db7');snow.addColorStop(.7,'#4c6683');snow.addColorStop(1,'#2b425e');c.fillStyle=snow;c.fill(p);
    c.beginPath();c.moveTo(0,h*.815);c.bezierCurveTo(w*.14,h*.775,w*.22,h*.805,w*.33,h*.833);c.bezierCurveTo(w*.47,h*.86,w*.58,h*.813,w*.72,h*.808);c.bezierCurveTo(w*.84,h*.793,w*.96,h*.812,w,h*.828);c.strokeStyle='#b1c4d4';c.lineWidth=1.3;c.stroke();
    // Uneven drifts curve toward the warm lamp.
    for(let j=0;j<3;j++){c.beginPath();c.moveTo(-10,h*(.875+j*.052));c.bezierCurveTo(w*.17,h*(.81+j*.042),w*.40,h*(.91+j*.018),w*.66,h*(.85+j*.041));c.strokeStyle=j===0?'#bccad61c':'#b4c4d113';c.lineWidth=1.5;c.stroke();}
    for(let i=0;i<390;i++){const x=rng()*w,y=h*(.81+rng()*.19);ellipse(c,x,y,.25+rng()*.8,.2,i%2?'#dae4ee1b':'#17314911');}
    // A short pair of footprints ends at the bench, rather than at a message.
    for(let i=0;i<11;i++){const t=i/10,x=w*(.50+t*.18)+(i%2?4:-4)*(narrow?.6:1),y=h*(1.04-t*.17);ellipse(c,x,y,Math.max(1.2,w*.0023)*(1-t*.3),Math.max(2,h*.0046)*(1-t*.3),'#27445d60',-.2);}
    const benchW=narrow?w*.34:Math.min(w*.16,h*.25),benchX=w*(narrow?.65:.72),benchY=h*.857;
    bench(c,benchX,benchY,benchW);
    const lampX=w*(narrow?.88:.875),lampY=h*.844,lampH=h*(narrow?.245:.30);
    lamp(c,lampX,lampY,lampH,this.lampLit);
    this.anchors.lamp={x:lampX,y:lampY-lampH+lampH*.087};this.anchors.note={x:benchX+benchW*.20,y:benchY-benchW*.03};
    // The nearest tree lives partly outside the frame, creating a quiet natural edge.
    pine(c,w*(narrow?-.035:.018),h*.90,h*(narrow?.22:.30),h*(narrow?.09:.12),144,true,false);
    bareTree(c,w*(narrow?.98:.97),h*.843,h*(narrow?.14:.21),71,true);
    // Sparse grasses catch snow just above the water.
    for(let i=0;i<20;i++){const x=w*(.02+rng()*.24),yy=h*(.818+rng()*.018),hh=3+rng()*11;line(c,[[x,yy],[x+Math.sin(i)*3,yy-hh]],'#334e68',.7);ellipse(c,x+Math.sin(i)*3,yy-hh,2,1,'#bacbd8');}
  }
  setLamp(lit){this.lampLit=lit;this.paintForeground();}
  drawForeground(c,light=null){
    c.drawImage(this.front.canvas,0,0,this.w,this.h);
    if(light?.intensity>.005){c.save();c.clip(this.snowPath);c.globalCompositeOperation='screen';glow(c,light.x,this.h*.8,this.w*.7,light.color.join(','),light.intensity*.15);c.restore();}
  }
}
