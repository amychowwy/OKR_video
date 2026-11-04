"""Generate reusable bright female English narration offline (Kokoro af_bella).
Requires: sherpa-onnx==1.12.26, numpy; official kokoro-en-v0_19 model archive.
The model is kept outside Git. Only the finished WAV, manifest, and license are committed.
"""
import argparse, hashlib, json, pathlib, subprocess, tempfile, wave
import numpy as np
import sherpa_onnx

parser=argparse.ArgumentParser()
parser.add_argument('--model-dir',type=pathlib.Path,required=True)
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
content_path=root/'src/content.json'
content=json.loads(content_path.read_text())
model=args.model_dir
config=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=str(model/'model.onnx'),voices=str(model/'voices.bin'),tokens=str(model/'tokens.txt'),data_dir=str(model/'espeak-ng-data')),num_threads=2,provider='cpu'),max_num_sentences=1)
if not config.validate():raise RuntimeError('Invalid Kokoro model configuration')
tts=sherpa_onnx.OfflineTts(config)
rate=24000
samples=np.zeros(rate*150,dtype=np.float32)
records=[]
with tempfile.TemporaryDirectory(prefix='okr-bella-') as temp:
 temp=pathlib.Path(temp)
 for i,cue in enumerate(content['cues']):
  # Speak the letters clearly; pronunciation changes do not change subtitle wording.
  text=cue['text'].replace('OKR','O K R').replace('KR','K R').replace('Feishu','Fay shoo')
  if text=="That's it. Check the duration, assess your progress,":text="That's it! Check the duration, assess your progress,"
  generated=tts.generate(text,sid=1,speed=.95)
  audio=np.asarray(generated.samples,dtype=np.float32)
  if not len(audio) or generated.sample_rate!=rate:raise RuntimeError('Speech generation failed')
  slot=cue['end']-cue['start'];duration=len(audio)/rate
  fit=max(1.,duration/(slot-.08))
  if fit>1.3:raise RuntimeError(f'Cue {i+1} would be too rushed: {fit:.3f}x')
  if fit>1:
   raw=temp/f'{i}.wav';fitted=temp/f'{i}-fit.wav'
   sherpa_onnx.write_wave(str(raw),audio,rate)
   subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(raw),'-af',f'atempo={fit:.9f}','-ar',str(rate),'-ac','1','-c:a','pcm_s16le',str(fitted)],check=True)
   with wave.open(str(fitted)) as w:audio=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32)/32768.
  if len(audio)>round(slot*rate):raise RuntimeError(f'Cue {i+1} exceeds its subtitle slot')
  fade=min(120,len(audio)//2)
  audio[:fade]*=np.linspace(0,1,fade);audio[-fade:]*=np.linspace(1,0,fade)
  start=round(cue['start']*rate);samples[start:start+len(audio)]=audio
  records.append({'cue':i+1,'start':cue['start'],'end':cue['start']+len(audio)/rate,'speed':round(fit,4)})
  print(f'Generated cue {i+1}/{len(content["cues"])}: {len(audio)/rate:.2f}s in {slot:.2f}s',flush=True)
peak=float(np.max(np.abs(samples)))
if not np.isfinite(peak) or peak<=0:raise RuntimeError('Silent or invalid narration')
samples*=.84/peak
out=root/'public/audio';out.mkdir(exist_ok=True,parents=True)
with wave.open(str(out/'narration.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes((np.clip(samples,-1,1)*32767).astype('<i2').tobytes())
manifest={'engine':'Kokoro via sherpa-onnx 1.12.26','voice':'af_bella','speakerId':1,'delivery':'Bright, expressive female English narration; smile and upbeat closing; final playback 1.3x with pitch preserved','model':'kokoro-en-v0_19','modelSource':'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-en-v0_19.tar.bz2','modelArchiveSha256':'912804855a04745fa77a30be545b3f9a5d15c4d66db00b88cbcd4921df605ac7','license':'Apache-2.0','sampleRate':rate,'contentSha256':hashlib.sha256(content_path.read_bytes()).hexdigest(),'audioSha256':hashlib.sha256((out/'narration.wav').read_bytes()).hexdigest(),'cues':records}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(out/'KOKORO-LICENSE.txt').write_text((model/'LICENSE').read_text())
print('Generated complete 150-second reusable af_bella narration. Export at 1.3x for delivery.',flush=True)
