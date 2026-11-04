import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
export const content = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url), "utf8"),
);
export function validateContent() {
  const { scenes, cues } = content;
  if (scenes.length !== 7 || scenes[0].start !== 0 || scenes.at(-1).end !== 150)
    throw Error("Expected seven scenes spanning 150 seconds");
  for (let i = 0; i < scenes.length; i++)
    if (
      scenes[i].end <= scenes[i].start ||
      (i && scenes[i].start !== scenes[i - 1].end)
    )
      throw Error("Invalid scene timing");
  for (let i = 0; i < cues.length; i++)
    if (
      cues[i].start < 0 ||
      cues[i].end > 150 ||
      cues[i].end <= cues[i].start ||
      (i && cues[i].start < cues[i - 1].end)
    )
      throw Error("Invalid subtitle timing");
}
const stamp = (n) => {
  const ms = Math.round(n * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
export function subtitles() {
  validateContent();
  mkdirSync("out", { recursive: true });
  writeFileSync(
    "out/OKR_Self_Review_Explainer.srt",
    content.cues
      .map(
        (c, i) =>
          `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`,
      )
      .join("\n"),
  );
}
if (process.argv[1] === new URL(import.meta.url).pathname) subtitles();
