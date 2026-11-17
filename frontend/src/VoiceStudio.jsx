
import { useState } from "react";
import { Mic, Play, Download, Loader2, Volume2 } from "lucide-react";

const API = "http://localhost:4000/api";

export default function VoiceStudio() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState("");
  const [error, setError] = useState("");

  async function createVoice() {
    if (!text.trim()) {
      setError("Avval matn kiriting");
      return;
    }

    setLoading(true);
    setError("");

    if (audio) URL.revokeObjectURL(audio);
    setAudio("");

    try {
      const response = await fetch(`${API}/ai/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Server xatosi (${response.status}): ${details}`);
      }

      const blob = await response.blob();

      if (!blob.size || blob.type !== "audio/wav") {
        throw new Error("Server WAV audio qaytarmadi: " + blob.type);
      }

      setAudio(URL.createObjectURL(blob));
    } catch (err) {
      console.error("JAGA VOICE FRONTEND:", err);
      setError(err.message || "Ovoz yaratishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  function downloadAudio() {
    if (!audio) return;

    const link = document.createElement("a");
    link.href = audio;
    link.download = "jaga-voice.wav";
    link.click();
  }

  return (
    <section className="content-card" style={{ maxWidth: 900, margin: "0 auto", padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: "#252b48", display: "grid", placeItems: "center", color: "#a5b4fc" }}>
          <Mic size={30} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>JAGA AI - Ovoz studiyasi</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.7 }}>Matningizni o‘zbekcha ovozga aylantiring</p>
        </div>
      </div>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 10 }}>
        Matningizni kiriting
      </label>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={9}
        maxLength={5000}
        placeholder="Assalomu alaykum! JAGA AI STUDIO xizmatiga xush kelibsiz..."
        style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: 16, borderRadius: 12, border: "1px solid #454b63", background: "transparent", color: "inherit", fontSize: 16, lineHeight: 1.6 }}
      />

      <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
        {text.length}/5000 belgi · O‘zbek tili
      </div>

      <button
        className="primary-btn"
        onClick={createVoice}
        disabled={loading || !text.trim()}
        style={{ marginTop: 22, minHeight: 48 }}
      >
        {loading ? <><Loader2 size={18} /> Ovoz yaratilmoqda...</> : <><Play size={18} /> Ovozni yaratish</>}
      </button>

      {error && <p style={{ color: "#ef6b6b", marginTop: 16, whiteSpace: "pre-wrap" }}>{error}</p>}

      {audio && (
        <div style={{ marginTop: 24, padding: 18, border: "1px solid #454b63", borderRadius: 14 }}>
          <h3 style={{ marginTop: 0 }}>Ovoz tayyor!</h3>
          <audio controls src={audio} style={{ width: "100%" }} />
          <button className="primary-btn" onClick={downloadAudio} style={{ marginTop: 14 }}>
            <Download size={17} /> WAV yuklab olish
          </button>
        </div>
      )}
    </section>
  );
}
