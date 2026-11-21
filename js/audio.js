export class AfternoonAudio extends EventTarget {
  constructor(config) {
    super(); this.config=config; this.context=null; this.effects=null; this.musicGain=null;
    this.buffer=null; this.source=null; this.pending=null; this.status='idle';
    this.wantsMusic=false; this.muted=false; this.offset=0; this.startedAt=0;
    this.volumeTarget=config.volume; this.lastEffect=0; this.attempt=0;
  }
  update(status) { this.status=status; this.dispatchEvent(new CustomEvent('statechange',{detail:{status,muted:this.muted,wantsMusic:this.wantsMusic}})); }
  async unlock() {
    if(!this.context){
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)throw new Error('AudioContext is unavailable');
      this.context=new AudioContext();this.effects=this.context.createGain();this.effects.gain.value=.2;this.effects.connect(this.context.destination);
      this.musicGain=this.context.createGain();this.musicGain.gain.value=0;this.musicGain.connect(this.context.destination);
    }
    if(this.context.state==='suspended')await this.context.resume();
  }
  async play() {
    this.wantsMusic=true;const attempt=++this.attempt;
    try{
      await this.unlock();
      if(!this.wantsMusic||attempt!==this.attempt)return;
      if(this.buffer){this.start();return;}
      this.update('loading');
      if(!this.pending)this.pending=this.download().finally(()=>{this.pending=null;});
      this.buffer=await this.pending;
      if(this.wantsMusic&&attempt===this.attempt)this.start();
      else if(!this.source)this.update('paused');
    }catch(error){
      console.warn('Background music:',error.message);
      if(attempt===this.attempt){this.wantsMusic=false;this.update('error');}
    }
  }
  async download(){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),this.config.downloadTimeoutMs);
    try{
      const response=await fetch(this.config.src,{signal:controller.signal,cache:'force-cache'});
      if(!response.ok)throw new Error(`Music HTTP ${response.status}`);
      const bytes=await response.arrayBuffer();if(bytes.byteLength<10000)throw new Error('Music file is incomplete');
      const buffer=await this.context.decodeAudioData(bytes);
      if(buffer.duration<10)throw new Error('Music recording is too short');
      return buffer;
    }finally{clearTimeout(timer);}
  }
  start(){
    if(!this.wantsMusic||!this.buffer||this.source)return;
    const now=this.context.currentTime;
    const source=this.context.createBufferSource();source.buffer=this.buffer;source.loop=true;source.connect(this.musicGain);
    this.musicGain.gain.cancelScheduledValues(now);this.musicGain.gain.setValueAtTime(0,now);
    this.musicGain.gain.linearRampToValueAtTime(this.muted?0:this.volumeTarget,now+this.config.fadeInSeconds);
    source.start(0,this.offset%this.buffer.duration);this.source=source;this.startedAt=now;
    this.update('playing');
  }
  pause(){
    this.wantsMusic=false;++this.attempt;
    if(this.source){this.offset=(this.offset+this.context.currentTime-this.startedAt)%this.buffer.duration;const old=this.source;this.source=null;old.stop();old.disconnect();}
    if(this.context){const now=this.context.currentTime;this.musicGain.gain.cancelScheduledValues(now);this.musicGain.gain.setValueAtTime(0,now);}
    this.update('paused');
  }
  toggle(){if(this.wantsMusic)this.pause();else this.play();}
  setMuted(muted){
    this.muted=muted;
    if(this.context){const now=this.context.currentTime;this.effects.gain.setTargetAtTime(muted?0:.2,now,.025);this.musicGain.gain.cancelScheduledValues(now);this.musicGain.gain.setTargetAtTime(muted||!this.source?0:this.volumeTarget,now,muted?.025:.2);}
    this.update(this.status);
  }
  async effect(kind){
    try{await this.unlock();}catch{return;}
    if(this.muted)return;
    const now=this.context.currentTime;if(now-this.lastEffect<.075)return;this.lastEffect=now;
    if(kind==='pop'){
      this.noise(.095,500,.85);this.tone(200,.12,.7,'sine',90);this.noise(.65,3400,.23);
    }else if(kind==='chime'){
      const base=[1046.5,1174.66,1318.51][Math.floor(Math.random()*3)];
      [1,2.01,2.76].forEach((ratio,i)=>this.tone(base*ratio,1.4-i*.18,.14/(i+1),'sine'));
    }else if(kind==='ice'){
      this.tone(1800,.25,.12,'sine');this.tone(2650,.2,.07,'sine');
    }else if(kind==='paper')this.noise(.11,1600,.075);
    else if(kind==='cat'){this.tone(95,.35,.1,'sine',70);this.noise(.25,200,.045);}
  }
  tone(frequency,duration,gain,type='sine',endFrequency){
    const ctx=this.context,now=ctx.currentTime,osc=ctx.createOscillator(),env=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency,now);if(endFrequency)osc.frequency.exponentialRampToValueAtTime(endFrequency,now+duration);
    env.gain.setValueAtTime(0,now);env.gain.linearRampToValueAtTime(gain,now+.008);env.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(env);env.connect(this.effects);osc.start(now);osc.stop(now+duration+.02);
    osc.onended=()=>{osc.disconnect();env.disconnect();};
  }
  noise(duration,cutoff,gain){
    const ctx=this.context,now=ctx.currentTime,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),env=ctx.createGain();source.buffer=buffer;
    filter.type='bandpass';filter.frequency.value=cutoff;filter.Q.value=.7;env.gain.setValueAtTime(gain,now);env.gain.exponentialRampToValueAtTime(.0001,now+duration);
    source.connect(filter);filter.connect(env);env.connect(this.effects);source.start();source.onended=()=>{source.disconnect();filter.disconnect();env.disconnect();};
  }
  snapshot(){return{status:this.status,wantsMusic:this.wantsMusic,muted:this.muted,hasBuffer:!!this.buffer,duration:this.buffer?.duration??0,offset:this.offset,contextState:this.context?.state??'none',gain:this.musicGain?.gain.value??0};}
}
