const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Precise vector paths matching the exact attached logo
const exactFullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 850" width="1000" height="850">
  <defs>
    <!-- Brand Rose Pink Gradient -->
    <linearGradient id="roseBrand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E87D90" />
      <stop offset="50%" stop-color="#DD677C" />
      <stop offset="100%" stop-color="#CB4E65" />
    </linearGradient>

    <!-- Brand Warm Gold Gradient -->
    <linearGradient id="goldBrand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DDAF4B" />
      <stop offset="50%" stop-color="#C89730" />
      <stop offset="100%" stop-color="#B2801E" />
    </linearGradient>
  </defs>

  <!-- ================= 1. EMBLEM (WP + WOMAN SILHOUETTE) ================= -->
  <g transform="translate(100, 30)" id="brand-emblem">
    <!-- W LEFT STROKE & SERIF (Rose Pink) -->
    <!-- Top bilateral serif of W -->
    <path d="M 178 122 C 178 108 192 98 230 98 L 335 98 C 310 118 298 135 280 176 L 192 382 L 148 382 L 68 178 C 52 135 40 118 15 98 L 122 98 C 154 98 178 108 178 122 Z" 
          fill="url(#roseBrand)" />

    <!-- W MIDDLE V-PEAK (Rose Pink) -->
    <path d="M 192 382 L 288 145 C 298 120 314 105 345 98 L 320 98 C 294 112 272 138 256 172 L 178 348 L 130 230 C 144 190 158 150 172 106 L 148 98 C 126 142 108 188 92 234 L 168 406 C 176 420 184 420 192 382 Z" 
          fill="url(#roseBrand)" />

    <!-- W RIGHT SWEEPING FLOURISH (Rose Pink) -->
    <path d="M 176 392 C 204 410 240 376 274 304 C 318 214 372 100 398 96 C 408 94 392 108 376 136 C 340 206 284 324 250 374 C 225 410 194 426 170 404 Z" 
          fill="url(#roseBrand)" />

    <!-- P LOOP & FLOWING HAIR ARCH (Warm Gold) -->
    <path d="M 432 86 C 496 70 580 75 632 116 C 682 156 698 214 680 258 C 660 308 602 334 514 334 C 526 312 558 312 588 295 C 630 274 650 238 644 196 C 638 148 596 108 532 98 C 472 88 422 110 398 142 C 378 175 358 240 332 295 C 304 364 262 426 294 442 C 316 452 348 436 372 400 C 396 354 408 292 414 255 C 402 292 386 348 360 390 C 338 420 318 432 306 426 C 290 415 310 374 336 316 C 362 256 388 184 408 148 C 424 116 450 96 486 86 Z" 
          fill="url(#goldBrand)" />

    <!-- WOMAN PROFILE SILHOUETTE (Warm Gold, facing right) -->
    <path d="M 498 128 C 515 142 520 164 514 184 C 504 200 494 210 488 220 C 482 230 498 240 510 246 C 526 254 542 264 545 280 C 547 290 536 300 528 304 C 538 310 544 322 536 332 C 524 346 498 354 476 360 C 454 367 428 384 408 420 C 392 446 372 472 345 482 C 314 494 274 480 258 442 C 248 414 260 382 286 344 C 265 382 260 410 272 432 C 288 464 324 474 356 460 C 382 448 404 422 420 394 C 440 356 466 344 488 336 C 512 326 520 316 512 310 C 502 300 486 294 490 284 C 496 274 514 268 522 260 C 510 254 492 246 482 230 C 474 217 480 200 494 182 C 504 168 508 152 494 136 C 484 124 468 116 446 114 L 462 104 C 478 106 490 114 498 128 Z" 
          fill="url(#goldBrand)" />

    <!-- INNER FLOWING HAIR STRANDS (Rose Pink) -->
    <path d="M 490 158 C 468 220 406 332 364 394 C 338 434 306 452 280 442 C 270 436 280 420 298 398 C 324 360 370 280 406 208 C 432 156 458 126 490 158 Z" 
          fill="url(#roseBrand)" />

    <path d="M 452 198 C 426 260 388 338 356 384 C 334 415 314 426 302 420 C 296 415 308 398 324 376 C 356 330 392 252 418 200 C 432 174 444 165 460 176 C 454 186 452 192 452 198 Z" 
          fill="url(#roseBrand)" opacity="0.95" />

    <!-- P ROMAN SERIF PEDESTAL BASE (Warm Gold) -->
    <path d="M 488 372 L 608 372 C 586 394 574 410 560 448 L 560 475 C 576 475 604 464 626 442 L 626 480 C 598 486 566 492 538 492 C 510 492 478 486 450 480 L 450 442 C 472 464 500 475 516 475 L 516 448 C 500 410 490 394 468 372 Z" 
          fill="url(#goldBrand)" />
  </g>

  <!-- ================= 2. WORDMARK (WOMENPLAY.ORG) ================= -->
  <g transform="translate(500, 580)" text-anchor="middle" id="brand-wordmark">
    <text font-family="'Cinzel', 'Playfair Display', 'Didot', 'Bodoni MT', 'Times New Roman', 'Georgia', serif" font-weight="700" font-size="78" letter-spacing="7">
      <tspan fill="#DE687D">WOMEN</tspan><tspan fill="#C89730">PLAY</tspan><tspan fill="#C89730" font-size="52" letter-spacing="4">.ORG</tspan>
    </text>
  </g>

  <!-- ================= 3. ORNAMENTAL FLORAL DIVIDER ================= -->
  <g transform="translate(500, 642)" id="brand-divider">
    <!-- Left Gold Line with Diamond & End Dot -->
    <circle cx="-290" cy="0" r="3.5" fill="#C89730" />
    <line x1="-275" y1="0" x2="-45" y2="0" stroke="#C89730" stroke-width="2.2" stroke-linecap="round" />
    <circle cx="-160" cy="0" r="2.5" fill="#C89730" />
    <circle cx="-45" cy="0" r="3.5" fill="#C89730" />

    <!-- Center 3 Flower Petals in Rose Pink -->
    <!-- Upright Center Petal -->
    <path d="M 0 -22 C -10 -9 -10 5 0 10 C 10 5 10 -9 0 -22 Z" fill="#DE687D" />
    <!-- Left Angled Petal -->
    <path d="M -7 5 C -22 1 -25 -13 -29 -18 C -22 -11 -11 -4 -7 5 Z" fill="#E87D90" transform="rotate(-32, -12, -4)" />
    <!-- Right Angled Petal -->
    <path d="M 7 5 C 22 1 25 -13 29 -18 C 22 -11 11 -4 7 5 Z" fill="#E87D90" transform="rotate(32, 12, -4)" />

    <!-- Right Gold Line with Diamond & End Dot -->
    <circle cx="45" cy="0" r="3.5" fill="#C89730" />
    <line x1="45" y1="0" x2="275" y2="0" stroke="#C89730" stroke-width="2.2" stroke-linecap="round" />
    <circle cx="160" cy="0" r="2.5" fill="#C89730" />
    <circle cx="290" cy="0" r="3.5" fill="#C89730" />
  </g>

  <!-- ================= 4. TAGLINE (CONNECT • PLAY • THRIVE) ================= -->
  <g transform="translate(500, 715)" text-anchor="middle" id="brand-tagline">
    <text font-family="'Cinzel', 'Playfair Display', 'Didot', 'Bodoni MT', 'Times New Roman', 'Georgia', serif" font-weight="700" font-size="28" fill="#2E2018" letter-spacing="16">
      CONNECT <tspan fill="#DE687D" font-size="22" dy="-2">•</tspan><tspan dy="2"> </tspan>PLAY <tspan fill="#DE687D" font-size="22" dy="-2">•</tspan><tspan dy="2"> </tspan>THRIVE
    </text>
  </g>
