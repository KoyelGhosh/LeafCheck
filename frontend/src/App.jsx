

import { useEffect, useRef, useState } from "react";
import "./App.css";
import { findDisease } from "./data.js";
import { Header, History, HowItWorks, PhotoTips, DiseaseLibrary, Faq, Footer } from "./Sections.jsx";
 
// Set VITE_API_URL in .env (e.g. VITE_API_URL=http://localhost:8000/predict).
// Leave it empty to run in demo mode with random sample predictions.
// API contract: POST multipart/form-data, field "file"
// -> { "predictions": [ { "label": "Tomato___Late_blight", "confidence": 0.91 } ] }
const API_URL = import.meta.env.VITE_API_URL || "";
const MAX_MB = 8;
const IDLE_NOTE = `JPG or PNG, up to ${MAX_MB} MB. Good light and a plain background give the best results.`;
 
const CARE = {
  healthy: [
    "No treatment needed.",
    "Keep watering at the base and avoid wet leaves.",
    "Check again weekly for new spots.",
  ],
  Late_blight: [
    "Remove and bag infected leaves; do not compost them.",
    "Avoid overhead watering and improve airflow.",
    "Apply a copper-based or labelled fungicide as directed.",
  ],
  Early_blight: [
    "Prune lower infected leaves and clear fallen debris.",
    "Mulch to stop soil splashing onto leaves.",
    "Rotate crops next season; use a labelled fungicide if it spreads.",
  ],
  Leaf_Mold: [
    "Lower humidity and space plants for airflow.",
    "Remove affected leaves.",
    "Use a labelled fungicide if it keeps spreading.",
  ],
  default: [
    "Isolate the plant from healthy ones.",
    "Remove the worst affected leaves.",
    "Confirm with a local agriculture extension officer before treating.",
  ],
};
 
const DEMO_LABELS = [
  "Tomato___Late_blight",
  "Tomato___Early_blight",
  "Tomato___healthy",
  "Tomato___Leaf_Mold",
  "Potato___Early_blight",
  "Apple___healthy",
  "Corn_(maize)___Common_rust_",
];
 
async function predict(file) {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 2400));
    const pool = [...DEMO_LABELS].sort(() => Math.random() - 0.5).slice(0, 3);
    const top = 0.62 + Math.random() * 0.32;
    const second = (1 - top) * 0.65;
    const confs = [top, second, 1 - top - second];
    return pool.map((label, i) => ({ label, confidence: confs[i] }));
  }
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(API_URL, { method: "POST", body });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()).predictions;
}
 
function parseLabel(label) {
  const [plant, rawCond = ""] = label.split("___");
  const clean = (s) => s.replace(/_/g, " ").replace(/\(.*?\)/g, "").trim();
  const cond = rawCond.replace(/_$/, "");
  return { plant: clean(plant), cond, name: cond === "healthy" ? "Healthy" : clean(cond) };
}
 
