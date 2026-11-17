
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ffmpegPath = require("ffmpeg-static");
const { execFile } = require("child_process");
const { promisify } = require("util");

const router = express.Router();
const execFileAsync = promisify(execFile);

const storageRoot = path.join(__dirname, "../../..", "storage");
const uploadDir = path.join(storageRoot, "video-uploads");
const exportDir = path.join(storageRoot, "video-exports");

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(exportDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const id = crypto.randomUUID();
      const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
      cb(null, id + ext);
    }
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Faqat video fayl yuklash mumkin"));
    }
  }
});

router.post("/upload", (req, res) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video tanlanmagan"
      });
    }

    const id = path.parse(req.file.filename).name;

    res.json({
      success: true,
      video: {
        id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  });
});

router.post("/export", async (req, res) => {
  try {
    const { videoId } = req.body || {};

    if (!videoId || !/^[a-f0-9-]{36}$/i.test(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Video ID noto'g'ri"
      });
    }

    if (!ffmpegPath) {
      throw new Error("FFmpeg topilmadi");
    }

    const inputFile = fs.readdirSync(uploadDir).find(
      name => path.parse(name).name === videoId
    );

    if (!inputFile) {
      return res.status(404).json({
        success: false,
        message: "Video topilmadi"
      });
    }

    const inputPath = path.join(uploadDir, inputFile);
    const outputPath = path.join(exportDir, videoId + ".mp4");

    await execFileAsync(ffmpegPath, [
      "-y",
      "-i", inputPath,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputPath
    ], {
      timeout: 900000,
      maxBuffer: 10 * 1024 * 1024
    });

    res.json({
      success: true,
      message: "MP4 video tayyor!",
      url: "/api/videos/exports/" + videoId + ".mp4"
    });

  } catch (error) {
    console.error("VIDEO EXPORT ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Video eksport qilishda xatolik: " + error.message
    });
  }
});

module.exports = router;
