const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

async function checkUrl(url) {
  return new Promise((resolve) => {
    if (url.startsWith("/")) {
      const fullPath = path.join(process.cwd(), "public", url);
      if (fs.existsSync(fullPath)) {
        resolve({ url, status: 200, ok: true });
      } else {
        resolve({ url, status: 404, ok: false, local: true });
      }
      return;
    }
    try {
      const mod = url.startsWith("https") ? https : http;
      const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
      req.on("error", (e) => resolve({ url, status: "ERR", ok: false, error: e.message }));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ url, status: "TIMEOUT", ok: false });
      });
    } catch(e) {
      resolve({ url, status: "ERR", ok: false });
    }
  });
}

async function run() {
  let allText = fs.readFileSync("server.ts", "utf8");
  if (fs.existsSync("db.json")) {
    allText += fs.readFileSync("db.json", "utf8");
  }
  const compFiles = fs.readdirSync("src/components");
  for (const f of compFiles) {
    if (fs.statSync("src/components/" + f).isFile()) {
      allText += fs.readFileSync("src/components/" + f, "utf8");
    }
  }

  const urlRegex = /(https?:\/\/[^\s"'`<>)]+|\/assets\/[^\s"'`<>)]+)/g;
  const matches = [...new Set(allText.match(urlRegex) || [])];
  
  const imgMatches = matches.filter(u => u.includes("images.unsplash.com") || u.includes("/assets/") || u.includes("photo-") || u.endsWith(".jpg") || u.endsWith(".jpeg") || u.endsWith(".png") || u.endsWith(".webp") || u.endsWith(".svg") || u.includes("avatar") || u.includes("logo") || u.includes("image"));

  console.log(`Checking ${imgMatches.length} candidate URLs...`);
  for (const u of imgMatches) {
    // Clean trailing punctuation
    const cleanUrl = u.replace(/[,;]+$/, "");
    const res = await checkUrl(cleanUrl);
    if (!res.ok) {
      console.log(`❌ BROKEN: [${res.status}] ${cleanUrl}`);
    } else {
      console.log(`✅ OK: [${res.status}] ${cleanUrl}`);
    }
  }
}
run();
