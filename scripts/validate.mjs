import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { content, validateContent } from "./subtitles.mjs";
validateContent();
const file = process.argv[2] ?? "out/OKR_Self_Review_Explainer.mp4";
const probe = JSON.parse(
  execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-count_frames",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      file,
    ],
    { encoding: "utf8" },
  ),
);
const video = probe.streams.find((s) => s.codec_type === "video"),
  audio = probe.streams.find((s) => s.codec_type === "audio");
const manifest = JSON.parse(readFileSync("public/audio/manifest.json", "utf8"));
const volume = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-vn", "-af", "volumedetect", "-f", "null", "-"], {encoding: "utf8"});
if (volume.status !== 0) throw Error("Encoded narration could not be decoded: " + volume.stderr);
const meanVolume = Number(volume.stderr.match(/mean_volume: (-?[\d.]+) dB/)?.[1]);
const peakVolume = Number(volume.stderr.match(/max_volume: (-?[\d.]+) dB/)?.[1]);
const checks = {
  audibleNarration: Number.isFinite(meanVolume) && meanVolume > -45 && Number.isFinite(peakVolume),
  narrationCueAlignment: manifest.cues.length === content.cues.length && manifest.cues.every((c,i)=>c.start === content.cues[i].start && c.end <= content.cues[i].end),
  h264: video?.codec_name === "h264",
  resolution: video?.width === 1920 && video?.height === 1080,
  fps: video?.r_frame_rate === "30/1",
  frameCount: Number(video?.nb_read_frames) === 4500,
  duration: Number(probe.format.duration) === 150,
  notLongerThan150: Number(probe.format.duration) <= 150,
  aacNarration: audio?.codec_name === "aac" && Number(audio?.duration) >= 149.9,
  narrationCurrent:
    manifest.contentSha256 ===
    createHash("sha256").update(readFileSync("src/content.json")).digest("hex"),
  subtitleCueCount:
    readFileSync("out/OKR_Self_Review_Explainer.srt", "utf8").split(" --> ")
      .length -
      1 ===
    content.cues.length,
};
const report = {
  file,
  generatedAt: new Date().toISOString(),
  policyVerified: content.policy.verified,
  checks,
  passed: Object.values(checks).every(Boolean),
  audioLevelDb: {mean: meanVolume, peak: peakVolume},
  ffprobe: probe,
};
writeFileSync(
  "out/render-validation.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(checks, null, 2));
if (!report.passed) process.exitCode = 1;
