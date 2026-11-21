import * as THREE from 'three';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.js';

export function random(seed=17){let value=seed>>>0;return()=>{value=(1664525*value+1013904223)>>>0;return value/4294967296;};}
export function texture(width,height,draw){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;draw(canvas.getContext('2d'),width,height);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;}
export function woodTexture(){return texture(1024,512,(c,w,h)=>{
  const rng=random(221);c.fillStyle='#c3a87d';c.fillRect(0,0,w,h);
  for(let y=0;y<h;y++){c.beginPath();c.moveTo(0,y);for(let x=0;x<=w;x+=16){const offset=Math.sin(x*.009+y*.028)*2+Math.sin(x*.021+y*.019)*.75;c.lineTo(x,y+offset);}c.strokeStyle=y%11===0?'#71512f22':`rgba(${rng()>.5?'255,233,177':'110,77,37'},${.015+rng()*.07})`;c.lineWidth=.45+rng()*.8;c.stroke();}
  for(let i=0;i<12;i++){const x=rng()*w,y=rng()*h;c.save();c.translate(x,y);c.scale(1,.23);for(let r=4;r<27;r+=3){c.beginPath();c.ellipse(0,0,r*2,r,0,0,Math.PI*2);c.strokeStyle='#735b3d12';c.stroke();}c.restore();}
  for(let i=0;i<2600;i++){c.fillStyle=i%2?'#fff4d711':'#4f402708';c.fillRect(rng()*w,rng()*h,1+rng()*8,.6);}
});}
export function paintTexture(color='#c0cbb1'){return texture(256,256,(c,w,h)=>{const rng=random(73);c.fillStyle=color;c.fillRect(0,0,w,h);for(let i=0;i<3800;i++){c.fillStyle=i%3?'#ffffff09':'#233d2310';c.fillRect(rng()*w,rng()*h,1+rng()*2,1+rng()*2);}});}
export function fabricTexture(){return texture(256,256,(c,w,h)=>{c.fillStyle='#d4c9a9';c.fillRect(0,0,w,h);for(let i=0;i<w;i+=3){c.fillStyle=i%6?'#71634a27':'#fffbe344';c.fillRect(i,0,1,h);c.fillRect(0,i,w,1);}for(let y=0;y<h;y+=6)for(let x=0;x<w;x+=6){c.fillStyle='#4e5b3d30';c.fillRect(x+(y%12?2:0),y,1,2);}});}
export function paperTexture(lines=[]){return texture(768,512,(c,w,h)=>{
  const rng=random(305);c.fillStyle='#f7efd4';c.fillRect(0,0,w,h);for(let i=0;i<5000;i++){c.strokeStyle=i%3?'#8e805407':'#fffef11f';let x=rng()*w,y=rng()*h;c.beginPath();c.moveTo(x,y);c.lineTo(x+3+rng()*11,y+1);c.stroke();}
  c.fillStyle='#4e6048';c.textAlign='left';lines.forEach((line,i)=>{c.font=`${i===0?72:38}px ${i===0?'AfternoonDisplay':'AfternoonLetter'},KaiTi,serif`;c.fillText(line,76,117+i*82);});
});}
export function labelTexture(){return texture(768,384,(c,w,h)=>{c.fillStyle='#f7efd5';c.fillRect(0,0,w,h);const rng=random(11);for(let i=0;i<2600;i++){c.fillStyle='#727d4a09';c.fillRect(rng()*w,rng()*h,2,1);}c.fillStyle='#526b49';c.textAlign='center';c.font='112px AfternoonDisplay,KaiTi,serif';c.fillText('给小颖',w/2,169);c.font='38px AfternoonLetter,KaiTi,serif';c.fillText('青柠 · 好心情',w/2,256);c.strokeStyle='#82916c66';c.beginPath();c.moveTo(205,201);c.lineTo(565,201);c.stroke();});}
export function limeTexture(){return texture(512,512,(c,w,h)=>{
  const rng=random(21);c.clearRect(0,0,w,h);c.translate(256,256);c.fillStyle='#7e9d4e';c.beginPath();c.arc(0,0,252,0,Math.PI*2);c.fill();c.fillStyle='#e9e5b0';c.beginPath();c.arc(0,0,238,0,Math.PI*2);c.fill();
  for(let k=0;k<9;k++){const a=k*Math.PI*2/9;c.beginPath();c.moveTo(Math.cos(a+.05)*18,Math.sin(a+.05)*18);c.arc(0,0,220,a+.025,a+Math.PI*2/9-.025);c.closePath();const g=c.createRadialGradient(0,0,15,Math.cos(a+.3)*165,Math.sin(a+.3)*165,245);g.addColorStop(0,'#dfdf93');g.addColorStop(.6,k%2?'#d9df8f':'#cbd57c');g.addColorStop(1,'#eef0b1');c.fillStyle=g;c.fill();for(let j=0;j<38;j++){const ang=a+.06+rng()*.56,rr=25+rng()*184;c.beginPath();c.ellipse(Math.cos(ang)*rr,Math.sin(ang)*rr,3+rng()*4,1.3+rng()*2,ang,0,Math.PI*2);c.fillStyle=j%2?'#ffffd54a':'#879e5b1c';c.fill();}}
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9+.3;c.beginPath();c.ellipse(Math.cos(a)*130,Math.sin(a)*130,3,8,a,0,Math.PI*2);c.fillStyle='#f5f1ce';c.fill();}c.fillStyle='#f2efcb';c.beginPath();c.arc(0,0,15,0,Math.PI*2);c.fill();
});}
export function skyTexture(){return texture(512,512,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#adcfc6');g.addColorStop(.46,'#c9ddcb');g.addColorStop(.75,'#e8e6c6');g.addColorStop(1,'#f2e7c8');c.fillStyle=g;c.fillRect(0,0,w,h);});}
export function contactTexture(){return texture(128,128,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,3,w/2,h/2,w/2);g.addColorStop(0,'#26382151');g.addColorStop(.45,'#26382128');g.addColorStop(1,'#26382100');c.fillStyle=g;c.fillRect(0,0,w,h);});}

