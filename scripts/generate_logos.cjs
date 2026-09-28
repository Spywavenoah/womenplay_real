const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 1. Full Bolder Logo SVG (Exact Match to uploaded womenplay_logo_image0.png with bolder weights & crisp paths)
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 850" width="1000" height="850">
  <defs>
    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E57288" />
      <stop offset="50%" stop-color="#D75069" />
      <stop offset="100%" stop-color="#C23953" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DFAC3F" />
      <stop offset="50%" stop-color="#CA972A" />
      <stop offset="100%" stop-color="#B2801A" />
    </linearGradient>
  </defs>

  <!-- WP Monogram & Woman Silhouette Section -->
  <g transform="translate(100, 20)" id="monogram-group">
    <!-- W Character (Rose Pink) with Bold Weight -->
    <!-- Left diagonal serif stroke of W -->
    <path d="M 180 120 C 180 105, 195 95, 235 95 L 345 95 C 320 115, 308 132, 290 175 L 195 385 L 150 385 L 65 175 C 50 132, 38 115, 15 95 L 125 95 C 160 95, 180 105, 180 120 Z" fill="url(#roseGrad)" stroke="url(#roseGrad)" stroke-width="3" stroke-linejoin="round" />
    
    <!-- Central Rose Swirl & Middle Stroke of W -->
    <path d="M 195 385 L 295 145 C 305 120, 320 105, 350 95 L 325 95 C 298 110, 276 135, 260 170 L 180 350 L 130 230 C 145 190, 160 150, 175 105 L 150 95 C 130 140, 110 190, 95 235 L 175 408 C 182 420, 190 420, 195 385 Z" fill="url(#roseGrad)" stroke="url(#roseGrad)" stroke-width="2" stroke-linejoin="round" />
    
    <!-- Main Right Arm of W (Gracefully arches up and sweeps towards the woman profile) -->
    <path d="M 180 392 C 208 410, 245 378, 280 305 C 325 215, 378 100, 404 95 C 415 93, 398 108, 382 138 C 345 208, 290 328, 255 378 C 230 415, 198 430, 174 408 Z" fill="url(#roseGrad)" stroke="url(#roseGrad)" stroke-width="2" stroke-linejoin="round" />

    <!-- Woman Profile & Flowing Golden Hair (Intertwined) -->
    <!-- Top Hair Arc transitioning into P loop -->
    <path d="M 438 85 C 500 70, 585 75, 638 115 C 690 155, 705 215, 688 260 C 668 312, 610 338, 520 338 C 532 315, 565 315, 595 298 C 638 276, 658 240, 652 198 C 646 150, 604 110, 540 100 C 478 90, 428 112, 406 145 C 385 178, 365 245, 340 300 C 310 370, 268 432, 300 448 C 322 458, 355 442, 378 405 C 404 358, 415 295, 420 258 C 408 295, 392 352, 366 394 C 345 425, 324 436, 312 430 C 295 420, 316 378, 342 320 C 368 260, 394 188, 414 152 C 430 120, 456 100, 492 90 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" stroke-width="3" stroke-linejoin="round" />

    <!-- Woman Elegant Silhouette Profile (Facing Right) -->
    <path d="M 505 125 C 522 140, 528 162, 522 182 C 512 198, 502 208, 496 218 C 490 228, 506 238, 518 244 C 534 252, 550 262, 554 278 C 556 288, 545 298, 536 302 C 546 308, 552 320, 544 330 C 532 345, 506 352, 485 358 C 464 365, 438 382, 418 418 C 402 444, 382 470, 355 480 C 324 492, 282 478, 266 440 C 255 412, 266 380, 292 342 C 272 380, 266 408, 278 430 C 294 462, 332 472, 364 458 C 390 446, 412 420, 428 392 C 448 355, 474 342, 495 334 C 520 324, 528 315, 520 308 C 510 298, 494 292, 498 282 C 504 272, 522 266, 530 258 C 518 252, 500 244, 490 228 C 482 215, 488 198, 502 180 C 512 166, 516 150, 502 134 C 492 122, 475 115, 454 112 L 470 102 C 486 105, 498 112, 505 125 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" stroke-width="2" stroke-linejoin="round" />

    <!-- Rose Hair Inner Flow Strands (Bolder) -->
    <path d="M 498 158 C 476 220, 414 332, 372 394 C 346 434, 314 452, 288 442 C 278 436, 288 420, 305 398 C 332 360, 378 280, 415 208 C 440 156, 466 126, 498 158 Z" fill="url(#roseGrad)" stroke="url(#roseGrad)" stroke-width="2" stroke-linejoin="round" />
    <path d="M 458 198 C 432 260, 395 338, 364 384 C 342 415, 322 426, 310 420 C 304 415, 315 398, 332 376 C 364 330, 400 252, 426 200 C 440 174, 452 165, 468 176 C 462 186, 460 192, 458 198 Z" fill="url(#roseGrad)" stroke="url(#roseGrad)" stroke-width="1.5" stroke-linejoin="round" />

    <!-- P Letter Stem & Serif Base (Gold) with Bold Serif Foot -->
    <path d="M 495 372 L 615 372 C 594 394, 582 410, 568 448 L 568 475 C 585 475, 612 464, 634 442 L 634 480 C 606 486, 574 492, 546 492 C 518 492, 486 486, 458 480 L 458 442 C 480 464, 508 475, 524 475 L 524 448 C 508 410, 498 394, 476 372 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" stroke-width="3" stroke-linejoin="round" />
  </g>

  <!-- Typography: WOMENPLAY.ORG (Bolder, High-Contrast Serif) -->
  <g transform="translate(500, 600)" text-anchor="middle" id="wordmark">
    <text font-family="'Cinzel', 'Playfair Display', 'Georgia', 'Times New Roman', serif" font-weight="900" font-size="82" letter-spacing="8">
      <tspan fill="#D44A64" stroke="#D44A64" stroke-width="1.5">WOMEN</tspan><tspan fill="#C49124" stroke="#C49124" stroke-width="1.5">PLAY</tspan><tspan fill="#C49124" font-size="54" stroke="#C49124" stroke-width="1">.ORG</tspan>
    </text>
  </g>

  <!-- Elegant Decorative Divider with 3 Rose Petals -->
  <g transform="translate(500, 668)" id="divider">
    <!-- Left Gold Line with End Dot -->
    <circle cx="-300" cy="0" r="4" fill="#C89628" />
    <line x1="-285" y1="0" x2="-50" y2="0" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" />
    <circle cx="-50" cy="0" r="4" fill="#C89628" />

    <!-- Center 3 Flower Petals in Bold Rose -->
    <!-- Center Upright Petal -->
    <path d="M 0 -22 C -10 -9, -10 5, 0 10 C 10 5, 10 -9, 0 -22 Z" fill="#D44A64" stroke="#D44A64" stroke-width="1" />
    <!-- Left Angled Petal -->
    <path d="M -7 5 C -22 1, -25 -13, -29 -18 C -22 -11, -11 -4, -7 5 Z" fill="#E26880" stroke="#E26880" stroke-width="1" transform="rotate(-35, -12, -4)" />
    <!-- Right Angled Petal -->
    <path d="M 7 5 C 22 1, 25 -13, 29 -18 C 22 -11, 11 -4, 7 5 Z" fill="#E26880" stroke="#E26880" stroke-width="1" transform="rotate(35, 12, -4)" />

    <!-- Right Gold Line with End Dot -->
    <circle cx="50" cy="0" r="4" fill="#C89628" />
    <line x1="50" y1="0" x2="285" y2="0" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" />
    <circle cx="300" cy="0" r="4" fill="#C89628" />
  </g>

  <!-- Tagline: CONNECT • PLAY • THRIVE (Bolder, Letter Spaced) -->
  <g transform="translate(500, 745)" text-anchor="middle" id="tagline">
    <text font-family="'Cinzel', 'Playfair Display', 'Georgia', 'Times New Roman', serif" font-weight="900" font-size="30" fill="#3D2D0C" letter-spacing="18" stroke="#3D2D0C" stroke-width="0.8">
      CONNECT <tspan fill="#D44A64" stroke="#D44A64" font-size="24" dy="-2">•</tspan><tspan dy="2"> </tspan>PLAY <tspan fill="#D44A64" stroke="#D44A64" font-size="24" dy="-2">•</tspan><tspan dy="2"> </tspan>THRIVE
    </text>
  </g>
