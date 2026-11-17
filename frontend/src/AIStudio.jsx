import ReactMarkdown from "react-markdown";

import { useState } from "react";
import {
  Bot, Sparkles, Copy, LoaderCircle, Languages,
  Video, WandSparkles, Check, RefreshCw
} from "lucide-react";

const API = "http://localhost:4000/api";

export default function AIStudio() {
  const [product, setProduct] = useState("");
  const [details, setDetails] = useState("");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [tone, setTone] = useState("Zamonaviy va ta'sirli");
  const [language, setLanguage] = useState("uz");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`${API}/ai/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product, details, platform, tone, language
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "AI javob bermadi");
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message || "Server bilan aloqa yo'q");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Nusxalash amalga oshmadi");
    }
  }

  return (
    <section className="content-card ai-studio jaga-creative">
      <div className="jaga-hero">
        <div>
          <div className="jaga-kicker">
            <Sparkles size={14} /> AI CREATIVE STUDIO
          </div>
          <h1>Reklamangizni AI bilan yarating</h1>
          <p>G'oyangizni professional reklama ssenariysiga aylantiring.</p>
        </div>
        <div className="jaga-hero-icon">
          <WandSparkles size={43} />
        </div>
      </div>

      <div className="jaga-language">
        <div className="jaga-label">
          <Languages size={17} /> Reklama tili
        </div>
        <div className="jaga-language-options">
          {[
            ["uz", "🇺🇿", "O'zbekcha"],
            ["ru", "🇷🇺", "Русский"],
            ["en", "🇬🇧", "English"]
          ].map(([value, flag, label]) => (
            <button
              type="button"
              key={value}
              className={language === value ? "jaga-lang active" : "jaga-lang"}
              onClick={() => setLanguage(value)}
            >
              <span>{flag}</span> {label}
            </button>
          ))}
        </div>
      </div>

      <form className="jaga-form" onSubmit={generate}>
        <div className="jaga-section-title">
          <div className="jaga-step">01</div>
          <div>
            <h3>Mahsulot ma'lumotlari</h3>
            <p>Reklama qilinadigan mahsulot yoki xizmatni kiriting.</p>
          </div>
        </div>

        <label>Mahsulot yoki biznes nomi</label>
        <input
          value={product}
          onChange={e => setProduct(e.target.value)}
          placeholder="Masalan: Jo'ja restorani"
          required
        />

        <label>Mahsulot haqida batafsil ma'lumot</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Afzalliklari, narxi, manzili va mijozga taklif..."
          rows={4}
        />

        <div className="jaga-section-title">
          <div className="jaga-step">02</div>
          <div>
            <h3>Reklama sozlamalari</h3>
            <p>Platforma va ijodiy uslubni tanlang.</p>
          </div>
        </div>

        <div className="jaga-fields">
          <div>
            <label><Video size={15} /> Platforma</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}>
              <option>Instagram Reels</option>
              <option>TikTok</option>
              <option>YouTube Shorts</option>
              <option>Telegram</option>
              <option>Facebook</option>
            </select>
          </div>

          <div>
            <label><Sparkles size={15} /> Reklama uslubi</label>
            <select value={tone} onChange={e => setTone(e.target.value)}>
              <option>Zamonaviy va ta'sirli</option>
              <option>Premium va jiddiy</option>
              <option>Quvnoq va kreativ</option>
              <option>Sodda va ishonchli</option>
            </select>
          </div>
        </div>

        <button className="jaga-generate" type="submit" disabled={loading}>
          {loading ? (
            <><LoaderCircle className="ai-spin" size={19} /> AI reklama tayyorlamoqda...</>
          ) : (
            <><Sparkles size={19} /> Reklama yaratish <span>→</span></>
          )}
        </button>
      </form>

      {error && <div className="ai-error">{error}</div>}

      {result && (
        <div className="jaga-output">
          <div className="jaga-output-head">
            <div>
              <div className="jaga-kicker"><Bot size={14} /> AI NATIJA</div>
              <h3>Tayyor reklama ssenariysi</h3>
            </div>
            <button type="button" className="jaga-copy" onClick={copyResult}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Nusxalandi" : "Nusxalash"}
            </button>
          </div>
          <div className="jaga-markdown" style={{whiteSpace: "normal", lineHeight: 1.7}}><ReactMarkdown>{result}</ReactMarkdown></div>
          <button
            type="button"
            className="jaga-again"
            onClick={() => generate({ preventDefault() {} })}
            disabled={loading}
          >
            <RefreshCw size={15} /> Qayta yaratish
          </button>
        </div>
      )}

      <div className="jaga-footer-note">
        <span className="online-dot" />
        Mahalliy AI server orqali ishlaydi — API xarajatisiz.
      </div>
    </section>
  );
}
