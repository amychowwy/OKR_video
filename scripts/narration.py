"""Generate reusable offline narration with the locally installed FFmpeg Flite voice.
No network calls or secrets. Each subtitle cue is synthesized and fitted to its slot.
"""
import json, pathlib, subprocess, tempfile, wave, array, hashlib
root = pathlib.Path(__file__).resolve().parents[1]
content_path=root/'src/content.json'
content=json.loads(content_path.read_text())
out=root/'public/audio'
out.mkdir(parents=True, exist_ok=True)
rate=24000
samples=array.array('h',[0])*(150*rate)
records=[]
def run(args):
 subprocess.run(args,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
with tempfile.TemporaryDirectory(prefix='okr-narration-') as temp:
 temp=pathlib.Path(temp)
 for i,cue in enumerate(content['cues']):
  text=temp/f'{i}.txt';text.write_text(cue['text'])
  raw=temp/f'{i}.wav'; fitted=temp/f'{i}-fitted.wav'
  run(['ffmpeg','-y','-f','lavfi','-i',f'flite=textfile={text}:voice=slt','-ar',str(rate),'-ac','1',str(raw)])
  with wave.open(str(raw)) as w: duration=w.getnframes()/w.getframerate()
  slot=cue['end']-cue['start']
  speed=max(1.0,duration/(slot-.12))
  filters=[]; remainder=speed
  while remainder>2:filters.append('atempo=2');remainder/=2
  filters.extend([f'atempo={remainder:.8f}','afade=t=in:st=0:d=0.015',f'afade=t=out:st={max(0,duration/speed-.04):.6f}:d=0.04'])
  run(['ffmpeg','-y','-i',str(raw),'-af',','.join(filters),'-ar',str(rate),'-ac','1','-c:a','pcm_s16le',str(fitted)])
  with wave.open(str(fitted)) as w: audio=array.array('h',w.readframes(w.getnframes()))
  start=round(cue['start']*rate)
  if len(audio)>round(slot*rate):raise RuntimeError('Narration exceeds subtitle slot')
  samples[start:start+len(audio)]=audio
  records.append({'cue':i+1,'start':cue['start'],'end':cue['start']+len(audio)/rate,'speed':round(speed,3)})
with wave.open(str(out/'narration.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(samples.tobytes())
manifest={'engine':'FFmpeg libflite','voice':'slt','sampleRate':rate,'contentSha256':hashlib.sha256(content_path.read_bytes()).hexdigest(),'cues':records}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Generated 150 seconds of offline narration ({len(records)} cues).')
