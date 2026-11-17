
const express = require("express");

const router = express.Router();

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "shoxjahon-fast:latest";

const languages = {
  uz: "O'zbek tilida",
  ru: "Rus tilida",
  en: "Ingliz tilida"
};

router.post("/script", async (req, res) => {
  const { product, details, platform, tone, language } = req.body || {};

  if (!product || !String(product).trim()) {
    return res.status(400).json({
      success: false,
      message: "Mahsulot nomini kiriting"
    });
  }

  const lang = languages[language || "uz"];

  if (!lang) {
    return res.status(400).json({
      success: false,
      message: "Tilni tanlang: uz, ru yoki en"
    });
  }

  const prompt = `
Sen JAGA AI STUDIO professional reklama kopirayterisan.

VAZIFA:
Quyidagi ma'lumotlar asosida sifatli reklama tayyorla.

Mahsulot yoki biznes: ${String(product).slice(0, 300)}
Qo'shimcha ma'lumot: ${String(details || "Berilmagan").slice(0, 1500)}
Platforma: ${String(platform || "Instagram Reels").slice(0, 100)}
Uslub: ${String(tone || "Zamonaviy va ta'sirli").slice(0, 100)}

TIL: ${lang}

QAT'IY QOIDALAR:
- Faqat tanlangan tilda yoz.
- Tabiiy, ravon va grammatik jihatdan to'g'ri yoz.
- Berilmagan narx, chegirma, manzil, xizmat va faktlarni to'qima.
- Tahlil, fikrlash jarayoni va izohlarni ko'rsatma.
- Keraksiz hashtaglarni qo'shma.
- Reklama mijozni jalb qiladigan, professional bo'lsin.

NATIJA:
1. Reklama sarlavhasi.
2. 20-30 soniyalik video ssenariysi.
3. Diktor uchun tayyor matn.
4. Ekrandagi yozuvlar.
5. Instagram post matni.
6. Mos hashtaglar.

Faqat tayyor reklama natijasini chiqar.
`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        think: false,
        options: {
          temperature: 0.4,
          num_predict: 1200
        }
      })
    });

    if (!response.ok) {
      throw new Error("Ollama HTTP " + response.status);
    }

    const data = await response.json();

    const result = String(data.response || "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();

    if (!result) {
      throw new Error("AI javobi bo'sh");
    }

    return res.json({
      success: true,
      language: language || "uz",
      result
    });

  } catch (error) {
    console.error("JAGA LOCAL AI XATOSI:", error.message);

    return res.status(502).json({
      success: false,
      message: "Mahalliy AI bilan bog'lanib bo'lmadi. Ollama ishlayotganini tekshiring."
    });
  }
});

router.post("/voice", async (req,res)=>{
 const {text}=req.body||{};
 if(!text||!String(text).trim())return res.status(400).json({success:false,message:"Matn kiriting"});
 try{
  const response=await fetch("http://127.0.0.1:5006/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:String(text).slice(0,5000)})});
  if(!response.ok)throw Error("Voice server HTTP "+response.status);
  const audio=Buffer.from(await response.arrayBuffer());
  res.set("Content-Type","audio/wav");return res.send(audio);
 }catch(error){
  console.error("JAGA VOICE XATOSI:",error.message);
  return res.status(502).json({success:false,message:"Ovoz serveri bilan boglanib bolmadi"});
 }
});

module.exports = router;

