/* Monophonic pitch detection for acoustic and digital pianos. */
(() => {
  'use strict';
  function rms(buffer){
    let energy=0;
    for(let i=0;i<buffer.length;i++) energy+=buffer[i]*buffer[i];
    return Math.sqrt(energy/Math.max(1,buffer.length));
  }
  function yin(buffer,sampleRate){
    const n=buffer.length;
    if(n<256||!sampleRate) return null;
    const windowed=new Float32Array(n);
    for(let i=0;i<n;i++){
      const w=0.5*(1-Math.cos((2*Math.PI*i)/Math.max(1,n-1)));
      windowed[i]=buffer[i]*w;
    }
    const tauMin=Math.max(2,Math.floor(sampleRate/980));
    const tauMax=Math.min(Math.floor(n/2)-1,Math.floor(sampleRate/220));
    if(tauMax<=tauMin) return null;
    const diff=new Float32Array(tauMax+1);
    for(let tau=1;tau<=tauMax;tau++){
      let sum=0;
      const limit=n-tau;
      for(let i=0;i<limit;i++){
        const delta=windowed[i]-windowed[i+tau];
        sum+=delta*delta;
      }
      diff[tau]=sum;
    }
    const cmndf=new Float32Array(tauMax+1);
    cmndf[0]=1;
    let running=0;
    for(let tau=1;tau<=tauMax;tau++){
      running+=diff[tau];
      cmndf[tau]=running>0?(diff[tau]*tau)/running:1;
    }
    const threshold=0.12;
    let tauEstimate=-1;
    for(let tau=tauMin;tau<=tauMax;tau++){
      if(cmndf[tau]<threshold){
        while(tau+1<=tauMax&&cmndf[tau+1]<cmndf[tau]) tau++;
        tauEstimate=tau;
        break;
      }
    }
    if(tauEstimate<0){
      let best=tauMin,bestValue=Infinity;
      for(let tau=tauMin;tau<=tauMax;tau++) if(cmndf[tau]<bestValue){bestValue=cmndf[tau];best=tau;}
      if(bestValue>0.32) return null;
      tauEstimate=best;
    }
    const prev=cmndf[tauEstimate-1]??cmndf[tauEstimate];
    const curr=cmndf[tauEstimate];
    const next=cmndf[tauEstimate+1]??cmndf[tauEstimate];
    const denom=2*(prev-2*curr+next);
    const refined=Math.abs(denom)>1e-9?tauEstimate+(prev-next)/denom:tauEstimate;
    const frequency=sampleRate/Math.max(1,refined);
    if(!Number.isFinite(frequency)||frequency<200||frequency>1100) return null;
    return {frequency,confidence:Math.max(0,1-curr)};
  }
  function nearestNote(frequency,noteTable){
    let best=null;
    for(const name of Object.keys(noteTable)){
      const target=noteTable[name];
      const cents=1200*Math.log2(frequency/target);
      if(!best||Math.abs(cents)<Math.abs(best.cents)) best={name,cents,frequency:target};
    }
    return best;
  }
  function createTracker(noteTable){
    const gate=0.012;
    let silent=true,trough=0,armed=true,pending=false,stable='',stableFrames=0;
    return {
      reset(){silent=true;trough=0;armed=true;pending=false;stable='';stableFrames=0;},
      push(buffer,sampleRate){
        const level=rms(buffer);
        const frame={level,note:null,emit:null,frequency:null,cents:null};
        if(level<gate){
          silent=true;trough=level;armed=true;pending=false;stable='';stableFrames=0;
          return frame;
        }
        const attack=silent||(armed&&level>Math.max(0.02,trough*2.2));
        if(attack){pending=true;armed=false;stable='';stableFrames=0;silent=false;}
        if(level<trough) trough=level;
        if(level<0.02) armed=true;
        const pitch=yin(buffer,sampleRate);
        if(!pitch) return frame;
        const near=nearestNote(pitch.frequency,noteTable);
        frame.frequency=pitch.frequency;
        frame.note=near?near.name:null;
        frame.cents=near?near.cents:null;
        if(!near||Math.abs(near.cents)>40||pitch.confidence<0.55){
          stable='';stableFrames=0;
          return frame;
        }
        if(near.name===stable) stableFrames++;
        else {stable=near.name;stableFrames=1;}
        if(pending&&stableFrames>=3){pending=false;frame.emit=near.name;}
        return frame;
      }
    };
  }
  const api={rms,yin,nearestNote,createTracker};
  if(typeof window!=='undefined') window.SonataPitch=api;
})();
