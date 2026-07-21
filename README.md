# ⛏️ Minecraft Speedtest (เว็บวัดความเร็วอินเทอร์เน็ตสไตล์มายคราฟ)

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26.svg)
![Web%20Audio%20API](https://img.shields.io/badge/Web%20Audio-API-FF6C37.svg)

เว็บแอปพลิเคชันทดสอบความเร็วอินเทอร์เน็ต (Speed Test) ธีม **Minecraft** พิกเซลอาร์ตเต็มรูปแบบ พร้อมมาตรวัดสัญญาณ Redstone Gauge, เสียงเอฟเฟกต์ 8-Bit ย้อนยุคด้วย Web Audio API, ระบบปลดล็อกความสำเร็จ Advancement, และคลังเก็บประวัติในกล่อง Chest Inventory!

---

## ✨ คุณสมบัติเด่น (Features)

- **🎨 Authentic Minecraft Pixel Aesthetics**:
  - ฟอนต์พิกเซลสไตล์มายคราฟ (`Pixelify Sans`, `Press Start 2P`, `VT323`)
  - ปุ่มกด 3D Beveled Stone/Wood Buttons, แถบ Hotbar ด้านล่าง และ UI กรอบหินมายคราฟ
  - พื้นหลังสลับ Biome ได้ 4 แบบ: **Overworld Day**, **Overworld Night**, **Nether Realm**, และ **The End Void** พร้อมเอฟเฟกต์พิกเซลละอองลอย
- **⚡ Redstone Speedometer Gauge**:
  - แสดงผลความเร็วเรียลไทม์ด้วย HTML5 Canvas เป็นวงจร Redstone & Redstone Lamp
  - หลอดไฟสว่างตามระดับความเร็ว Mbps พร้อมเอฟเฟกต์ประกายไฟ Redstone Spark Particles
- **🔊 Web Audio Sound Effects**:
  - สังเคราะห์เสียง 8-Bit สมจริงในตัว (เสียงคลิกหิน, เสียงสัญญาณ Redstone, เสียงเก็บ XP Orb, เสียง Level Up)
- **🏆 Minecraft Advancements System**:
  - แจ้งเตือนป๊อบอัพ Achievement *Advancement Made!* พร้อมเสียงแฟนแฟร์เมื่อทำความเร็วได้ตามเป้า เช่น
    - 💎 **Speed Demon** (Download > 500 Mbps)
    - ⚡ **Redstone Master** (Ping < 10 ms)
    - 🔥 **Nether Express** (Download > 200 Mbps)
    - ⛏️ **Wooden Pickaxe Internet** (Download < 15 Mbps)
- **🧰 Chest Inventory History Log**:
  - บันทึกประวัติการทดสอบลง Local Storage ในรูปแบบกล่องไอเทม (Chest 27 ช่อง) สามารถวางเมาส์เพื่อส่องดูสถิติย้อนหลังได้

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **HTML5 & CSS3** (Vanilla CSS Design Tokens + Custom Pixel Art Framework)
- **JavaScript (ES6 Modules)**
- **HTML5 Canvas API** (วาดเกจ Redstone & ฉากหลัง Particle Biomes)
- **Web Audio API** (ระบบสังเคราะห์เสียงเอฟเฟกต์ 8-Bit)
- **Vite** (Build Tool & Fast Local Dev Server)

---

## 🚀 วิธีติดตั้งและรันในเครื่อง (Local Setup)

```bash
# 1. Clone โครงสร้างโปรเจกต์
git clone https://github.com/your-username/minecraft-speedtest.git
cd minecraft-speedtest

# 2. ติดตั้ง Dependencies
npm install

# 3. รัน Dev Server
npm run dev
```

เปิดเบราว์เซอร์แล้วเข้าไปที่ `http://localhost:5173`

---

## 📦 การ Build สำหรับ Production

```bash
npm run build
```

ไฟล์พร้อมปรับใช้จะถูกสร้างไว้ในโฟลเดอร์ `dist/` สามารถนำไปปรับใช้บน GitHub Pages, Vercel, Netlify หรือ Cloudflare Pages ได้ทันที

---

## 📜 License

MIT License - สามารถนำไปใช้งาน พัฒนาต่อ หรือแชร์ได้ฟรีครับ!
