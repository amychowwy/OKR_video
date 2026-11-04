import { finalize } from "./finalize.mjs";
import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import { mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { content, subtitles } from "./subtitles.mjs";
const mode = process.argv[2] ?? "final";
if (!["frames", "draft", "final"].includes(mode))
  throw Error("Expected frames, draft, or final");
if (mode === "final" && !content.policy.verified)
  throw Error(
    "Official policy/brief must be verified before final delivery. Use render:draft only for internal review.",
  );
const hash = createHash("sha256")
  .update(readFileSync("src/content.json"))
  .digest("hex");
const manifest = JSON.parse(readFileSync("public/audio/manifest.json", "utf8"));
if (manifest.contentSha256 !== hash)
  throw Error(
    "Narration is stale. Regenerate it with python3 scripts/narration.py.",
  );
subtitles();
mkdirSync("out/frames", { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const serveUrl = await bundle({
  entryPoint: resolve("src/index.ts"),
  onProgress: () => {},
});
const options = {
  serveUrl,
  id: "OKRSelfReview",
  browserExecutable,
  chromiumOptions: { gl: "swangle" },
};
const composition = await selectComposition(options);
if (
  composition.durationInFrames !== 4500 ||
  composition.fps !== 30 ||
  composition.width !== 1920 ||
  composition.height !== 1080
)
  throw Error("Composition contract mismatch");
if (mode === "frames") {
  for (let i = 0; i < content.scenes.length; i++) {
    const s = content.scenes[i];
    const frame = (s.start + Math.min((s.end - s.start) / 2, 12)) * 30;
    await renderStill({
      ...options,
      composition,
      frame,
      output: `out/frames/scene-${i + 1}.png`,
    });
    console.log(`Rendered scene ${i + 1}, frame ${frame}`);
  }
  // Show all duration choices, the target timeline, table, and both Feishu edit states.
  for (const [name, frame] of [
    ["duration-options", 390],
    ["target-timeline", 1500],
    ["status-secondary", 3270],
    ["feishu-edit", 3750],
    ["feishu-saved", 4160],
  ])
    await renderStill({
      ...options,
      composition,
      frame,
      output: `out/frames/${name}.png`,
    });
} else {
  const outputLocation =
    mode === "final"
      ? "out/OKR_Self_Review_Explainer.mp4"
      : "out/OKR_Self_Review_Explainer_DRAFT.mp4";
  const rawOutput = outputLocation + ".render.mp4";
  let last = -1;
  await renderMedia({
    ...options,
    composition,
    codec: "h264",
    audioCodec: "aac",
    pixelFormat: "yuv420p",
    crf: 18,
    outputLocation: rawOutput,
    concurrency: 2,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10) * 10;
      if (p !== last) {
        last = p;
        console.log(`Render ${p}%`);
      }
    },
  });
  // AAC priming/padding can extend Remotion's container past the last video frame.
  // Copy all H.264 frames unchanged and encode exactly 150 seconds of audio.
  finalize(rawOutput, outputLocation);
  unlinkSync(rawOutput);
  console.log(outputLocation);
}
