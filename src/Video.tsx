import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import data from "./content.json";
import "./style.css";
const t = data.theme;
const policy = data.policy;
const example = policy.mainExample;
const secondary = policy.secondaryExample;
const mainDurationIndex = policy.durationOptions.indexOf(example.duration);
const percent = (n: number) => `${n}%`;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Card: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties; className?: string }>
> = ({ children, style, className = "" }) => (
  <div className={`card ${className}`} style={style}>
    {children}
  </div>
);

const KRCard = () => (
  <div className="kr-summary">
    <span className="kr-badge">KR1</span>
    <div>{example.keyResult}</div>
  </div>
);
const Monthline = () => (
  <div className="monthline">
    {Array.from({ length: 12 }, (_, i) => (
      <div key={i} className={i < 6 ? "elapsed" : ""}>
        {i + 1}
      </div>
    ))}
    <span className="first-half">First 6 months · review checkpoint</span>
    <span className="second-half">12-month KR</span>
  </div>
);
const Duration = () => {
  const f = useCurrentFrame();
  const selected =
    f > 270 ? mainDurationIndex : Math.min(2, Math.floor(f / 90));
  return (
    <>
      <KRCard />
      <Card className="duration-card">
        <div className="label">TOTAL KR DURATION</div>
        <div className="duration-options">
          {policy.durationOptions.map((x, i) => (
            <div key={x} className={selected === i ? "chosen" : ""}>
              {x}
              {selected === i && <span>✓</span>}
            </div>
          ))}
        </div>
        <Monthline />
        <div className="callout">
          Main example: <b>{example.duration}</b>{" "}
          <span>Review cycle: {example.reviewMonths} months</span>
        </div>
      </Card>
    </>
  );
};
const Target = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div className="target-layout">
        <Card className="target-bars">
          <div className="label">REVIEW CYCLE = 6 MONTHS</div>
          {policy.durationOptions.map((x, i) => (
            <div
              key={x}
              className={`bar-row ${i === mainDurationIndex ? "focus-row" : ""}`}
            >
              <div className="bar-label">
                <span>
                  {x === "6 months"
                    ? "6-Month KR"
                    : x === "1 year"
                      ? "1-Year KR"
                      : x === "2 years"
                        ? "2-Year KR"
                        : x + " KR"}
                </span>
                <b>{policy.targetCompletionPercentages[i]}%</b>
              </div>
              <div className="bar-track">
                <div
                  style={{
                    width: `${interpolate(f, [25 + i * 145, 140 + i * 145], [0, policy.targetCompletionPercentages[i]], clamp)}%`,
                    background: i === mainDurationIndex ? t.accent : t.blue,
                  }}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>
      {f >= 490 ? (
        <Card className="target-timeline">
          <Monthline />
        </Card>
      ) : (
        <div className="target-note">
          Target = expected progress at the six-month checkpoint
        </div>
      )}
    </>
  );
};
const Actual = () => {
  const f = useCurrentFrame();
  const amount = interpolate(f, [90, 240], [0, example.actual], clamp);
  return (
    <>
      <KRCard />
      <Card className="actual-scale">
        <div className="label">
          {example.duration.toUpperCase()} KR · {example.reviewMonths}-MONTH
          REVIEW
        </div>
        <div className="actual-numbers">
          <div>
            <span>Target</span>
            <b>{percent(example.target)}</b>
          </div>
          <div>
            <span>Actual</span>
            <strong>{Math.round(amount)}%</strong>
          </div>
        </div>
        <div className="scale-track">
          <div className="actual-fill" style={{ width: `${amount}%` }} />
          <div
            className="target-marker"
            style={{ left: percent(example.target) }}
          />
          <div
            className="target-marker-label"
            style={{ left: percent(example.target) }}
          >
            Target: {percent(example.target)}
          </div>
        </div>
        <div className="scale-ticks">
          {[0, 25, 50, 75, 100].map((n) => (
            <span key={n}>{n}%</span>
          ))}
        </div>
        <div className="callout">
          Record <b>{example.actual}% actual</b> in Feishu, not the{" "}
          {example.target}% target.
        </div>
        <p className="cap-note">
          Target = expected progress, not a maximum limit on achievement.
        </p>
      </Card>
    </>
  );
};
const Table = () => {
  const f = useCurrentFrame();
  const main = f >= 360 && f < 630;
  const secondary = f >= 630;
  const floating = main
    ? interpolate(f, [360, 405], [0, 1], clamp)
    : interpolate(f, [630, 675], [0, 1], clamp);
  return (
    <>
      <div className="table-instruction">
        Match your KR duration and completion rate.
      </div>
      <Card className="table-card">
        <div className="label">OFFICIAL KR STATUS ASSESSMENT TABLE</div>
        <table>
          <thead>
            <tr>
              {policy.assessmentColumns.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policy.assessmentRows.map((r, i) => (
              <tr
                key={i}
                className={
                  (i === 1 && main) || (i === 0 && secondary)
                    ? "highlight-row"
                    : ""
                }
              >
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={
                      i === 1 && j === 2 && main
                        ? "selected-cell"
                        : i === 0 && j === 3 && secondary
                          ? "selected-cell-blue"
                          : ""
                    }
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {f >= 360 && (
          <div
            className={`floating-percent ${secondary ? "secondary" : ""}`}
            style={{
              transform: `translateY(${(1 - floating) * -65}px) scale(${0.85 + floating * 0.15})`,
              opacity: floating,
            }}
          >
            {secondary
              ? percent(policy.secondaryExample.actual)
              : percent(example.actual)}
          </div>
        )}
        <div className="boundary-note">
          Published ranges preserved exactly. No additional fractional-boundary
          rules are assumed.
        </div>
      </Card>
      <div className="status-examples">
        <div className={`example ${f >= 405 ? "revealed" : ""}`}>
          <span>MAIN EXAMPLE</span>
          <b>
            {example.duration} · {percent(example.actual)}
          </b>
          <div className="status risk">{example.status.toUpperCase()}</div>
        </div>
        <div className={`example ${f >= 675 ? "revealed" : ""}`}>
          <span>SECONDARY EXAMPLE</span>
          <b>
            {policy.secondaryExample.duration} ·{" "}
            {percent(policy.secondaryExample.actual)}
          </b>
          <div className="status track">
            {policy.secondaryExample.status.toUpperCase()}
          </div>
        </div>
      </div>
    </>
  );
};
const Feishu = () => {
  const f = useCurrentFrame();
  const editing = f >= 210 && f < 630;
  const status = f >= 345;
  const entered = f >= 450;
  const saved = f >= 630;
  const nodes = [
    [0, 1100, 380],
    [120, 1100, 380],
    [180, 1450, 298],
    [210, 1450, 298],
    [300, 862, 221],
    [345, 862, 221],
    [420, 730, 335],
    [450, 730, 335],
    [540, 1100, 417],
    [585, 1100, 417],
    [630, 1100, 417],
    [675, 1300, 420],
  ];
  const xs = nodes.map((n) => n[1]),
    ys = nodes.map((n) => n[2]),
    times = nodes.map((n) => n[0]);
  const x = interpolate(f, times, xs, clamp),
    y = interpolate(f, times, ys, clamp);
  const clicking = [190, 345, 450, 585].some((n) => f >= n && f < n + 14);
  const popOpacity = interpolate(f, [210, 225, 615, 630], [0, 1, 1, 0], clamp);
  return (
    <div className="feishu">
      <aside>
        <div className="app-mark">◈</div>
        <strong>OKR workspace</strong>
        <p>Overview</p>
        <p className="selected">Objectives & KRs</p>
        <p>My reviews</p>
        <div className="mock-label">
          Custom animated interface
          <br />
          Feishu-inspired workflow
        </div>
      </aside>
      <main>
        <div className="label">MY OBJECTIVES / SELF-REVIEW</div>
        <div className="list-columns">
          <span>Objective / Key Result</span>
          <span>Progress</span>
          <span>Weight</span>
        </div>
        <div className="objective">
          <span>O1</span>
          <h2>{data.feishuObjective}</h2>
        </div>
        <div className="kr-list-row">
          <b>KR1</b>
          <div className="kr-text">{example.keyResult}</div>
          <div
            className={`no-status ${f >= 165 && !saved ? "hovered" : ""} ${saved ? "completed" : ""}`}
          >
            {saved ? (
              <>
                <span className="row-risk">{example.status}</span>
                <b>{percent(example.actual)}</b>
                <span className="confirmation">✓</span>
              </>
            ) : (
              "No status"
            )}
            <span className="chevron">⌄</span>
          </div>
          <div className="weight">100%</div>
        </div>
        <div className="review-context">
          {example.duration} KR{" "}
          <span>Review cycle: {example.reviewMonths} months</span>
          <span>Target: {percent(example.target)}</span>
        </div>
      </main>
      {editing && (
        <div className="popup-backdrop" style={{ opacity: popOpacity }}>
          <div
            className="status-popup"
            style={{ transform: `translateY(${(1 - popOpacity) * 20}px)` }}
          >
            <div className="popup-title">Update KR progress</div>
            <label className="required-label">
              Status<span>*</span>
            </label>
            <div className="radio-options">
              {["No Status", "On Track", "At Risk", "Off Track"].map(
                (label, i) => (
                  <div
                    key={label}
                    className={
                      status && i === 2
                        ? "radio-option radio-selected"
                        : "radio-option"
                    }
                  >
                    <span
                      className={status && i === 2 ? "radio checked" : "radio"}
                    >
                      {status && i === 2 ? "●" : ""}
                    </span>
                    {label}
                  </div>
                ),
              )}
            </div>
            <label className="required-label">Progress</label>
            <div
              className={`progress-input ${f >= 435 && f < 540 ? "focused" : ""}`}
            >
              <span>
                {entered
                  ? f < 465
                    ? String(example.actual).slice(0, 1)
                    : String(example.actual)
                  : ""}
              </span>
              <span>%</span>
            </div>
            <div className="popup-buttons">
              <div>Cancel</div>
              <div
                className={`submit-button ${f >= 570 ? "submit-hover" : ""}`}
              >
                Submit
              </div>
            </div>
          </div>
        </div>
      )}
      <svg
        className="mouse-cursor"
        style={{
          left: x,
          top: y,
          transform: `scale(${clicking ? 0.86 : 1})`,
          opacity: f < 110 || f > 700 ? 0 : 1,
        }}
        width="35"
        height="43"
        viewBox="0 0 35 43"
      >
        <path
          d="M3 2L30 25 18 27 23 38 17 41 12 29 3 38Z"
          fill="#172c4d"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
      {clicking && (
        <div className="click-ring" style={{ left: x - 13, top: y - 13 }} />
      )}
    </div>
  );
};
const Opening = () => {
  const f = useCurrentFrame();
  return (
    <>
      <p className="lead">
        Completion Rate <span>+</span> Status
      </p>
      <Card className="opening-card">
        <KRCard />
        <div className="opening-labels">
          <div style={{ opacity: interpolate(f, [50, 75], [0, 1], clamp) }}>
            <span>01</span>Completion Rate
          </div>
          <div style={{ opacity: interpolate(f, [95, 120], [0, 1], clamp) }}>
            <span>02</span>Status
          </div>
        </div>
      </Card>
    </>
  );
};
const Closing = () => {
  const f = useCurrentFrame();
  return (
    <>
      <p className="lead">Completion Rate + Status</p>
      <div className="closing-steps">
        {[
          "Check Duration",
          "Assess Progress",
          "Determine Status",
          "Record in Feishu",
        ].map((label, i) => (
          <div key={label}>
            <span className={f > 20 + i * 38 ? "check checked-step" : "check"}>
              {f > 20 + i * 38 ? "✓" : ""}
            </span>
            {label}
          </div>
        ))}
      </div>
      <div
        className="review-complete"
        style={{
          opacity: interpolate(f, [195, 225], [0, 1], clamp),
          transform: `translateY(${interpolate(f, [195, 225], [15, 0], clamp)}px)`,
        }}
      >
        Review Complete!
      </div>
    </>
  );
};
const Scene: React.FC<{ index: number }> = ({ index }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = data.scenes[index];
  const entrance = spring({ frame: f, fps, config: { damping: 22 } });
  return (
    <AbsoluteFill
      className="scene"
      style={{ opacity: interpolate(f, [0, 12], [0, 1], clamp) }}
    >
      <div
        className="scene-content"
        style={{ transform: `translateY(${(1 - entrance) * 30}px)` }}
      >
        <div className="eyebrow">{scene.eyebrow}</div>
        <h1 className={index === 0 ? "opening-title" : ""}>{scene.title}</h1>
        {index === 0 ? (
          <Opening />
        ) : index === 1 ? (
          <Duration />
        ) : index === 2 ? (
          <Target />
        ) : index === 3 ? (
          <Actual />
        ) : index === 4 ? (
          <Table />
        ) : index === 5 ? (
          <Feishu />
        ) : (
          <Closing />
        )}
      </div>
    </AbsoluteFill>
  );
};
export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const cue = data.cues.find(
    (c) => f >= Math.round(c.start * 30) && f < Math.round(c.end * 30),
  );
  return (
    <AbsoluteFill
      style={
        {
          background: t.background,
          color: t.ink,
          fontFamily: t.fontFamily,
          "--accent": t.accent,
          "--blue": t.blue,
          "--ink": t.ink,
          "--muted": t.muted,
          "--purple": t.purple,
        } as React.CSSProperties
      }
    >
      <div className="ambient" />
      <div className="brand">
        OKR <span>/ SELF-REVIEW GUIDE</span>
      </div>
      {!policy.verified && (
        <div className="draft">PRODUCTION DRAFT · BRIEF PENDING</div>
      )}
      {data.scenes.map((s, i) => (
        <Sequence
          key={s.id}
          from={s.start * 30}
          durationInFrames={(s.end - s.start) * 30}
        >
          <Scene index={i} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/narration.wav")} />
      {cue && (
        <div className="subtitle">
          <span>{cue.text}</span>
        </div>
      )}
      <div className="progress" style={{ width: `${(f / 4499) * 100}%` }} />
    </AbsoluteFill>
  );
};