export function roundedGeometry(w,h,d,r=.05){r=Math.min(r,w*.25,h*.25,d*.4);const shape=new THREE.Shape();const x=-w/2,y=-h/2;shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);const geo=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.001,d-r*.4),steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:r*.2,bevelThickness:r*.2,curveSegments:5});geo.center();return geo;}
export function mesh(parent,geometry,material,position=[0,0,0],rotation=[0,0,0],cast=true){const object=new THREE.Mesh(geometry,material);object.position.set(...position);object.rotation.set(...rotation);object.castShadow=cast;object.receiveShadow=true;parent.add(object);return object;}
export function box(parent,w,h,d,mat,p=[0,0,0],r=[0,0,0],bevel=.035){return mesh(parent,bevel?roundedGeometry(w,h,d,bevel):new THREE.BoxGeometry(w,h,d),mat,p,r);}
export function ball(parent,x,y,z,mat,p=[0,0,0],r=[0,0,0],segments=24){const m=mesh(parent,new THREE.SphereGeometry(1,segments,Math.max(8,segments*.66)),mat,p,r);m.scale.set(x,y,z);return m;}
export function tube(parent,points,radius,material,segments=24){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(parent,new THREE.TubeGeometry(curve,segments,radius,6,false),material);}
export function lathe(parent,points,material,position=[0,0,0],segments=48){return mesh(parent,new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),segments),material,position);}
export function group(parent,position=[0,0,0]){const g=new THREE.Group();g.position.set(...position);parent.add(g);return g;}
export function material(color,options={}){return new THREE.MeshStandardMaterial({color,roughness:.78,...options});}
export function shadow(parent,texture,x,z,sx,sz,y=1.566){const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.65,depthWrite:false});const m=mesh(parent,new THREE.PlaneGeometry(sx,sz),mat,[x,y,z],[-Math.PI/2,0,0],false);m.receiveShadow=false;return m;}
export function optimize(root){
  for(const child of [...root.children])if(child.isGroup)optimize(child);
  root.updateMatrix();const batches=new Map();
  for(const child of root.children){if(!child.isMesh||child.isInstancedMesh||Array.isArray(child.material)||child.userData.live||child.material.transparent)continue;const key=child.material.uuid+child.castShadow+child.receiveShadow;const bucket=batches.get(key)||[];bucket.push(child);batches.set(key,bucket);}
  for(const objects of batches.values()){
    if(objects.length<3)continue;const geometries=objects.map(o=>{o.updateMatrix();let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);return g;});
    const merged=mergeGeometries(geometries,false);if(!merged)continue;const combined=new THREE.Mesh(merged,objects[0].material);combined.castShadow=objects[0].castShadow;combined.receiveShadow=objects[0].receiveShadow;root.add(combined);objects.forEach(o=>root.remove(o));geometries.forEach(g=>g.dispose());
  }
}
// Flatten static details across nested groups without consuming animated subtrees.
export function batchStatic(root){
  root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),batches=new Map();
  function collect(parent){for(const child of [...parent.children]){if(child.userData.live)continue;if(child.isGroup){collect(child);continue;}if(!child.isMesh||child.isInstancedMesh||Array.isArray(child.material)||child.material.transparent)continue;const key=child.material.uuid+child.castShadow+child.receiveShadow;const bucket=batches.get(key)||[];bucket.push(child);batches.set(key,bucket);}}
  collect(root);
  for(const objects of batches.values()){
    if(objects.length<2)continue;
    const geometries=objects.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);return g;});
    const geometry=mergeGeometries(geometries,false);if(!geometry)continue;const combined=new THREE.Mesh(geometry,objects[0].material);combined.castShadow=objects[0].castShadow;combined.receiveShadow=objects[0].receiveShadow;root.add(combined);for(const object of objects)object.removeFromParent();geometries.forEach(g=>g.dispose());
  }
}
export function makeMaterials(renderer){
  const wood=woodTexture();wood.wrapS=wood.wrapT=THREE.RepeatWrapping;wood.repeat.set(1.6,1);
  const paint=paintTexture('#c3c9b1');const linen=fabricTexture();linen.wrapS=linen.wrapT=THREE.RepeatWrapping;linen.repeat.set(2,2);
  const environment=texture(1024,512,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#d0dfd8');g.addColorStop(.45,'#c9d3c2');g.addColorStop(.5,'#f9f1d4');g.addColorStop(1,'#a6aa84');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#fff9e7';c.fillRect(90,140,130,135);c.fillStyle='#fffefa';c.fillRect(620,140,180,200);c.fillStyle='#779385';c.fillRect(330,220,80,190);});
  environment.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(environment).texture;environment.dispose();pmrem.dispose();
  return {
    env,
    wood:material('#ffffff',{map:wood,roughness:.72}),woodEdge:material('#d8bf9b',{map:wood}),
    wall:material('#fbfae9',{map:paint,roughness:1}),sage:material('#8aaf9c',{map:paint}),sageDark:material('#527c68',{map:paint}),
    cream:material('#f3efdd'),linen:material('#fffdf0',{map:linen,roughness:1,side:THREE.DoubleSide}),brass:material('#a99d72',{metalness:.68,roughness:.42}),
    glass:new THREE.MeshPhysicalMaterial({color:'#b6dcb9',roughness:.075,metalness:0,transmission:.28,thickness:.055,ior:1.46,transparent:true,opacity:.42,envMap:env,envMapIntensity:.85,side:THREE.FrontSide,depthWrite:false}),
    liquid:new THREE.MeshPhysicalMaterial({color:'#bdd47d',roughness:.18,metalness:.05,transparent:true,opacity:.64,envMap:env,envMapIntensity:.3,depthWrite:false}),
    ice:new THREE.MeshPhysicalMaterial({color:'#edf7e9',roughness:.11,metalness:.1,transparent:true,opacity:.46,envMap:env,envMapIntensity:.85,clearcoat:1,depthWrite:false}),
    droplet:new THREE.MeshPhysicalMaterial({color:'#f4f8e2',roughness:.045,metalness:.15,transparent:true,opacity:.72,envMap:env,envMapIntensity:1.3,clearcoat:1,depthWrite:false}),
    ceramic:material('#ebe8cf',{roughness:.28}),pot:material('#b38d70',{map:paint}),soil:material('#655e45'),leaf:material('#5e875c',{roughness:.92,side:THREE.DoubleSide}),leafLight:material('#8fa976',{roughness:.95,side:THREE.DoubleSide}),vein:material('#b7c291'),
    rind:material('#819749',{map:paint,roughness:.9}),limeFace:material('#ffffff',{map:limeTexture(),roughness:.6,transparent:true}),
    radio:material('#b99875',{map:paint}),radioFace:material('#d9d1b4',{roughness:.5}),radioFabric:material('#b8bd98',{map:linen}),radioDark:material('#617658'),
    cat:material('#d6bd95',{roughness:1}),catLight:material('#e5ceb0',{roughness:1}),catStripe:material('#b79a73',{roughness:1}),catPink:material('#caa797'),catInk:material('#736855'),
    contact:contactTexture(),
  };
}
