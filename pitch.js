/* Monophonic pitch detection tuned for acoustic and digital pianos. */
(() => {
  'use strict';
  function rms(buffer){
    let energy=0;
    for(let i=0;i<buffer.length;i++) energy+=buffer[i]*buffer[i];
    return Math.sqrt(energy/Math.max(1,buffer.length));
  }
  function median(values){
    const sorted=values.slice().sort((a,b)=>a-b);
    return sorted[Math.floor(sorted.length/2)];
  }
  function spectralFlux(buffer,previous){
    const bins=48;
    const step=Math.max(1,Math.floor(buffer.length/bins));
    const mags=new Float32Array(bins);
    for(let k=1;k<bins;k++){
      let re=0,im=0;
      for(let i=0;i<bins;i++){
        const sample=buffer[Math.min(buffer.length-1,i*step)];
        const angle=-2*Math.PI*k*i/bins;
        re+=sample*Math.cos(angle);
        im+=sample*Math.sin(angle);
      }
      mags[k]=Math.hypot(re,im);
    }
    let flux=0;
    if(previous){
      for(let k=1;k<bins;k++) flux+=Math.max(0,mags[k]-previous[k]);
    }
    return {flux,mags};
  }
  function yin(buffer,sampleRate){
    const n=buffer.length;
    if(n<512||!sampleRate) return null;
    const windowed=new Float32Array(n);
    for(let i=0;i<n;i++){
      const w=0.5*(1-Math.cos((2*Math.PI*i)/Math.max(1,n-1)));
      windowed[i]=buffer[i]*w;
    }
    // Focus A2–C7 (about 100–2100 Hz). The window must cover several periods of A2.
    const tauMin=Math.max(2,Math.floor(sampleRate/2100));
    const tauMax=Math.min(Math.floor(n/2)-2,Math.floor(sampleRate/95));
    if(tauMax<=tauMin+2) return null;
    const diff=new Float32Array(tauMax+1);
    const stride=n>3000?2:1;
    for(let tau=1;tau<=tauMax;tau++){
      let sum=0;
      const limit=n-tau;
      for(let i=0;i<limit;i+=stride){
        const delta=windowed[i]-windowed[i+tau];
        sum+=delta*delta;
      }
      diff[tau]=sum*stride;
    }
    const cmndf=new Float32Array(tauMax+1);
    cmndf[0]=1;
    let running=0;
    for(let tau=1;tau<=tauMax;tau++){
      running+=diff[tau];
      cmndf[tau]=running>0?(diff[tau]*tau)/running:1;
    }
    const threshold=0.15;
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
      if(bestValue>0.30) return null;
      tauEstimate=best;
    }
    // Harmonic check: a weak fundamental can make the first dip an octave too high.
    // Step down only when the longer period is a clearly deeper minimum.
    const lower=tauEstimate*2;
    if(lower<=tauMax&&cmndf[tauEstimate]>0.07){
      let dip=lower;
      const from=Math.max(tauMin,lower-2),to=Math.min(tauMax,lower+2);
      for(let tau=from;tau<=to;tau++) if(cmndf[tau]<cmndf[dip]) dip=tau;
      if(cmndf[dip]+0.03<cmndf[tauEstimate]&&cmndf[dip]<0.18&&cmndf[dip]<=cmndf[dip-1]&&cmndf[dip]<=cmndf[dip+1]) tauEstimate=dip;
    }
    const prev=cmndf[tauEstimate-1]??cmndf[tauEstimate];
    const curr=cmndf[tauEstimate];
    const next=cmndf[tauEstimate+1]??cmndf[tauEstimate];
    const denom=2*(prev-2*curr+next);
    const refined=Math.abs(denom)>1e-9?tauEstimate+(prev-next)/denom:tauEstimate;
    const frequency=sampleRate/Math.max(1,refined);
    if(!Number.isFinite(frequency)||frequency<90||frequency>2300) return null;
    return {frequency,confidence:Math.max(0,1-curr),cmndf:curr};
  }
  function nearestNote(frequency,noteTable,toleranceCents){
    const limit=toleranceCents==null?50:toleranceCents;
    let best=null;
    for(const name of Object.keys(noteTable)){
      const target=noteTable[name];
      const cents=1200*Math.log2(frequency/target);
      if(!best||Math.abs(cents)<Math.abs(best.cents)) best={name,cents,frequency:target};
    }
    if(!best||Math.abs(best.cents)>limit) return null;
    return best;
  }
  function preferExpectedOctave(frequency,expectedHz,toleranceCents){
    if(!expectedHz||!frequency) return frequency;
    let chosen=frequency;
    let best=Math.abs(1200*Math.log2(frequency/expectedHz));
    for(const candidate of [frequency/2,frequency*2]){
      if(candidate<90||candidate>2300) continue;
      const cents=Math.abs(1200*Math.log2(candidate/expectedHz));
      if(cents<=toleranceCents&&cents+15<best){chosen=candidate;best=cents;}
    }
    return chosen;
  }
  function createTracker(noteTable,options){
    const opts=options||{};
    let silent=true,trough=0,armed=true,pending=false,stable='',stableFrames=0;
    let noise=[],noiseFloor=0.008,gate=0.012,startedAt=0,fluxPrev=null;
    const history=[];
    function tolerance(){return typeof opts.getTolerance==='function'?opts.getTolerance():(opts.toleranceCents||45);}
    function expected(){return typeof opts.getExpectedHz==='function'?opts.getExpectedHz():null;}
    return {
      reset(){silent=true;trough=0;armed=true;pending=false;stable='';stableFrames=0;history.length=0;},
      push(buffer,sampleRate){
        const level=rms(buffer);
        const nowFlux=spectralFlux(buffer,fluxPrev);
        fluxPrev=nowFlux.mags;
        const frame={level,note:null,emit:null,frequency:null,cents:null,confidence:null,flux:nowFlux.flux};
        if(!startedAt) startedAt=Date.now();
        // Track the room from quiet frames only, so a note does not become the noise floor.
        if(level<=noiseFloor) noiseFloor=level;
        else if(noise.length<32 && level<noiseFloor*2.2) noise.push(level);
        if(noise.length){
          const sorted=noise.slice().sort((a,b)=>a-b);
          const quiet=sorted[Math.floor(sorted.length*0.3)];
          if(quiet<noiseFloor*3) noiseFloor=noiseFloor*0.8+quiet*0.2;
        }
        gate=Math.max(0.006,noiseFloor*3+0.004);
        const calibrateMs=opts.calibrateMs==null?1000:opts.calibrateMs;
        if(Date.now()-startedAt<calibrateMs) return frame;
        if(level<gate){
          silent=true;trough=level;armed=true;pending=false;stable='';stableFrames=0;history.length=0;
          return frame;
        }
        const rise=level>Math.max(gate*1.7,trough*1.8);
        const fluxHit=nowFlux.flux>3.5;
        if((silent&&rise)||(armed&&rise&&fluxHit)){
          pending=true;armed=false;stable='';stableFrames=0;silent=false;history.length=0;
        }
        if(level<trough) trough=level;
        if(level<gate*1.7) armed=true;
        const pitch=yin(buffer,sampleRate);
        if(!pitch) return frame;
        const centsTol=tolerance();
        const frequency=preferExpectedOctave(pitch.frequency,expected(),centsTol);
        history.push(frequency);
        if(history.length>5) history.shift();
        const smooth=history.length>=3?median(history):frequency;
        const near=nearestNote(smooth,noteTable,centsTol);
        frame.frequency=smooth;
        frame.confidence=pitch.confidence;
        frame.note=near?near.name:null;
        frame.cents=near?near.cents:null;
        if(!near||pitch.confidence<0.5){stable='';stableFrames=0;return frame;}
        if(near.name===stable) stableFrames++;
        else {stable=near.name;stableFrames=1;}
        if(pending&&stableFrames>=4&&history.length>=3){pending=false;frame.emit=near.name;}
        return frame;
      }
    };
  }
  const api={rms,yin,nearestNote,preferExpectedOctave,createTracker,spectralFlux};
  if(typeof window!=='undefined') window.SonataPitch=api;
})();
