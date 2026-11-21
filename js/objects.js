import * as THREE from 'three';
import {mesh,box,ball,tube,lathe,group,material,texture,labelTexture,paperTexture,roundedGeometry,shadow,random,optimize,batchStatic} from 'soda/art';

const TABLE=1.555;
function slice(parent,r,m,position=[0,0,0],rotation=[0,0,0]){
  const g=group(parent,position);g.rotation.set(...rotation);
  mesh(g,new THREE.CylinderGeometry(r,r,.055,48),m.rind);
  mesh(g,new THREE.CircleGeometry(r*.985,48),m.limeFace,[0,.029,0],[-Math.PI/2,0,0],false);
  mesh(g,new THREE.CircleGeometry(r*.985,48),m.limeFace,[0,-.029,0],[Math.PI/2,0,0],false);return g;
}
function makeLeafGeometry(){
  const geometry=new THREE.PlaneGeometry(1,1,12,18),a=geometry.attributes.position;
  for(let i=0;i<a.count;i++){const u=a.getX(i)*2,v=a.getY(i)+.5;const width=Math.sin(v*Math.PI)*.12*(1+Math.sin(v*85)*.045);a.setXYZ(i,u*width,v*.42,Math.sin(v*Math.PI)*.048*(1-u*u)+Math.abs(u)*.012);}
  geometry.computeVertexNormals();return geometry;
}
function makePlant(parent,m){
  const g=group(parent,[-2.6,TABLE,-.55]);
  lathe(g,[[0,0],[.22,0],[.24,.025],[.31,.38],[.34,.39],[.34,.43],[.3,.44],[.29,.4],[.27,.08],[0,.08]],m.pot);
  mesh(g,new THREE.CylinderGeometry(.29,.29,.025,32),m.soil,[0,.4,0]);shadow(g,m.contact,0,0,1.2,1.0,.011);
  const leafGeometry=makeLeafGeometry();const rng=random(421);
  for(let stem=0;stem<6;stem++){
    const angle=stem*2.4,length=.58+rng()*.35;const ex=Math.cos(angle)*.18,ez=Math.sin(angle)*.18;
    tube(g,[[0,.4,0],[ex*.5,.64,ez*.5],[ex,.4+length,ez]],.009,m.leaf,16);
    for(let j=0;j<3;j++)for(const side of [-1,1]){
      const v=.27+j*.25,leaf=group(g,[ex*v,.4+length*v,ez*v]);leaf.rotation.set(.35+rng()*.4,angle+side*Math.PI*.55,side*.7);leaf.scale.setScalar(.68+rng()*.43);
      mesh(leaf,leafGeometry,j%2?m.leaf:m.leafLight);tube(leaf,[[0,0,.002],[0,.2,.053],[0,.405,.002]],.0027,m.vein,12);
      for(let k=1;k<4;k++)for(const sign of [-1,1])tube(leaf,[[0,k*.085,.045],[sign*.056,k*.085+.032,.039],[sign*.095,k*.085+.048,.017]],.0013,m.vein,5);
    }
  }
  optimize(g);batchStatic(g);return g;
}
function makePlate(parent,m){
  const g=group(parent,[-1.08,TABLE,1.18]);
  lathe(g,[[0,.015],[.26,.015],[.28,.02],[.52,.065],[.6,.11],[.61,.13],[.59,.155],[.53,.13],[.28,.075],[0,.065]],m.ceramic);
  slice(g,.27,m,[-.15,.19,.04],[-.6,.5,-.13]);slice(g,.275,m,[.19,.21,-.035],[-.52,-.7,.13]);
  ball(g,.21,.19,.21,m.rind,[.04,.22,-.29],[0,0,0],32);
  const leaf=mesh(g,makeLeafGeometry(),m.leaf,[-.35,.13,-.18],[-1.3,.3,1.1]);leaf.scale.setScalar(.75);
  shadow(g,m.contact,0,0,1.55,1.05,.011);optimize(g);return g;
}
function makeBottle(parent,m){
  const root=group(parent,[-.17,TABLE,.32]);const body=group(root);
  const profile=[[0,.025],[.27,.025],[.32,.04],[.35,.085],[.36,.16],[.36,.94],[.353,1.03],[.32,1.12],[.24,1.23],[.15,1.32],[.123,1.39],[.123,1.61],[.14,1.63],[.14,1.665],[.10,1.665],[.1,1.59],[.1,1.4],[.127,1.35],[.22,1.25],[.295,1.12],[.325,1.02],[.329,.13],[.30,.09],[0,.09]];
  const glass=lathe(body,profile,m.glass,[0,0,0],64);glass.castShadow=false;
  const liquid=group(body);
  const fluid=lathe(liquid,[[0,.105],[.29,.105],[.326,.15],[.326,1.04],[.303,1.105],[0,1.105]],m.liquid,[0,0,0],48);fluid.castShadow=false;
  const rng=random(816),ices=[];
  for(let i=0;i<3;i++){const ice=mesh(liquid,roundedGeometry(.24,.24,.24,.035),m.ice,[(i-1)*.12,.91+(i%2)*.09,i%2?-.07:.09],[.24+i*.2,.3+i*.6,.2+i*.15],false);ice.userData.startY=ice.position.y;ices.push(ice);}
  slice(liquid,.245,m,[.03,.36,.035],[Math.PI/2-.35,.4,.2]);
  const label=new THREE.MeshBasicMaterial({map:labelTexture(),side:THREE.DoubleSide,toneMapped:false});mesh(body,new THREE.CylinderGeometry(.363,.363,.365,64,1,true,-1.0,2.0),label,[0,.66,0],[0,0,0],false);
  const beads=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),m.droplet,44);const dummy=new THREE.Object3D();
  for(let i=0;i<44;i++){const angle=rng()*Math.PI*2,r=.009+rng()*.012,y=.15+rng()*.87;dummy.position.set(Math.sin(angle)*.363,y,Math.cos(angle)*.363);dummy.scale.set(r,r*1.2,r*.45);dummy.rotation.y=angle;dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);}body.add(beads);
  const bubbleMat=new THREE.MeshBasicMaterial({color:'#f7ffdf',transparent:true,opacity:.47,depthWrite:false});const bubbles=new THREE.InstancedMesh(new THREE.SphereGeometry(1,7,5),bubbleMat,34);liquid.add(bubbles);const bubbleSeeds=Array.from({length:34},()=>[rng(),rng(),rng(),rng()]);
  const cap=group(root,[0,1.69,0]);
  mesh(cap,new THREE.CylinderGeometry(.146,.15,.075,32),m.sageDark);
  for(let i=0;i<24;i++){const angle=i/24*Math.PI*2;box(cap,.018,.065,.017,m.sage,[Math.sin(angle)*.15,-.012,Math.cos(angle)*.15],[0,angle,0],.003);}
  const capMap=texture(128,128,(c)=>{c.fillStyle='#7f9670';c.fillRect(0,0,128,128);c.strokeStyle='#d4d6ad';c.lineWidth=2;c.beginPath();c.arc(64,64,52,0,Math.PI*2);c.stroke();c.fillStyle='#f4ecd1';c.font='60px AfternoonDisplay,KaiTi,serif';c.textAlign='center';c.fillText('晴',64,83);});mesh(cap,new THREE.CircleGeometry(.139,32),material('#ffffff',{map:capMap,roughness:.45}),[0,.039,0],[-Math.PI/2,0,0],false);
  const foamPositions=new Float32Array(24*3);const foamGeometry=new THREE.BufferGeometry();foamGeometry.setAttribute('position',new THREE.BufferAttribute(foamPositions,3));const foam=new THREE.Points(foamGeometry,new THREE.PointsMaterial({color:'#fffde5',size:.028,transparent:true,opacity:0,depthWrite:false}));root.add(foam);
  shadow(root,m.contact,0,0,1.05,.9,.011);
  optimize(body);optimize(cap);
  let openedAt=-1,popAt=-10,tilt=0,targetTilt=0,lastTime=0;
  return {root,body,cap,liquid,opened:false,pop(time){if(!this.opened){this.opened=true;openedAt=time;}popAt=time;},nudge(amount){targetTilt=THREE.MathUtils.clamp(amount,-.075,.075);},update(time){
    const dt=Math.min(.05,Math.max(0,time-lastTime));lastTime=time;targetTilt*=Math.exp(-dt*5);tilt+=(targetTilt-tilt)*Math.min(1,dt*7);body.rotation.z=tilt;liquid.rotation.z=-tilt*.6;
    for(let i=0;i<ices.length;i++){const ice=ices[i];ice.position.y=ice.userData.startY+Math.sin(time*.65+i*2)*.008;ice.rotation.z=.2+i*.15+Math.sin(time*.4+i)*.018-tilt*.4;}
    for(let i=0;i<bubbleSeeds.length;i++){const[a,b,s,phase]=bubbleSeeds[i],y=.15+((time*(.055+s*.025)+phase)%1)*.88,angle=a*Math.PI*2;dummy.position.set(Math.sin(angle)*b*.27,y,Math.cos(angle)*b*.27);const r=.005+s*.006;dummy.scale.set(r,r,r);dummy.updateMatrix();bubbles.setMatrixAt(i,dummy.matrix);}bubbles.instanceMatrix.needsUpdate=true;
    if(openedAt>=0){const elapsed=time-openedAt,u=Math.min(1,elapsed/1.6);cap.position.set(.72*u,1.69*(1-u)+Math.sin(u*Math.PI)*.7+.05*u,.52*u);cap.rotation.set(u*Math.PI*1.45,u*3,.2+u*4);if(u===1)cap.rotation.set(.15,1.6,.1);}
    const e=time-popAt;if(e>=0&&e<1.7){foam.material.opacity=Math.max(0,1-e/1.7)*.65;for(let i=0;i<24;i++){const angle=i*2.4,v=.3+(i%5)*.12;foamPositions[i*3]=Math.cos(angle)*e*.23;foamPositions[i*3+1]=1.67+v*e-.22*e*e;foamPositions[i*3+2]=Math.sin(angle)*e*.23;}foamGeometry.attributes.position.needsUpdate=true;}else foam.material.opacity=0;
  }};
}
function makeRadio(parent,m){
  const root=group(parent,[2.05,TABLE,.08]);root.rotation.y=-.16;
  box(root,1.22,.74,.43,m.radio,[0,.43,0],[0,0,0],.08);box(root,1.13,.66,.032,m.radioFace,[0,.44,.226],[0,0,0],.055);
  box(root,.67,.49,.03,m.radioDark,[-.18,.43,.254],[0,0,0],.04);box(root,.615,.443,.015,m.radioFabric,[-.18,.43,.275],[0,0,0],.035);
  box(root,.31,.145,.024,m.brass,[.36,.64,.254],[0,0,0],.02);box(root,.273,.11,.015,m.cream,[.36,.642,.272],[0,0,0],.012);
  for(let i=0;i<10;i++)box(root,.008,i%3?.023:.05,.008,m.radioDark,[.244+i*.026,.645,.285],[0,0,0],0);
  const needle=box(root,.008,.08,.006,m.catStripe,[.38,.64,.292],[0,0,0],0);needle.userData.live=true;
  const dial=group(root,[.36,.34,.275]);dial.userData.live=true;mesh(dial,new THREE.CylinderGeometry(.123,.123,.048,48),m.brass,[0,0,0],[Math.PI/2,0,0]);mesh(dial,new THREE.CylinderGeometry(.103,.103,.055,48),m.ceramic,[0,0,.018],[Math.PI/2,0,0]);box(dial,.009,.04,.009,m.radioDark,[0,.061,.054],[0,0,0],0);
  const ledMaterial=new THREE.MeshStandardMaterial({color:'#a0ad83',emissive:'#e8bd75',emissiveIntensity:0,roughness:.35});const led=ball(root,.017,.017,.008,ledMaterial,[.36,.16,.258],[0,0,0],12);led.userData.live=true;
  tube(root,[[.4,.8,-.08],[.34,1.13,-.1],[.24,1.53,-.12]],.009,m.brass);ball(root,.014,.014,.014,m.brass,[.24,1.53,-.12],[0,0,0],12);
  for(const x of [-.43,.43])for(const z of [-.12,.12])box(root,.12,.075,.1,m.radioDark,[x,.035,z],[0,0,0],.012);
  for(let i=0;i<3;i++)box(root,.12,.035,.1,m.cream,[-.23+i*.16,.82,-.04],[0,0,0],.012);
  shadow(root,m.contact,0,0,1.7,.9,.011);optimize(root);batchStatic(root);
  return{root,playing:false,update(time){ledMaterial.emissiveIntensity=this.playing?.65+Math.sin(time*1.2)*.06:0;ledMaterial.color.set(this.playing?'#e4c48b':'#a0ad83');needle.position.x=.36+(this.playing?Math.sin(time*.17)*.065:0);dial.rotation.z=this.playing?Math.sin(time*.28)*.025:0;}};
}
function makeChime(parent,m){
  const root=group(parent,[2.65,5.15,-1.9]);const swing=group(root);
  tube(swing,[[0,0,0],[0,-.34,0]],.005,m.brass);
  const bell=lathe(swing,[[.21,-.65],[.22,-.61],[.205,-.48],[.16,-.39],[.095,-.35],[0,-.34],[.08,-.37],[.145,-.42],[.185,-.5],[.198,-.62]],m.glass);bell.castShadow=false;
  mesh(swing,new THREE.TorusGeometry(.208,.009,8,48),m.ice,[0,-.645,0],[Math.PI/2,0,0],false);
  tube(swing,[[0,-.4,0],[0,-.87,0]],.003,m.brass);ball(swing,.023,.037,.023,m.brass,[0,-.61,0],[0,0,0],16);
  const map=texture(128,384,(c,w,h)=>{c.fillStyle='#efe6c6';c.fillRect(0,0,w,h);c.fillStyle='#67866a';c.font='68px AfternoonDisplay,KaiTi,serif';c.textAlign='center';c.fillText('晴',64,170);c.strokeStyle='#b7bf942a';for(let i=0;i<40;i++){c.beginPath();c.moveTo(i*4,0);c.lineTo(i*4+2,h);c.stroke();}});
  const paperGeometry=new THREE.PlaneGeometry(.16,.48,4,16);const pos=paperGeometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getY(i)*8)*.015);paperGeometry.computeVertexNormals();mesh(swing,paperGeometry,material('#ffffff',{map,side:THREE.DoubleSide,roughness:1}),[0,-1.1,0],[0,.15,-.04],false);
  optimize(swing);let hitAt=-100;
  return{root,swing,ring(time){hitAt=time;},update(time){const age=time-hitAt,damping=Math.exp(-age*1.45);swing.rotation.z=Math.sin(time*.55)*.017+(age<5?Math.sin(age*12.5)*.35*damping:0);swing.rotation.x=Math.sin(time*.45)*.012+(age<5?Math.sin(age*9)*.07*damping:0);}};
}
function makeCat(parent,m){
  const root=group(parent,[-2.12,TABLE,1.29]);root.rotation.y=.14;const body=group(root);
  ball(body,.59,.235,.34,m.cat,[0,.235,0]);ball(body,.45,.18,.31,m.catLight,[-.12,.14,.12]);
  const head=group(body,[-.43,.3,.17]);ball(head,.255,.205,.22,m.catLight);
  for(const side of [-1,1]){
    const ear=mesh(head,new THREE.ConeGeometry(.125,.25,3),m.cat,[side*.16,.185,-.016],[0,side*.25,side*-.2]);ear.scale.z=.65;
    const triangle=new THREE.Shape();triangle.moveTo(-.07,0);triangle.lineTo(.07,0);triangle.lineTo(0,.15);triangle.closePath();mesh(head,new THREE.ShapeGeometry(triangle),m.catPink,[side*.16,.1,.055],[0,side*.05,-side*.2]);
    ball(body,.135,.075,.15,m.catLight,[-.39+side*.14,.075,.34]);
  }
  const closed=group(head),opened=group(head);opened.visible=false;
  for(const side of [-1,1]){
    tube(closed,[[side*.1-.045,.005,.205],[side*.1,-.016,.227],[side*.1+.045,.005,.205]],.006,m.catInk,12);
    ball(opened,.025,.037,.012,m.catInk,[side*.1,.008,.219],[0,0,0],16);ball(opened,.006,.009,.004,m.cream,[side*.1-.005,.02,.23],[0,0,0],8);
    for(let i=0;i<3;i++)tube(head,[[side*.13,-.06+i*.02,.18],[side*.25,-.065+i*.035,.21],[side*.36,-.065+i*.045,.2]],.0017,m.catStripe,10);
  }
  ball(head,.022,.015,.014,m.catPink,[0,-.052,.216],[0,0,0],16);tube(head,[[0,-.065,.215],[0,-.088,.213],[-.025,-.095,.2]],.003,m.catInk,10);tube(head,[[0,-.088,.213],[.025,-.095,.2]],.003,m.catInk,8);
  for(let i=0;i<3;i++)tube(head,[[-.065+i*.06,.17,.13],[-.065+i*.06,.135,.18],[-.065+i*.06,.105,.195]],.012,m.catStripe,12);
  for(let i=0;i<4;i++)tube(body,[[-.13+i*.14,.43,-.09],[-.11+i*.14,.46,.03],[-.1+i*.14,.405,.18]],.015,m.catStripe,14);
  const tail=group(body,[.36,.14,.11]);tube(tail,[[0,0,0],[.22,.02,.14],[.26,-.025,.32],[.12,-.05,.42],[-.1,-.06,.38],[-.21,-.045,.28]],.062,m.cat,32);ball(tail,.061,.061,.061,m.catLight,[-.21,-.045,.28]);
  shadow(root,m.contact,0,0,1.9,1.15,.011);optimize(body);let petAt=-100;
  return{root,body,head,pet(time){petAt=time;},update(time){const age=time-petAt,awake=age<2.9;opened.visible=awake;closed.visible=!awake;body.scale.y=1+Math.sin(time*1.65)*.012;head.rotation.z=awake?-Math.sin(Math.min(age,1)*Math.PI/2)*.105:0;head.position.y=.3+(awake?Math.sin(Math.min(age,1)*Math.PI/2)*.035:0);tail.rotation.y=awake?Math.sin(age*3.5)*.11:Math.sin(time*.3)*.009;}};
}
function makeNote(parent,m){
  const root=group(parent,[1.0,TABLE+.008,1.49]);root.rotation.y=-.21;
  const geometry=new THREE.PlaneGeometry(1.0,.69,12,12),a=geometry.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i);a.setZ(i,.006*Math.sin(x*6)+Math.max(0,x-.28)*Math.max(0,-y-.13)*3);}
  geometry.computeVertexNormals();const paper=material('#ffffff',{map:paperTexture(['给小颖','这首歌，觉得你会喜欢。']),roughness:1,side:THREE.DoubleSide});mesh(root,geometry,paper,[0,.012,0],[-Math.PI/2,0,0]);
  const stone=material('#a9b6a1',{roughness:.7});ball(root,.09,.035,.065,stone,[-.36,.047,-.24],[0,.4,0]);shadow(root,m.contact,0,0,1.3,1.1,.003);return root;
}
export function createObjects(scene,m){
  const root=group(scene),bottle=makeBottle(root,m),chime=makeChime(root,m),cat=makeCat(root,m),radio=makeRadio(root,m),note=makeNote(root,m),plant=makePlant(root,m),plate=makePlate(root,m);
  const positions={bottle:bottle.root.position.clone(),cat:cat.root.position.clone(),radio:radio.root.position.clone(),note:note.position.clone(),plant:plant.position.clone(),plate:plate.position.clone()};
  const anchors={bottle:new THREE.Object3D(),chime:new THREE.Object3D(),cat:new THREE.Object3D(),radio:new THREE.Object3D(),note:new THREE.Object3D()};
  bottle.root.add(anchors.bottle);anchors.bottle.position.set(0,1.68,.04);
  chime.root.add(anchors.chime);anchors.chime.position.set(0,-.55,.1);
  cat.root.add(anchors.cat);anchors.cat.position.set(-.35,.42,.31);
  radio.root.add(anchors.radio);anchors.radio.position.set(.35,.4,.32);
  note.add(anchors.note);anchors.note.position.set(0,.03,.08);
  return {root,bottle,chime,cat,radio,note,plant,plate,anchors,
    responsive(narrow){for(const [name,pos] of Object.entries(positions)){const object=name==='bottle'?bottle.root:name==='cat'?cat.root:name==='radio'?radio.root:name==='note'?note:name==='plant'?plant:plate;object.position.copy(pos);if(narrow)object.position.x*=.6;}if(narrow){radio.root.position.z=-.13;radio.root.scale.setScalar(.9);cat.root.scale.setScalar(.91);note.scale.setScalar(.88);plant.scale.setScalar(.87);plate.scale.setScalar(.83);}else{for(const object of [radio.root,cat.root,note,plant,plate])object.scale.setScalar(1);}},
    update(time){bottle.update(time);chime.update(time);cat.update(time);radio.update(time);},
  };
}