function Leaf({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <path d="M8 112C8 50 50 8 112 8c0 62-42 104-104 104z" fill="currentColor" />
      <path d="M8 112L88 32M44 76l2-22M62 58l1-20M32 90l-1-20M52 70l22 2M70 52l20 1M38 84l18 4" stroke="var(--vein)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
 
function UploadPanel({ preview, scanning, note, noteIsError, canAnalyze, onFile, onAnalyze, onClear }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const open = () => inputRef.current?.click();
 
  return (
    <section className="panel" aria-label="Leaf photo">
      <div
        className={`frame${preview ? " has" : ""}${scanning ? " scanning" : ""}${drag ? " drag" : ""}`}
        tabIndex={0}
        role="button"
        aria-label="Choose or drop a leaf photo"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
      >
        {preview && <img src={preview} alt="Selected leaf photo" />}
        {!preview && (
          <div className="hint">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M8 40C8 20 20 8 40 8c0 20-12 32-32 32zM8 40L28 20" />
            </svg>
            <div><strong>Drop a leaf photo here</strong></div>
            <div>or tap to choose from your device</div>
          </div>
        )}
        <span className="corner c1" /><span className="corner c2" />
        <span className="corner c3" /><span className="corner c4" />
        <span className="beam" />
      </div>
 
      <input
        ref={inputRef}
        className="sr"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onFile(e.target.files[0])}
      />
 
      <div className="row">
        <button className="primary" disabled={!canAnalyze} onClick={onAnalyze}>Analyze leaf</button>
        <button className="ghost" disabled={!canAnalyze} onClick={onClear}>Clear photo</button>
      </div>
      <p className={`note${noteIsError ? " err" : ""}`}>{note}</p>
    </section>
  );
}
 
function ResultPanel({ preds }) {
  const [animate, setAnimate] = useState(false);
  const [copied, setCopied] = useState(false);
 
  useEffect(() => {
    setAnimate(false);
    if (!preds) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [preds]);
 
  if (!preds) {
    return (
      <div className="empty">
        <h2>No result yet</h2>
        Add a leaf photo and select Analyze leaf.
      </div>
    );
  }
 
  const sorted = [...preds].sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  const top = parseLabel(sorted[0].label);
  const healthy = top.cond === "healthy";
  const low = sorted[0].confidence < 0.6;
  const [tone, badge] = low
    ? ["warn", "Low confidence"]
    : healthy
    ? ["good", "No disease found"]
    : ["bad", "Disease detected"];
  const tips = CARE[healthy ? "healthy" : top.cond] || CARE.default;
  const info = findDisease(sorted[0].label);
  const copy = async () => {
    const text = `LeafCheck: ${top.plant} - ${top.name} (${Math.round(sorted[0].confidence * 100)}% match)\nNext steps: ${tips.join(" ")}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
 
  return (
    <>
      <div className="verdict">
        <h2>{top.name}</h2>
        <span className={`badge ${tone}`}>{badge}</span>
      </div>
      <p className="plant">{top.plant} · {Math.round(sorted[0].confidence * 100)}% match</p>
 
      <ul className="bars">
        {sorted.map((p) => {
          const q = parseLabel(p.label);
          const pct = Math.round(p.confidence * 100);
          return (
            <li key={p.label}>
              <div className="t"><span>{q.plant}: {q.name}</span><span>{pct}%</span></div>
              <div className="bar"><i style={{ width: animate ? `${pct}%` : 0 }} /></div>
            </li>
          );
        })}
      </ul>
 
      <div className="care">
        <h3>{healthy ? "Keeping it healthy" : "What to do next"}</h3>
        <ul>{tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      {info && (
        <div className="about">
          <h3>About {info.name.toLowerCase()}</h3>
          <p><b>Symptoms:</b> {info.symptoms}</p>
          <p><b>Cause:</b> {info.cause}</p>
          <p><b>Prevention:</b> {info.prevention}</p>
        </div>
      )}
      <button className="ghost small" onClick={copy}>{copied ? "Copied" : "Copy summary"}</button>
      {low && <p className="note">The model is unsure. Try a sharper photo of one leaf in daylight.</p>}
    </>
  );
}
 
export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [preds, setPreds] = useState(null);
  const [note, setNote] = useState(IDLE_NOTE);
  const [noteIsError, setNoteIsError] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("leafcheck-history")) || []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("leafcheck-history", JSON.stringify(history)); } catch {}
  }, [history]);
 
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
 
  const say = (text, isErr = false) => { setNote(text); setNoteIsError(isErr); };
 
  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return say("That file is not an image. Choose a JPG or PNG.", true);
    if (f.size > MAX_MB * 1024 * 1024) return say(`That photo is over ${MAX_MB} MB. Choose a smaller one.`, true);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPreds(null);
    say(f.name);
  };
 
  const handleClear = () => {
    setFile(null);
    setPreview("");
    setPreds(null);
    say(IDLE_NOTE);
  };
 
  const handleAnalyze = async () => {
    if (!file) return;
    setScanning(true);
    say("Analyzing leaf…");
    try {
      const result = await predict(file);
      setPreds(result);
      const best = [...result].sort((a, b) => b.confidence - a.confidence)[0];
      setHistory((h) => [{ label: best.label, confidence: best.confidence, time: Date.now(), demo: !API_URL }, ...h].slice(0, 6));
      say(API_URL ? "Done." : "Demo mode: these results are sample data, not a real diagnosis.");
    } catch {
      say("Could not analyze the photo. Check your connection and try again.", true);
    } finally {
      setScanning(false);
    }
  };
 
  return (
    <>
      <Header />
      <header className="hero" id="top">
        <Leaf className="lf lf1" />
        <Leaf className="lf lf2" />
        <Leaf className="lf lf3" />
        <div className="hero-in">
          <h1>Spot plant disease early</h1>
          <p className="lead">
            Upload a clear photo of a single leaf. LeafCheck looks for common diseases in crops like tomato, potato, apple and corn, then explains what it found and what to do next.
          </p>
        </div>
      </header>
      <main className="wrap" id="scan">
        <div className="grid">
          <UploadPanel
            preview={preview}
            scanning={scanning}
            note={note}
            noteIsError={noteIsError}
            canAnalyze={!!file && !scanning}
            onFile={handleFile}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
          />
          <section className="panel" aria-live="polite" aria-label="Result">
            <ResultPanel preds={preds} />
          </section>
        </div>
        <History items={history} onClear={() => setHistory([])} />
      </main>
      <HowItWorks />
      <PhotoTips />
      <DiseaseLibrary />
      <Faq />
      <Footer />
    </>
  );
}
 
