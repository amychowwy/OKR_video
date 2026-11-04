# How to Complete Your OKR Self-Review

Editable corporate explainer built with Remotion, React, TypeScript, SVG and CSS. Seven scenes, **4,500 frames**, **150 seconds**, **1920 × 1080**, **30 FPS**, H.264 video and AAC English narration. English subtitles are burned into the video and exported as SRT.

## Latest delivery: 1.3x with a brighter female voice

Opening narration/subtitle: “To review your OKR, you'll need to assess your Key Result (KR) with two things:” followed by “its completion rate and its status.” The bottom navigation text and speed/duration label are removed.

Latest Feishu wording: “Finally, open Feishu OKR.” followed by “Go to the KR you are going to review.” Both narration and burned-in/separate subtitles use these lines. The cached-video export refreshes this caption window before retiming.

**Download:** open the [successful revised video run](https://github.com/amychowwy/OKR_video/actions/runs/41812414825), sign in to GitHub, and download **OKR_Self_Review_Explainer_1.3x_YOUNG_FEMALE** under Artifacts (5.33 MB ZIP). Includes the revised MP4, synchronized English SRT, and validation report.

The revised export is **115.4 seconds**, **3,462 frames** at 30 FPS, with new **Kokoro `af_bella` female English narration**. The intended delivery is bright, youthful and friendly, with an upbeat closing. This is newly synthesized narration, not a pitch shift of the original Flite voice. No ElevenLabs key is needed for this version.

All seven scenes and burned-in subtitles accelerate together; the separate English SRT timings are divided by 1.3. FFmpeg `atempo` preserves voice pitch. The original 150-second authoring timeline and exact company table remain available for editing. Both bottom footer labels are removed throughout the revised video; the progress bar is retained.

Run the cloud export with `node scripts/speed.mjs` after a verified 150-second MP4 is present in `out/`. It replaces the old audio with the committed new narration, accelerates picture/audio, validates voice identity/fingerprints and cue alignment, and exports `OKR_Self_Review_Explainer_1.3x_YOUNG_FEMALE.mp4`, SRT, and `speed-validation.json`.

The **Export 1.3x video (bright female voice)** Actions workflow downloads the verified original visual render and performs this conversion without rerendering all animation frames. For future visual edits, first run the original render workflow, then supply that successful run's ID to the speed workflow's manual `source_run_id` input. The earlier `CURRENT_VOICE` artifact was an interim pace check and is superseded by this female-voice version.

## Download the video in GitHub (no local tools required)

1. Open this repository's **Actions** tab.
2. Select **Render OKR self-review video**.
3. Choose **Run workflow**, select `main`, and confirm **Run workflow**.
4. Open the completed green run. Under **Artifacts**, download **OKR_Self_Review_Explainer**.
5. Extract the ZIP. It contains `OKR_Self_Review_Explainer.mp4`, `OKR_Self_Review_Explainer.srt`, `render-validation.json`, and scene proof frames.

Video-source changes pushed to `main` also start the workflow automatically. Manual execution is always available.

The workflow uses a standard GitHub-hosted Ubuntu runner, Node 24, `npm ci`, the Remotion browser, FFmpeg/FFprobe, and the official `actions/upload-artifact` action. It does not call an external rendering or TTS service. Artifact retention is 30 days. GitHub may require enabling Actions for a new repository. MP4s and render outputs are ignored by Git; no Git LFS is used.

## Verified production run

The [successful GitHub Actions run](https://github.com/amychowwy/OKR_video/actions/runs/41794047518) completed the full render and validation, and published **OKR_Self_Review_Explainer** (10.2 MB ZIP). Sign in to GitHub and download it from the run's **Artifacts** section. It includes the MP4, English SRT, FFprobe validation report, and proof frames.

The full cloud render independently passed all checks: exactly 150.000 seconds, 4,500 decoded frames, H.264, 1920 × 1080, 30 FPS, audible AAC narration and synchronized subtitle cues. See `docs/validation/` for the cloud FFprobe report, local MP4 checksum, and GitHub artifact evidence. Neither rendered MP4 is committed to Git.

## Editable content

- **`src/content.json`**: exact company table, duration options, target rates, both examples, narration/subtitle cues, scene boundaries, main colors, and font family.
- **`src/Video.tsx`**: programmatic scene graphics, table highlights, progress scales and animated Feishu UI.
- **`src/style.css`**: typography sizes, spacing, borders and supporting interface colors.
- **`src/Root.tsx`**: output dimensions, frame rate and total frames.
- **`public/audio/narration.wav`**: committed reusable Kokoro `af_bella` English female narration (24 kHz mono, about 7 MB).
- **`public/audio/manifest.json`**: content fingerprint and actual cue audio timing.
- **`scripts/narration-kokoro.py`**: regenerate the new female voice offline with `sherpa-onnx==1.12.26`, NumPy, and the official `kokoro-en-v0_19` model; the model is stored outside Git. CI reuses the committed WAV.
- **`scripts/narration.py`**: legacy Flite fallback; using it replaces the new voice with the original robotic voice.

Narration follows the supplied exact seven-scene script. The current voice is offline synthetic Kokoro `af_bella`, not a human recording or an ElevenLabs voice. The Apache-2.0 license is included in `public/audio/KOKORO-LICENSE.txt`; the legacy Flite license is retained for the fallback generator. Speaker ID 1 is documented as `af_bella` in the official Sherpa/Kokoro documentation. No secret, API key, paid service, web font or remote image is needed at render time. Replace the voice asset for a human performance if desired, keeping cue synchronization and updating its manifest.

The three reference screenshots were not available. The supplied detailed storyboard is authoritative; all graphics, table cells, cursor movements, radio buttons, progress typing and Submit interaction are recreated in code. No screenshots are used as frames.

## Cloud development commands

Use the existing checkout in `/workspace/OKR_video`; each cloud task is already isolated, so do not create a worktree unless explicitly requested.

```sh
cd /workspace/OKR_video
npm ci
npm run typecheck
npm run compositions
npm run frames
npm run render
npm run validate
npm run preview -- --host=0.0.0.0
```

`preview` launches Remotion Studio. `render` produces `out/OKR_Self_Review_Explainer.mp4` and SRT. `validate` uses FFprobe to decode/count all video frames, checks H.264, 1080p, 30 FPS, exactly 4,500 frames, AAC narration, and duration exactly 150 seconds (and never greater than 150). The render command removes AAC padding with a final audio encode and copies all H.264 frames unchanged, so container duration also stays at exactly 150 seconds. It saves the full probe and check results in `out/render-validation.json` and fails on any mismatch.

For the current cloud machine's installed Chromium:

```sh
REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium npm run frames
REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium npm run render
npm run validate
```

Without that override, install Remotion's matching browser using `npx remotion browser ensure`. The GitHub workflow does this automatically. Browser operations may need the cloud execution tool's normal network/browser sandbox permission.

After editing `src/content.json`, regenerate narration and subtitles before rendering; a stale narration fingerprint fails explicitly:

```sh
/workspace/shared/okr-voice-venv/bin/python scripts/narration-kokoro.py --model-dir /workspace/shared/okr-voice/kokoro-en-v0_19
npm run subtitles
npm run typecheck
npm run frames
npm run render
npm run validate
```

The manifest fingerprints the complete content JSON so content and narration are always reviewed together, even after a visual-only content edit. Keep the exact seven boundaries `[0,10,30,55,75,115,140,150]` for this brief. Other projects can edit the scene boundaries and cue times, but the total must remain 150 seconds unless the composition/validation contract is also intentionally revised.

The cloud model archive is downloaded from the official Sherpa-ONNX release, with source URL and SHA256 recorded in `public/audio/manifest.json`. Only the finished reusable narration is committed; the 330 MB neural model and its dictionaries remain outside the checkout.

`policy.verified` is true because the authoritative brief was supplied. It is a final-render gate for unfinished policy edits; `render:draft` is only for internal work when that flag is false.

## Company policy

The target is the expected completion at a six-month checkpoint for a newly started KR: 6 months → 100%, 1 year → 50%, 2 years → 25%. It is not a maximum achievement cap. Record actual completion in Feishu.

| Duration | Off-track | At-risk   | On-track |
| -------- | --------- | --------- | -------- |
| 6 months | <60%      | 60% - 80% | >80%     |
| 1 year   | <30%      | 30% - 40% | >40%     |
| 2 years  | <15%      | 15% - 20% | >20%     |

The published ranges are preserved exactly. No additional fractional-boundary policy is inferred. The animation does not implement a general status calculator.

Main example: a one-year KR to achieve an average of 20 training hours per colleague in 2026, target 50%, actual 35%, **At Risk**. Secondary example: six-month KR, actual 85%, **On Track**.