</svg>`;

// 2. Light / Dark-mode variant of Full Logo SVG
const lightLogoSvg = fullLogoSvg.replace('fill="#3D2D0C" letter-spacing="18" stroke="#3D2D0C"', 'fill="#FFFFFF" letter-spacing="18" stroke="#FFFFFF"');

// 3. Monogram Icon SVG (for favicon, touch-icon, and compact square display)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 620" width="760" height="620">
  <defs>
    <linearGradient id="iconRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E57288" />
      <stop offset="50%" stop-color="#D75069" />
      <stop offset="100%" stop-color="#C23953" />
    </linearGradient>
    <linearGradient id="iconGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DFAC3F" />
      <stop offset="50%" stop-color="#CA972A" />
      <stop offset="100%" stop-color="#B2801A" />
    </linearGradient>
  </defs>

  <g transform="translate(20, 30)">
    <!-- W Character (Rose Pink) with Bold Weight -->
    <path d="M 180 120 C 180 105, 195 95, 235 95 L 345 95 C 320 115, 308 132, 290 175 L 195 385 L 150 385 L 65 175 C 50 132, 38 115, 15 95 L 125 95 C 160 95, 180 105, 180 120 Z" fill="url(#iconRoseGrad)" stroke="url(#iconRoseGrad)" stroke-width="4" stroke-linejoin="round" />
    
    <!-- Central Rose Swirl & Middle Stroke of W -->
    <path d="M 195 385 L 295 145 C 305 120, 320 105, 350 95 L 325 95 C 298 110, 276 135, 260 170 L 180 350 L 130 230 C 145 190, 160 150, 175 105 L 150 95 C 130 140, 110 190, 95 235 L 175 408 C 182 420, 190 420, 195 385 Z" fill="url(#iconRoseGrad)" stroke="url(#iconRoseGrad)" stroke-width="3" stroke-linejoin="round" />
    
    <!-- Main Right Arm of W -->
    <path d="M 180 392 C 208 410, 245 378, 280 305 C 325 215, 378 100, 404 95 C 415 93, 398 108, 382 138 C 345 208, 290 328, 255 378 C 230 415, 198 430, 174 408 Z" fill="url(#iconRoseGrad)" stroke="url(#iconRoseGrad)" stroke-width="3" stroke-linejoin="round" />

    <!-- Woman Profile & Flowing Golden Hair -->
    <path d="M 438 85 C 500 70, 585 75, 638 115 C 690 155, 705 215, 688 260 C 668 312, 610 338, 520 338 C 532 315, 565 315, 595 298 C 638 276, 658 240, 652 198 C 646 150, 604 110, 540 100 C 478 90, 428 112, 406 145 C 385 178, 365 245, 340 300 C 310 370, 268 432, 300 448 C 322 458, 355 442, 378 405 C 404 358, 415 295, 420 258 C 408 295, 392 352, 366 394 C 345 425, 324 436, 312 430 C 295 420, 316 378, 342 320 C 368 260, 394 188, 414 152 C 430 120, 456 100, 492 90 Z" fill="url(#iconGoldGrad)" stroke="url(#iconGoldGrad)" stroke-width="4" stroke-linejoin="round" />

    <!-- Woman Profile -->
    <path d="M 505 125 C 522 140, 528 162, 522 182 C 512 198, 502 208, 496 218 C 490 228, 506 238, 518 244 C 534 252, 550 262, 554 278 C 556 288, 545 298, 536 302 C 546 308, 552 320, 544 330 C 532 345, 506 352, 485 358 C 464 365, 438 382, 418 418 C 402 444, 382 470, 355 480 C 324 492, 282 478, 266 440 C 255 412, 266 380, 292 342 C 272 380, 266 408, 278 430 C 294 462, 332 472, 364 458 C 390 446, 412 420, 428 392 C 448 355, 474 342, 495 334 C 520 324, 528 315, 520 308 C 510 298, 494 292, 498 282 C 504 272, 522 266, 530 258 C 518 252, 500 244, 490 228 C 482 215, 488 198, 502 180 C 512 166, 516 150, 502 134 C 492 122, 475 115, 454 112 L 470 102 C 486 105, 498 112, 505 125 Z" fill="url(#iconGoldGrad)" stroke="url(#iconGoldGrad)" stroke-width="3" stroke-linejoin="round" />

    <!-- Rose Hair Inner Flow Strands -->
    <path d="M 498 158 C 476 220, 414 332, 372 394 C 346 434, 314 452, 288 442 C 278 436, 288 420, 305 398 C 332 360, 378 280, 415 208 C 440 156, 466 126, 498 158 Z" fill="url(#iconRoseGrad)" stroke="url(#iconRoseGrad)" stroke-width="3" stroke-linejoin="round" />
    <path d="M 458 198 C 432 260, 395 338, 364 384 C 342 415, 322 426, 310 420 C 304 415, 315 398, 332 376 C 364 330, 400 252, 426 200 C 440 174, 452 165, 468 176 C 462 186, 460 192, 458 198 Z" fill="url(#iconRoseGrad)" stroke="url(#iconRoseGrad)" stroke-width="2" stroke-linejoin="round" />

    <!-- P Letter Stem & Serif Base -->
    <path d="M 495 372 L 615 372 C 594 394, 582 410, 568 448 L 568 475 C 585 475, 612 464, 634 442 L 634 480 C 606 486, 574 492, 546 492 C 518 492, 486 486, 458 480 L 458 442 C 480 464, 508 475, 524 475 L 524 448 C 508 410, 498 394, 476 372 Z" fill="url(#iconGoldGrad)" stroke="url(#iconGoldGrad)" stroke-width="4" stroke-linejoin="round" />
  </g>
</svg>`;

