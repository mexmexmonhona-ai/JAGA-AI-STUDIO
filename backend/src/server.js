require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Ma'lumotlar bazasi
require("./database");

// API yo'nalishlari
const clientsRouter = require("./routes/clients");
const ordersRouter = require("./routes/orders");
const aiRouter = require("./routes/ai");
const videoRouter = require("./routes/video");

// Server holati
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    name: "JAGA AI STUDIO",
    status: "Backend ishlayapti"
  });
});

// Routerlarni ulash
app.use("/api/clients", clientsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/ai", aiRouter);
app.use("/api/video", videoRouter);
app.use("/api/videos/exports", express.static(path.join(__dirname, "../storage/video-exports")));

// Serverni ishga tushirish
app.listen(PORT, "0.0.0.0", () => {
  console.log("JAGA AI STUDIO backend: http://localhost:" + PORT);
  console.log("Clients API: /api/clients");
  console.log("Orders API: /api/orders");
});


