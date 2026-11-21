import { CONFIG } from 'soda/config';
import { AfternoonAudio } from 'soda/audio';

// A device without WebGL still gets the full song and familiar sound controls.
export function startFallback(){
  const audio=new AfternoonAudio(CONFIG.music),music=document.querySelector('#music-toggle'),sound=document.querySelector('#sound-toggle'),begin=document.querySelector('#begin'),caption=document.querySelector('#caption');
  begin.textContent='听首歌 ↗';
  music.onclick=()=>audio.toggle();begin.onclick=()=>audio.toggle();sound.onclick=()=>{audio.unlock().catch(()=>{});audio.setMuted(!audio.muted);};
  document.body.classList.toggle('is-portrait',innerWidth<innerHeight);
  audio.addEventListener('statechange',({detail:{status,muted,wantsMusic}})=>{
    document.body.classList.toggle('is-playing',status==='playing');document.body.classList.toggle('is-loading',status==='loading');document.body.classList.toggle('is-muted',muted);
    music.setAttribute('aria-pressed',String(wantsMusic));music.setAttribute('aria-label',wantsMusic?'暂停音乐':'播放冯提莫的 What Are Words');
    sound.setAttribute('aria-pressed',String(muted));sound.setAttribute('aria-label',muted?'打开声音':'关闭声音');
    document.querySelector('#music-label').textContent=status==='playing'?'What Are Words':status==='loading'?'歌在路上…':'听首歌';
    caption.textContent=status==='playing'?'这首歌，慢慢听。':status==='loading'?'歌在路上，稍等一小会儿。':status==='error'?'歌暂时没接上，点听首歌再试一次。':'画面先停在这一帧，歌还可以听。';
  });
}
