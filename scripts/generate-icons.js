import fs from 'fs';
import path from 'path';

// Create SVG representations and standard valid PNG files or SVG fallbacks
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="120" fill="#161615"/>
  <path d="M140 120 L140 392 M140 256 L300 120 M140 256 L310 392" stroke="#ffffff" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="390" cy="130" r="32" fill="#10b981"/>
</svg>`;

const maskableSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#161615"/>
  <g transform="translate(51, 51) scale(0.8)">
    <path d="M140 120 L140 392 M140 256 L300 120 M140 256 L310 392" stroke="#ffffff" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="390" cy="130" r="32" fill="#10b981"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'icon.svg'), svgContent);
fs.writeFileSync(path.join(process.cwd(), 'public', 'pwa-maskable.svg'), maskableSvgContent);
console.log('SVG icons generated');
