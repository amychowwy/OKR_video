import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

/** Preserve every H.264 frame while removing AAC padding beyond 150 seconds. */
export function finalize(input, output) {
  if (resolve(input) === resolve(output)) throw Error("Input and output must differ");
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", "-i", input,
    "-t", "150", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-af", "atrim=duration=150,asetpts=PTS-STARTPTS", "-movflags", "+faststart",
    output,
  ], { stdio: "inherit" });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  if (!process.argv[2] || !process.argv[3]) throw Error("Usage: node scripts/finalize.mjs input.mp4 output.mp4");
  finalize(process.argv[2], process.argv[3]);
}