</svg>`;

// Light/White-text SVG for dark backgrounds
const exactLightLogoSvg = exactFullLogoSvg.replace('fill="#2E2018"', 'fill="#FFFFFF"');

// Monogram Emblem SVG (for Favicon, Apple Touch Icon, Logo-Icon)
const exactIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 600" width="760" height="600">
  <defs>
    <linearGradient id="icRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E87D90" />
      <stop offset="50%" stop-color="#DD677C" />
      <stop offset="100%" stop-color="#CB4E65" />
    </linearGradient>
    <linearGradient id="icGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DDAF4B" />
      <stop offset="50%" stop-color="#C89730" />
      <stop offset="100%" stop-color="#B2801E" />
    </linearGradient>
  </defs>

  <g transform="translate(25, 20)">
    <!-- W Left Stroke & Serif -->
    <path d="M 178 122 C 178 108 192 98 230 98 L 335 98 C 310 118 298 135 280 176 L 192 382 L 148 382 L 68 178 C 52 135 40 118 15 98 L 122 98 C 154 98 178 108 178 122 Z" fill="url(#icRoseGrad)" />
    <!-- W Middle Peak -->
    <path d="M 192 382 L 288 145 C 298 120 314 105 345 98 L 320 98 C 294 112 272 138 256 172 L 178 348 L 130 230 C 144 190 158 150 172 106 L 148 98 C 126 142 108 188 92 234 L 168 406 C 176 420 184 420 192 382 Z" fill="url(#icRoseGrad)" />
    <!-- W Right Sweep -->
    <path d="M 176 392 C 204 410 240 376 274 304 C 318 214 372 100 398 96 C 408 94 392 108 376 136 C 340 206 284 324 250 374 C 225 410 194 426 170 404 Z" fill="url(#icRoseGrad)" />

    <!-- P Loop & Gold Hair -->
    <path d="M 432 86 C 496 70 580 75 632 116 C 682 156 698 214 680 258 C 660 308 602 334 514 334 C 526 312 558 312 588 295 C 630 274 650 238 644 196 C 638 148 596 108 532 98 C 472 88 422 110 398 142 C 378 175 358 240 332 295 C 304 364 262 426 294 442 C 316 452 348 436 372 400 C 396 354 408 292 414 255 C 402 292 386 348 360 390 C 338 420 318 432 306 426 C 290 415 310 374 336 316 C 362 256 388 184 408 148 C 424 116 450 96 486 86 Z" fill="url(#icGoldGrad)" />

    <!-- Woman Profile -->
    <path d="M 498 128 C 515 142 520 164 514 184 C 504 200 494 210 488 220 C 482 230 498 240 510 246 C 526 254 542 264 545 280 C 547 290 536 300 528 304 C 538 310 544 322 536 332 C 524 346 498 354 476 360 C 454 367 428 384 408 420 C 392 446 372 472 345 482 C 314 494 274 480 258 442 C 248 414 260 382 286 344 C 265 382 260 410 272 432 C 288 464 324 474 356 460 C 382 448 404 422 420 394 C 440 356 466 344 488 336 C 512 326 520 316 512 310 C 502 300 486 294 490 284 C 496 274 514 268 522 260 C 510 254 492 246 482 230 C 474 217 480 200 494 182 C 504 168 508 152 494 136 C 484 124 468 116 446 114 L 462 104 C 478 106 490 114 498 128 Z" fill="url(#icGoldGrad)" />

    <!-- Inner Rose Hair Strands -->
    <path d="M 490 158 C 468 220 406 332 364 394 C 338 434 306 452 280 442 C 270 436 280 420 298 398 C 324 360 370 280 406 208 C 432 156 458 126 490 158 Z" fill="url(#icRoseGrad)" />
    <path d="M 452 198 C 426 260 388 338 356 384 C 334 415 314 426 302 420 C 296 415 308 398 324 376 C 356 330 392 252 418 200 C 432 174 444 165 460 176 C 454 186 452 192 452 198 Z" fill="url(#icRoseGrad)" opacity="0.95" />

    <!-- P Stem -->
    <path d="M 488 372 L 608 372 C 586 394 574 410 560 448 L 560 475 C 576 475 604 464 626 442 L 626 480 C 598 486 566 492 538 492 C 510 492 478 486 450 480 L 450 442 C 472 464 500 475 516 475 L 516 448 C 500 410 490 394 468 372 Z" fill="url(#icGoldGrad)" />
  </g>
</svg>`;

