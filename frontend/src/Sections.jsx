import { useState } from "react";
import { DISEASES, FAQ } from "./data.js";

const pretty = (l) => l.replace(/___/g, ": ").replace(/_/g, " ").replace(/\(.*?\)/g, "").trim();

export function Header() {
  return (
    <nav className="nav" aria-label="Main">
      <a className="brand" href="#top">LeafCheck</a>
      <div className="links">
        <a href="#scan">Scan</a>
        <a href="#how">How it works</a>
        <a href="#library">Disease library</a>
        <a href="#faq">FAQ</a>
      </div>
    </nav>
  );
}

export function History({ items, onClear }) {
  return (
    <section className="panel history" aria-label="Scan history">
      <div className="sec-head">
        <h2>Recent scans</h2>
        {items.length > 0 && <button className="ghost small" onClick={onClear}>Clear history</button>}
      </div>
      {items.length === 0 ? (
        <p className="note">Your last 6 scans will appear here, saved on this device only.</p>
      ) : (
        <ul className="hist">
          {items.map((h) => (
            <li key={h.time}>
              <span>{pretty(h.label)}{h.demo ? " (demo)" : ""}</span>
              <span>{Math.round(h.confidence * 100)}% · {new Date(h.time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["Take a photo", "Photograph one leaf in daylight, filling most of the frame."],
    ["Upload it", "Drop the photo into the scan box. It never leaves your browser until you analyze it."],
    ["The model looks", "A neural network compares the leaf's color, texture and spots against thousands of labelled examples."],
    ["Read the result", "You get the most likely condition, the runner-up guesses, and steps you can take."],
  ];
  return (
    <section className="sec" id="how">
      <h2>How it works</h2>
      <p className="sec-lead">Four steps from leaf to answer, usually in a few seconds.</p>
      <ol className="steps">
        {steps.map(([t, d], i) => (
          <li key={t}><span className="num">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
        ))}
      </ol>
    </section>
  );
}

export function PhotoTips() {
  return (
    <section className="sec">
      <h2>Take a photo the model can read</h2>
      <div className="tips">
        <div className="panel">
          <h3>Do</h3>
          <ul>
            <li>Use natural daylight, not flash.</li>
            <li>Show one leaf, filling most of the frame.</li>
            <li>Keep the spots or damage in focus.</li>
            <li>Place the leaf against a plain background.</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Avoid</h3>
          <ul>
            <li>Blurry or dark photos.</li>
            <li>Whole plants or many leaves at once.</li>
            <li>Wet leaves with glare or reflections.</li>
            <li>Heavy filters or edited colors.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function DiseaseLibrary() {
  const [q, setQ] = useState("");
  const [plant, setPlant] = useState("All");
  const plants = ["All", ...new Set(DISEASES.map((d) => d.plant))];
  const list = DISEASES.filter(
    (d) => (plant === "All" || d.plant === plant) && `${d.plant} ${d.name} ${d.symptoms}`.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <section className="sec" id="library">
      <h2>Disease library</h2>
      <p className="sec-lead">Symptoms, causes and prevention for common leaf diseases.</p>
      <div className="filters">
        <input type="search" placeholder="Search diseases or symptoms" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search diseases" />
        <div className="chips">
          {plants.map((p) => (
            <button key={p} className={`chip${plant === p ? " on" : ""}`} onClick={() => setPlant(p)}>{p}</button>
          ))}
        </div>
      </div>
      {list.length === 0 && <p className="note">No diseases match. Try a different search.</p>}
      <div className="lib">
        {list.map((d) => (
          <details key={d.key} className="panel">
            <summary><strong>{d.name}</strong><span>{d.plant}</span></summary>
            <p><b>Symptoms:</b> {d.symptoms}</p>
            <p><b>Cause:</b> {d.cause}</p>
            <p><b>Prevention:</b> {d.prevention}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="sec" id="faq">
      <h2>Questions</h2>
      <div className="faq">
        {FAQ.map(([q, a]) => (
          <details key={q}><summary>{q}</summary><p>{a}</p></details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <p><strong>LeafCheck</strong> is a student project for early plant disease screening. Results are suggestions, not a diagnosis. Confirm serious problems with an agriculture expert before spraying anything.</p>
    </footer>
  );
}