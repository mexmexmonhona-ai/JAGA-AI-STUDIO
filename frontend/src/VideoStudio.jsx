import { useState } from "react";

const API = "http://localhost:4000/api";

export default function VideoStudio() {
  const [file, setFile] = useState(null);
  const [videoId, setVideoId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadVideo() {
    if (!file) return setError("Avval video tanlang");
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("video", file);
      const response = await fetch(`${API}/video/upload`, {
        method: "POST",
        body: form
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setVideoId(data.video.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportVideo() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/video/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setResult(`http://localhost:4000${data.url}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="content-card">
      <h2>JAGA AI Video Studio</h2>
      <p>Videoni yuklang va MP4 formatida eksport qiling.</p>
      <input type="file" accept="video/*"
        onChange={e => {
          setFile(e.target.files[0]);
          setVideoId("");
          setResult("");
        }}
      />
      {file && <p>Tanlangan: {file.name}</p>}
      <button className="primary-btn" onClick={uploadVideo} disabled={loading || !file}>
        {loading ? "Yuklanmoqda..." : "Videoni yuklash"}
      </button>
      {videoId && (
        <button className="primary-btn" onClick={exportVideo} disabled={loading}>
          {loading ? "Tayyorlanmoqda..." : "MP4 tayyorlash"}
        </button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p><a href={result} download>MP4 videoni yuklab olish</a></p>}
    </section>
  );
}
