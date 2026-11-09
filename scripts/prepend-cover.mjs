import {execFileSync} from 'node:child_process';
export function prependCover(input,output,seconds,image='public/cover/OKR_Self_Review_Cover.png'){
 if(seconds<=0||!Number.isInteger(seconds*30))throw Error('Cover duration must be a positive whole number of frames.');
 const intro=output+'.intro.mp4';
 const source=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-of','json',input],{encoding:'utf8'}));
 const video=source.streams.find(s=>s.codec_type==='video');
 const total=Number(video.nb_frames)/30+seconds;
 execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-loop','1','-i',image,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',String(seconds),'-vf','format=yuv420p','-r','30','-c:v','libx264','-preset','fast','-crf','18','-c:a','aac',intro],{stdio:'inherit'});
 execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',intro,'-i',input,'-filter_complex',`[0:v]trim=duration=${seconds},setpts=PTS-STARTPTS[v0];[0:a]atrim=duration=${seconds},asetpts=PTS-STARTPTS[a0];[v0][a0][1:v][1:a]concat=n=2:v=1:a=1[v][a]`,'-map','[v]','-map','[a]','-t',String(total),'-r','30','-fps_mode','cfr','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',output],{stdio:'inherit'});
}
