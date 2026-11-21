import * as THREE from 'three';
import { mesh,box,ball,tube,group,material,texture,skyTexture,paperTexture,random,optimize,batchStatic } from 'soda/art';

function roofGeometry(w,h,d){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,h);shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});geometry.translate(0,0,-d/2);return geometry;}
function house(parent,x,z,w,h,d,index,mats){
  const g=group(parent,[x,-.6,z]);const walls=[mats.houseCream,mats.housePeach,mats.houseSage,mats.houseSand];
  box(g,w,h,d,walls[index%walls.length],[0,h/2,0],[0,0,0],.012);
  mesh(g,roofGeometry(w+.25,.7+(index%3)*.13,d+.2),mats.roofs[index%3],[0,h,0],[0,0,0],false);
  box(g,.24,.65,.32,mats.houseSand,[w*.23,h+.5,-d*.1]);
  const rows=Math.max(1,Math.floor(h/.75)),cols=w>1.5?3:2;
  for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){
    const wx=(col-(cols-1)/2)*(w/(cols+.4)),wy=.65+r*.73;
    box(g,.33,.4,.035,mats.window,[wx,wy,d/2+.025],[0,0,0],0);
    box(g,.4,.045,.08,mats.houseCream,[wx,wy-.22,d/2+.06],[0,0,0],0);
    box(g,.025,.41,.04,mats.houseCream,[wx,wy,d/2+.06],[0,0,0],0);
    box(g,.34,.025,.04,mats.houseCream,[wx,wy,d/2+.06],[0,0,0],0);
    if((r+col+index)%4===0){box(g,.4,.15,.16,mats.terracotta,[wx,wy-.29,d/2+.1]);for(let j=0;j<4;j++)ball(g,.07,.1,.07,mats.tree,[wx-.13+j*.09,wy-.18,d/2+.14],[0,0,0],8);}
  }
  box(g,.35,.65,.04,mats.door,[0,.33,d/2+.03],[0,0,0],.015);
  for(const child of g.children){child.castShadow=false;child.receiveShadow=false;}
  return g;
}
function curtain(parent,x,y,z,w,h,m,side){
  const geometry=new THREE.PlaneGeometry(w,h,24,36);const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i),v=(py+h/2)/h;p.setXYZ(i,px+side*.14*(1-v)*Math.sin(v*Math.PI),py+Math.sin(px*17)*.025*(1-v),Math.cos(px*19)*.046+.08*Math.sin(v*Math.PI));}
  geometry.computeVertexNormals();const cloth=mesh(parent,geometry,m,[x,y,z],[0,side*.1,0],true);cloth.userData.live=true;cloth.userData.base=new Float32Array(p.array);return cloth;
}
function awning(parent,m){
  const colors=[m.sage,m.linen];const width=10,segments=16;
  for(let i=0;i<segments;i++){
    const stripeW=width/segments;const geometry=new THREE.PlaneGeometry(stripeW,2.7,2,24);const a=geometry.attributes.position;
    for(let j=0;j<a.count;j++){const u=(a.getY(j)+1.35)/2.7;const x=a.getX(j);a.setXYZ(j,x,5.68-Math.sin(u*Math.PI*.55)*.53,-3.3+u*2.7);}
    geometry.computeVertexNormals();mesh(parent,geometry,colors[i%2],[-5+(i+.5)*stripeW,0,0]);
    const shape=new THREE.Shape();shape.moveTo(-stripeW/2,0);shape.lineTo(stripeW/2,0);shape.lineTo(stripeW/2,-.11);shape.quadraticCurveTo(0,-.36,-stripeW/2,-.11);shape.closePath();mesh(parent,new THREE.ShapeGeometry(shape,12),colors[i%2],[-5+(i+.5)*stripeW,5.16,-.59],[0,0,0],true);
  }
  tube(parent,[[-4.9,5.65,-3.25],[-4.9,5.54,-2.1],[-4.9,5.15,-.6]],.025,m.brass);
  tube(parent,[[4.9,5.65,-3.25],[4.9,5.54,-2.1],[4.9,5.15,-.6]],.025,m.brass);
}
function outdoorTree(parent,x,y,z,scale,mats,seed){
  const g=group(parent,[x,y,z]);g.scale.setScalar(scale);const rng=random(seed);
  tube(g,[[0,0,0],[.1,1.2,0],[-.1,2.1,.1],[.1,3.1,.1]],.095,mats.bark);
  for(let i=0;i<8;i++){const angle=i*2.4,len=.6+rng()*.9,yy=1.3+i*.2;const ex=Math.cos(angle)*len,ez=Math.sin(angle)*len;tube(g,[[0,yy,0],[ex*.6,yy+.35,ez*.6],[ex,yy+.7,ez]],.025,mats.bark,12);for(let j=0;j<5;j++)ball(g,.45+rng()*.2,.22+rng()*.17,.4+rng()*.15,j%2?mats.tree:mats.treeLight,[ex+(rng()-.5)*.6,yy+.6+rng()*.4,ez+(rng()-.5)*.6],[rng(),rng(),rng()],12);}
  return g;
}
export function createWorld(scene,m){
  const root=group(scene);const building=group(root);
  // Open wall: actual empty space between the frame, rather than an image of a window.
  box(building,13,1.5,.3,m.wall,[0,.7,-3.12],[0,0,0],0);
  box(building,2.5,5.8,.35,m.wall,[-5.3,2.8,-3.12],[0,0,0],0);
  box(building,2.5,5.8,.35,m.wall,[5.3,2.8,-3.12],[0,0,0],0);
  box(building,8.2,.8,.35,m.wall,[0,5.7,-3.12],[0,0,0],0);
  box(building,.15,3.55,.2,m.sageDark,[-4.05,3.52,-2.87]);box(building,.15,3.55,.2,m.sageDark,[4.05,3.52,-2.87]);
  box(building,8.25,.14,.23,m.sageDark,[0,5.26,-2.87]);box(building,8.35,.15,.52,m.sageDark,[0,1.8,-2.76]);
  box(building,8.4,.055,.55,m.sage,[0,1.91,-2.73]);
  const windowGlass=new THREE.MeshPhysicalMaterial({color:'#dce9cf',roughness:.12,metalness:.1,transparent:true,opacity:.13,envMap:m.env,envMapIntensity:.8,side:THREE.DoubleSide,depthWrite:false});
  for(const side of [-1,1]){
    const pane=group(building,[side*3.97,3.55,-2.88]);pane.rotation.y=side*.64;const center=-side*.62;
    box(pane,1.25,.095,.095,m.sage,[center,1.63,0]);box(pane,1.25,.095,.095,m.sage,[center,-1.63,0]);
    box(pane,.085,3.3,.095,m.sage,[center-side*.59,0,0]);box(pane,.085,3.3,.095,m.sage,[center+side*.59,0,0]);box(pane,1.25,.055,.075,m.sage,[center,-.53,0]);
    mesh(pane,new THREE.PlaneGeometry(1.12,3.1),windowGlass,[center,0,0],[0,0,0],false);
    box(pane,.04,.16,.06,m.brass,[center-side*.48,-.27,.075]);
    for(const hy of [-1.2,1.2])mesh(pane,new THREE.CylinderGeometry(.045,.045,.15,12),m.brass,[0,hy,0]);
  }
  const cloths=[curtain(building,-3.61,3.55,-2.52,.68,3.25,m.linen,-1),curtain(building,3.65,3.55,-2.5,.52,3.25,m.linen,1)];
  const canopy=group(building,[0,.78,-.15]);awning(canopy,m);
  // A tiny, weathered nameplate belongs to the room, not the page's interface.
  const plaqueMap=texture(512,192,(c,w,h)=>{c.fillStyle='#e8e2c8';c.fillRect(0,0,w,h);c.strokeStyle='#869780';c.lineWidth=3;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#647a5d';c.textAlign='center';c.font='72px AfternoonLetter,KaiTi,serif';c.fillText('午后小铺',w/2,123);for(const x of [28,w-28]){c.fillStyle='#9e9c75';c.beginPath();c.arc(x,h/2,3,0,Math.PI*2);c.fill();}});const plaque=material('#ffffff',{map:plaqueMap,roughness:.9});box(building,.9,.34,.045,plaque,[2.7,5.56,-2.69],[0,0,-.025]);
  const table=group(root);
  box(table,10.4,.23,3.8,m.wood,[0,1.43,.38],[0,0,0],.07);
  box(table,10.25,.06,3.71,m.woodEdge,[0,1.29,.38],[0,0,0],.02);
  box(table,10.2,1.25,.15,m.sageDark,[0,.63,2.2],[0,0,0],.01);
  for(let i=0;i<22;i++)box(table,.445,1.2,.07,i%4?m.sage:m.sageDark,[-4.93+i*.47,.65,2.31],[0,0,0],.012);
  box(table,10.3,.07,.15,m.sageDark,[0,1.2,2.37]);box(table,10.3,.065,.12,m.sageDark,[0,.08,2.37]);
  const town=group(root);const townMats={houseCream:material('#dedbc0'),housePeach:material('#d9c5ae'),houseSage:material('#bcc7b0'),houseSand:material('#d0ccb4'),window:material('#899f95'),door:material('#96a08a'),terracotta:material('#b29378'),roofs:[material('#a38c78'),material('#a8a48c'),material('#b49a7c')],tree:material('#829c7d'),treeLight:material('#a2b493'),bark:material('#9b9b7e')};
  const sky=mesh(town,new THREE.PlaneGeometry(90,48),new THREE.MeshBasicMaterial({map:skyTexture(),toneMapped:false}),[0,-7,-36],[0,0,0],false);sky.receiveShadow=false;
  const mountainColors=['#bdcdb2','#aabfa5','#98b197'];
  for(let row=0;row<3;row++){const shape=new THREE.Shape();shape.moveTo(-35,-5);shape.lineTo(35,-5);shape.lineTo(35,1+row*.3);for(let x=35;x>=-35;x-=1.3)shape.lineTo(x,2.6+Math.sin(x*.13+row*2)*1.7+Math.sin(x*.37+row)*.55-row*.4);shape.closePath();mesh(town,new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:mountainColors[row]}),[0,0,-30+row*3],[0,0,0],false);}
  const rng=random(46);
  const houses=group(town,[0,-1.65,0]);houses.scale.set(.7,.7,1);
  for(let i=0;i<10;i++)house(houses,(i-4.5)*2.1,-17-rng()*1.7,1.7+rng()*.6,1.9+rng()*1.9,1.5+rng()*.6,i,townMats);
  for(let i=0;i<7;i++)house(houses,(i-3)*2.3,-11-rng()*1.2,1.7+rng()*.55,1.1+rng()*1.3,1.6+rng()*.5,i+2,townMats);
  // Counter the elevated view in the distant backdrop, revealing the sky over the rooftops.
  for(const child of town.children){if(child.material?.color&&child.geometry?.type==='ShapeGeometry')child.position.y-=5;}
  const trees=[outdoorTree(town,-3.7,-1.0,-7.9,1.0,townMats,67),outdoorTree(town,4.0,-1.0,-8.4,1.0,townMats,36)];trees.forEach(tree=>tree.userData.live=true);
  const wireMat=material('#81917d');tube(town,[[-11,4.4,-12],[-3,3.7,-13],[6,3.9,-14],[14,4.7,-14]],.013,wireMat,48);
  box(town,.085,4.8,.085,townMats.bark,[-6.7,1.7,-11.8],[0,0,0],0);box(town,.9,.05,.05,townMats.bark,[-6.7,3.9,-11.8],[0,0,0],0);
  const cloudMap=texture(512,192,(c,w,h)=>{const rng=random(19);for(let i=0;i<15;i++){const x=75+rng()*360,y=60+rng()*50,r=25+rng()*49;const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,'#fff8e5c0');g.addColorStop(.55,'#fff8e5a0');g.addColorStop(1,'#fff8e500');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}});
  const clouds=[];for(let i=0;i<4;i++){const cloud=mesh(town,new THREE.PlaneGeometry(3.3+i*.4,1.2),new THREE.MeshBasicMaterial({map:cloudMap,transparent:true,opacity:.7,depthWrite:false,toneMapped:false}),[-8+i*4.5,.5+(i%2)*.7,-23+i*.2],[0,0,0],false);cloud.userData.home=cloud.position.x;clouds.push(cloud);}
  const sunMap=texture(128,128,(c,w,h)=>{const g=c.createRadialGradient(64,64,1,64,64,64);g.addColorStop(0,'#fff6dada');g.addColorStop(.32,'#fff6dada');g.addColorStop(.42,'#fff4d25c');g.addColorStop(1,'#fff2ca00');c.fillStyle=g;c.fillRect(0,0,w,h);});mesh(town,new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:sunMap,transparent:true,opacity:.8,depthWrite:false,toneMapped:false}),[6.2,.8,-28],[0,0,0],false);
  // Warm, very soft window rays and a few motes, kept away from the lettering.
  const rayMap=texture(128,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'#fff8dc00');g.addColorStop(.45,'#fff8dc30');g.addColorStop(.55,'#fff8dc30');g.addColorStop(1,'#fff8dc00');c.fillStyle=g;c.fillRect(0,0,w,h);});
  for(const x of [-.7,1.25]){const ray=mesh(root,new THREE.PlaneGeometry(1.2,5.4),new THREE.MeshBasicMaterial({map:rayMap,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}),[x,3.3,-.8],[0,0,-.33],false);ray.receiveShadow=false;}
  const motesCount=30,positions=new Float32Array(motesCount*3);for(let i=0;i<motesCount;i++){positions[i*3]=(rng()-.3)*5;positions[i*3+1]=1.7+rng()*3;positions[i*3+2]=-1+rng()*3;}const motesGeometry=new THREE.BufferGeometry();motesGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const motes=new THREE.Points(motesGeometry,new THREE.PointsMaterial({color:'#fff1cb',size:.018,transparent:true,opacity:.5,depthWrite:false}));root.add(motes);
  optimize(building);optimize(table);optimize(town);batchStatic(building);batchStatic(town);
  return {root,cloths,clouds,trees,motes,update(time){for(const cloud of clouds)cloud.position.x=cloud.userData.home+Math.sin(time*.012+cloud.userData.home)*1.25;for(let i=0;i<trees.length;i++)trees[i].rotation.z=Math.sin(time*.3+i)*.009;for(let k=0;k<cloths.length;k++){const cloth=cloths[k],p=cloth.geometry.attributes.position,base=cloth.userData.base;for(let i=0;i<p.count;i++){const v=(base[i*3+1]+1.625)/3.25;p.setZ(i,base[i*3+2]+Math.sin(time*.85+base[i*3]*5+k)*.034*(1-v));}p.needsUpdate=true;}motes.rotation.y=Math.sin(time*.08)*.06;}};
}
