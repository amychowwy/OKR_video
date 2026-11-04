import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {content,validateContent} from './subtitles.mjs';

validateContent();
const delivery=JSON.parse(readFileSync('delivery.json','utf8'));
const speed=delivery.playbackRate;
if(speed!==1.3)throw Error('This delivery is approved for 1.3x playback.');
const input=process.argv[2]??'out/OKR_Self_Review_Explainer.mp4';
const newVoice=delivery.voice.status==='ready';
const stem='out/OKR_Self_Review_Explainer_1.3x_'+(newVoice?'YOUNG_FEMALE':'CURRENT_VOICE');
const output=stem+'.mp4';
if(resolve(input)===resolve(output))throw Error('Input and output must differ.');
const probe=(file)=>JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],{encoding:'utf8'}));
const source=probe(input);
const sourceVideo=source.streams.find(s=>s.codec_type==='video');
if(Number(sourceVideo?.nb_read_frames)!==4500||Number(source.format.duration)!==150)throw Error('Expected original 150-second, 4500-frame source; refusing to accelerate an already accelerated file.');
mkdirSync('out',{recursive:true});
const manifest=JSON.parse(readFileSync('public/audio/manifest.json','utf8'));
if(newVoice){
 if(manifest.voice!==delivery.voice.speaker||manifest.audioSha256!==createHash('sha256').update(readFileSync(delivery.voice.asset)).digest('hex')||manifest.contentSha256!==createHash('sha256').update(readFileSync('src/content.json')).digest('hex'))throw Error('New narration identity or fingerprint mismatch.');
 if(manifest.cues.length!==content.cues.length||!manifest.cues.every((c,i)=>c.start===content.cues[i].start&&c.end<=content.cues[i].end))throw Error('New narration and subtitle timing mismatch.');
}
const inputArgs=newVoice?['-i',input,'-i',delivery.voice.asset,'-map','0:v:0','-map','1:a:0']:['-i',input];
// Replace the original burned-in 02:30 footer with the accelerated delivery label.
// Refresh revised captions in the cached original visual render before retiming.
const window=delivery.captionPatchWindow;
const patches=window?content.cues.filter(c=>c.start>=window.start&&c.end<=window.end):[];
const captionFilters=[];
if(window){
 captionFilters.push(`drawbox=x=150:y=900:w=1620:h=108:color=0xF4F7FB:t=fill:enable='gte(t,${window.start})*lt(t,${window.end})'`);
 patches.forEach((cue,i)=>{
  const file=resolve(`out/caption-patch-${i}.txt`);writeFileSync(file,cue.text);
  captionFilters.push(`drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=${file}:fontsize=27:fontcolor=white:box=1:boxcolor=0x132B4D@0.96:boxborderw=12:x=(w-text_w)/2:y=945:enable='gte(t,${cue.start})*lt(t,${cue.end})'`);
 });
}
const rangeFilter=sourceVideo.color_range==='pc'?'scale=in_range=full:out_range=limited,format=yuv420p,':'';
const filter=`${rangeFilter}${captionFilters.length?captionFilters.join(',')+',':''}setpts=(PTS-STARTPTS)/${speed},fps=30,drawbox=x=1600:y=1010:w=320:h=60:color=0xF4F7FB:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='1.3x | 01m55s':fontsize=18:fontcolor=0x647B97:x=1660:y=1028`;
execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error',...inputArgs,'-vf',filter,'-af',`atempo=${speed},loudnorm=I=-16:TP=-2:LRA=7`,'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-color_range','tv','-c:a','aac','-ar','48000','-ac','2','-b:a','192k','-movflags','+faststart',output],{stdio:'inherit'});
const stamp=n=>{const ms=Math.round(n*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
writeFileSync(stem+'.srt',content.cues.map((c,i)=>`${i+1}\n${stamp(c.start/speed)} --> ${stamp(c.end/speed)}\n${c.text}\n`).join('\n'));
const result=probe(output),video=result.streams.find(s=>s.codec_type==='video'),audio=result.streams.find(s=>s.codec_type==='audio');
const frames=Math.ceil(4500/speed),duration=frames/30;
const loudness=spawnSync('ffmpeg',['-hide_banner','-i',output,'-vn','-af','volumedetect','-f','null','-'],{encoding:'utf8'});
if(loudness.status!==0)throw Error('Unable to decode the narration');
const meanDb=Number(loudness.stderr.match(/mean_volume: (-?[\d.]+) dB/)?.[1]);
const peakDb=Number(loudness.stderr.match(/max_volume: (-?[\d.]+) dB/)?.[1]);
const checks={audibleNarration:Number.isFinite(meanDb)&&meanDb>-45,notClipped:Number.isFinite(peakDb)&&peakDb<0,newVoicePresent:!newVoice||manifest.voice==='af_bella',h264:video?.codec_name==='h264',resolution:video?.width===1920&&video?.height===1080,fps:video?.r_frame_rate==='30/1',frames:Number(video?.nb_read_frames)===frames,duration:Math.abs(Number(result.format.duration)-duration)<.001,aac:audio?.codec_name==='aac',audioSync:Math.abs(Number(audio?.duration)-duration)<=1/30,subtitles:content.cues.every(c=>c.end/speed<=duration)};
const report={captionPatches:patches,file:output,playbackRate:speed,sourceFrames:4500,expectedFrames:frames,expectedDuration:duration,voiceStatus:delivery.voice.status,requestedVoiceComplete:newVoice,voiceNote:delivery.voice.description??delivery.voice.current,voice:manifest.voice,audioLevelDb:{mean:meanDb,peak:peakDb},checks,passed:Object.values(checks).every(Boolean),ffprobe:result};
writeFileSync('out/speed-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({file:output,checks,duration:result.format.duration,voiceStatus:report.voiceStatus},null,2));
if(!report.passed)process.exitCode=1;