async function buildAllLogos() {
  console.log("Generating exact logo (.svg and .png) and website icons...");

  // Write SVGs
  fs.writeFileSync("public/assets/logo.svg", exactFullLogoSvg);
  fs.writeFileSync("public/assets/logo-light.svg", exactLightLogoSvg);
  fs.writeFileSync("public/assets/logo-icon.svg", exactIconSvg);
  fs.writeFileSync("public/logo.svg", exactFullLogoSvg);

  const fullSvgBuf = Buffer.from(exactFullLogoSvg);
  const iconSvgBuf = Buffer.from(exactIconSvg);

  // 1. High-Resolution Full Logo PNG (1400x1190) with crisp anti-aliasing
  const fullPng = await sharp(fullSvgBuf)
    .resize(1400, 1190, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync("public/assets/logo.png", fullPng);
  fs.writeFileSync("public/logo.png", fullPng);
  fs.writeFileSync("public/assets/womenplay_logo_exact.png", fullPng);
  fs.writeFileSync("public/assets/images/logo.png", fullPng);
  fs.writeFileSync("womenplay/WomenPlay_logo_new.png", fullPng);
  fs.writeFileSync("womenplay/WomenPlay_logo_new_nobg.png", fullPng);

  // 2. High-Resolution Icon PNGs (512x512, 192x192, 32x32, 16x16)
  const icon512Png = await sharp(iconSvgBuf)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync("public/assets/womenplay_icon.png", icon512Png);
  fs.writeFileSync("public/assets/womenplay_icon_exact.png", icon512Png);
  fs.writeFileSync("public/assets/icon.png", icon512Png);
  fs.writeFileSync("public/assets/logo-icon.png", icon512Png);
  fs.writeFileSync("public/womenplay_icon.png", icon512Png);
  fs.writeFileSync("public/favicon.png", icon512Png);
  fs.writeFileSync("womenplay/womenplay_icon.png", icon512Png);

  // 3. Sync to dist build folder
  if (fs.existsSync("dist")) {
    if (fs.existsSync("dist/assets")) {
      fs.writeFileSync("dist/assets/logo.svg", exactFullLogoSvg);
      fs.writeFileSync("dist/assets/logo-light.svg", exactLightLogoSvg);
      fs.writeFileSync("dist/assets/logo-icon.svg", exactIconSvg);
      fs.writeFileSync("dist/assets/logo.png", fullPng);
      fs.writeFileSync("dist/assets/womenplay_logo_exact.png", fullPng);
      fs.writeFileSync("dist/assets/womenplay_icon.png", icon512Png);
      fs.writeFileSync("dist/assets/womenplay_icon_exact.png", icon512Png);
      fs.writeFileSync("dist/assets/icon.png", icon512Png);
      fs.writeFileSync("dist/assets/logo-icon.png", icon512Png);
      if (fs.existsSync("dist/assets/images")) {
        fs.writeFileSync("dist/assets/images/logo.png", fullPng);
      }
    }
    fs.writeFileSync("dist/logo.svg", exactFullLogoSvg);
    fs.writeFileSync("dist/logo.png", fullPng);
    fs.writeFileSync("dist/womenplay_icon.png", icon512Png);
    fs.writeFileSync("dist/favicon.png", icon512Png);
  }

  console.log("✅ Successfully updated all .svg, .png, and website icon assets!");
}

buildAllLogos().catch(err => {
  console.error("Error building logo assets:", err);
  process.exit(1);
});