async function buildAll() {
  console.log("Generating Bolder Logo and Icon assets...");

  // Write SVGs
  fs.writeFileSync("public/assets/logo.svg", fullLogoSvg);
  fs.writeFileSync("public/assets/logo-light.svg", lightLogoSvg);
  fs.writeFileSync("public/assets/logo-icon.svg", iconSvg);
  fs.writeFileSync("public/logo.svg", fullLogoSvg);

  // Render High-Resolution PNGs with sharp
  const fullLogoBuffer = Buffer.from(fullLogoSvg);
  const iconBuffer = Buffer.from(iconSvg);

  // 1. High-Res Full Logo (1200x1020)
  const fullLogoPng = await sharp(fullLogoBuffer)
    .resize(1200, 1020, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  fs.writeFileSync("public/assets/logo.png", fullLogoPng);
  fs.writeFileSync("public/logo.png", fullLogoPng);
  fs.writeFileSync("public/assets/womenplay_logo_exact.png", fullLogoPng);
  fs.writeFileSync("public/assets/images/logo.png", fullLogoPng);

  // 2. High-Res Square Icon / Favicon (512x512 with subtle padding)
  const iconSquarePng = await sharp(iconBuffer)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  fs.writeFileSync("public/assets/womenplay_icon.png", iconSquarePng);
  fs.writeFileSync("public/assets/womenplay_icon_exact.png", iconSquarePng);
  fs.writeFileSync("public/assets/icon.png", iconSquarePng);
  fs.writeFileSync("public/assets/logo-icon.png", iconSquarePng);
  fs.writeFileSync("public/womenplay_icon.png", iconSquarePng);
  fs.writeFileSync("public/favicon.png", iconSquarePng);

  // Also copy to dist if dist exists
  if (fs.existsSync("dist")) {
    if (fs.existsSync("dist/assets")) {
      fs.writeFileSync("dist/assets/logo.svg", fullLogoSvg);
      fs.writeFileSync("dist/assets/logo-light.svg", lightLogoSvg);
      fs.writeFileSync("dist/assets/logo-icon.svg", iconSvg);
      fs.writeFileSync("dist/assets/logo.png", fullLogoPng);
      fs.writeFileSync("dist/assets/womenplay_logo_exact.png", fullLogoPng);
      fs.writeFileSync("dist/assets/womenplay_icon.png", iconSquarePng);
      fs.writeFileSync("dist/assets/womenplay_icon_exact.png", iconSquarePng);
      fs.writeFileSync("dist/assets/icon.png", iconSquarePng);
      fs.writeFileSync("dist/assets/logo-icon.png", iconSquarePng);
      if (fs.existsSync("dist/assets/images")) {
        fs.writeFileSync("dist/assets/images/logo.png", fullLogoPng);
      }
    }
    fs.writeFileSync("dist/logo.png", fullLogoPng);
    fs.writeFileSync("dist/womenplay_icon.png", iconSquarePng);
    fs.writeFileSync("dist/favicon.png", iconSquarePng);
  }

  console.log("✅ Successfully generated all bold logo and icon assets!");
}

buildAll().catch(err => {
  console.error("Error generating logos:", err);
  process.exit(1);
});
