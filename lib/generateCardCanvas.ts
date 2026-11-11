// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export async function generateAcrylicCardPng(
  qrDataUrl: string,
  _carImageUrl?: string,
  targetUrlText: string = 'car.fmkal.com'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1800;
  const height = 1125;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Background
  ctx.fillStyle = '#090C10';
  ctx.fillRect(0, 0, width, height);

  // Subtle radial glow
  const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 800);
  radial.addColorStop(0, 'rgba(163, 245, 66, 0.08)');
  radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(30, 30, width - 60, height - 60, 48);
  ctx.stroke();

  // Top Neon Line
  const neonGrad = ctx.createLinearGradient(150, 30, width - 150, 30);
  neonGrad.addColorStop(0, 'rgba(163, 245, 66, 0)');
  neonGrad.addColorStop(0.5, '#A3F542');
  neonGrad.addColorStop(1, 'rgba(163, 245, 66, 0)');
  ctx.strokeStyle = neonGrad;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(250, 32);
  ctx.lineTo(width - 250, 32);
  ctx.stroke();

  // 2. Top Header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 54px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('KIA', 90, 130);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '300 48px sans-serif';
  ctx.fillText('|', 205, 126);

  ctx.fillStyle = '#A3F542';
  ctx.font = 'italic bold 70px "Brush Script MT", "Segoe Script", cursive, sans-serif';
  ctx.shadowColor = 'rgba(163, 245, 66, 0.6)';
  ctx.shadowBlur = 20;
  ctx.fillText('Ray', 235, 134);
  ctx.shadowBlur = 0;

  // Title: 차량 연락 안내
  ctx.fillStyle = '#A3F542';
  ctx.beginPath();
  ctx.arc(1260, 115, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#090C10';
  ctx.beginPath();
  ctx.arc(1250, 115, 4, 0, Math.PI * 2);
  ctx.arc(1260, 115, 4, 0, Math.PI * 2);
  ctx.arc(1270, 115, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 52px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('차량 연락 안내', 1300, 132);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('차량과 관련하여 연락이 필요하신 경우', width - 90, 195);
  ctx.fillText('QR 코드를 스캔하여 간편하게 연락해 주세요.', width - 90, 235);
  ctx.textAlign = 'left';

  // 3. Left Side: Large High-Resolution QR Code (No car image)
  try {
    const qrImg = await loadImage(qrDataUrl);
    const qrX = 140;
    const qrY = 280;
    const qrBoxSize = 510;

    // White box backing
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 40);
    ctx.fill();

    const padding = 38;
    ctx.drawImage(qrImg, qrX + padding, qrY + padding, qrBoxSize - padding * 2, qrBoxSize - padding * 2);

    // Neon corner brackets
    ctx.strokeStyle = '#A3F542';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    const bracketSize = 55;
    const offset = 16;

    // Corners
    ctx.beginPath();
    ctx.moveTo(qrX - offset, qrY - offset + bracketSize);
    ctx.lineTo(qrX - offset, qrY - offset);
    ctx.lineTo(qrX - offset + bracketSize, qrY - offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(qrX + qrBoxSize + offset - bracketSize, qrY - offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY - offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY - offset + bracketSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(qrX - offset, qrY + qrBoxSize + offset - bracketSize);
    ctx.lineTo(qrX - offset, qrY + qrBoxSize + offset);
    ctx.lineTo(qrX - offset + bracketSize, qrY + qrBoxSize + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(qrX + qrBoxSize + offset - bracketSize, qrY + qrBoxSize + offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY + qrBoxSize + offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY + qrBoxSize + offset - bracketSize);
    ctx.stroke();

    // Scan text under QR
    ctx.fillStyle = '#A3F542';
    ctx.font = '800 26px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛶  QR 코드를 스캔하여 간편하게 연락해 주세요.', qrX + qrBoxSize / 2, qrY + qrBoxSize + 60);
    ctx.textAlign = 'left';
  } catch (e) {
    console.warn('QR image failed to load', e);
  }

  // 4. Right Side: 3 Stacked Contact Pill Buttons (Spacious & Luxurious)
  const rightX = 760;
  let rowY = 280;
  const rowW = 950;
  const rowH = 135;
  const radius = 32;

  // WhatsApp
  ctx.fillStyle = 'rgba(16, 20, 28, 0.9)';
  ctx.strokeStyle = 'rgba(37, 211, 102, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(rightX, rowY, rowW, rowH, radius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#25D366';
  ctx.beginPath();
  ctx.arc(rightX + 75, rowY + rowH / 2, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('W', rightX + 58, rowY + rowH / 2 + 13);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('WhatsApp 문의하기', rightX + 145, rowY + 58);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('빠르고 편리한 1:1 메시지 상담', rightX + 145, rowY + 102);

  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('›', rightX + rowW - 60, rowY + 82);

  // KakaoTalk
  rowY += 165;
  ctx.fillStyle = 'rgba(16, 20, 28, 0.9)';
  ctx.strokeStyle = 'rgba(254, 229, 0, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(rightX, rowY, rowW, rowH, radius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEE500';
  ctx.beginPath();
  ctx.arc(rightX + 75, rowY + rowH / 2, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#191919';
  ctx.font = '900 20px sans-serif';
  ctx.fillText('TALK', rightX + 49, rowY + rowH / 2 + 8);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('카카오톡 문의하기', rightX + 145, rowY + 58);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('카카오톡으로 즉시 채팅 상담 연결', rightX + 145, rowY + 102);

  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('›', rightX + rowW - 60, rowY + 82);

  // Phone
  rowY += 165;
  ctx.fillStyle = 'rgba(16, 20, 28, 0.9)';
  ctx.strokeStyle = 'rgba(163, 245, 66, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(rightX, rowY, rowW, rowH, radius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(163, 245, 66, 0.25)';
  ctx.beginPath();
  ctx.arc(rightX + 75, rowY + rowH / 2, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('📞', rightX + 57, rowY + rowH / 2 + 12);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('전화하기', rightX + 145, rowY + 58);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('차주와 직접 통화 연결 (전화 통화)', rightX + 145, rowY + 102);

  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('›', rightX + rowW - 60, rowY + 82);

  // 5. Bottom Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(90, height - 130, 440, 68, 34);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('🔗', 125, height - 88);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 28px monospace';
  ctx.fillText(targetUrlText.replace(/^https?:\/\//, '').replace(/\/+$/, ''), 175, height - 87);

  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('🤝', 960, height - 87);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 34px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('빠른 연락에 감사드립니다.', 1020, height - 86);

  ctx.strokeStyle = '#A3F542';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(1480, height - 98);
  ctx.lineTo(1680, height - 98);
  ctx.stroke();

  return canvas.toDataURL('image/png', 1.0);
}

// Template 2: Horizontal Matte Black Card (2. görsel)
export async function generateHorizontalCardPng(
  qrDataUrl: string,
  _carImageUrl?: string,
  targetUrlText: string = 'car.fmkal.com'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1800;
  const height = 1125;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Background (Matte Obsidian)
  ctx.fillStyle = '#080A0D';
  ctx.fillRect(0, 0, width, height);

  // Outer border with large rounded corners
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(35, 35, width - 70, height - 70, 52);
  ctx.stroke();

  // Subtle angular speed stripes in top right
  ctx.fillStyle = 'rgba(163, 245, 66, 0.08)';
  ctx.beginPath();
  ctx.moveTo(980, 40);
  ctx.lineTo(1120, 40);
  ctx.lineTo(1040, 240);
  ctx.lineTo(900, 240);
  ctx.closePath();
  ctx.fill();

  // 2. Left Header & Copy (Spacious & Clean without car image)
  // Brand: KIA | Ray VEHICLE CONTACT
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('KIA', 100, 145);

  ctx.fillStyle = '#A3F542';
  ctx.font = 'italic bold 68px "Brush Script MT", "Segoe Script", cursive, sans-serif';
  ctx.shadowColor = 'rgba(163, 245, 66, 0.5)';
  ctx.shadowBlur = 18;
  ctx.fillText('Ray', 220, 147);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#64748B';
  ctx.font = '700 22px monospace';
  ctx.fillText('VEHICLE CONTACT', 102, 195);

  // Main Heading: 차량 연락 센터 (연락 in neon green)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('차량 ', 100, 305);

  ctx.fillStyle = '#A3F542';
  ctx.shadowColor = 'rgba(163, 245, 66, 0.5)';
  ctx.shadowBlur = 15;
  ctx.fillText('연락', 255, 305);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(' 센터', 400, 305);

  // Subtitle Korean copy
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 36px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('안녕하세요! 차량 관련 문의가 있으신가요?', 100, 395);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('차량 이동이 필요하거나 긴급한 연락이 필요하시면', 100, 465);
  ctx.fillText('QR 코드를 스캔하거나 아래 방법으로 연락해 주세요.', 100, 510);

  // URL Badge on Left
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(100, 570, 440, 68, 34);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('🔗', 135, 612);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 28px monospace';
  ctx.fillText(targetUrlText.replace(/^https?:\/\//, '').replace(/\/+$/, ''), 185, 613);

  // 3. Right: Big High-Resolution QR Code (No car image)
  try {
    const qrImg = await loadImage(qrDataUrl);
    const qrX = 1170;
    const qrY = 140;
    const qrBoxSize = 510;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 40);
    ctx.fill();

    const padding = 38;
    ctx.drawImage(qrImg, qrX + padding, qrY + padding, qrBoxSize - padding * 2, qrBoxSize - padding * 2);

    // Neon Green Corner Brackets
    ctx.strokeStyle = '#A3F542';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    const bracketSize = 55;
    const offset = 16;

    ctx.beginPath();
    ctx.moveTo(qrX - offset, qrY - offset + bracketSize);
    ctx.lineTo(qrX - offset, qrY - offset);
    ctx.lineTo(qrX - offset + bracketSize, qrY - offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(qrX + qrBoxSize + offset - bracketSize, qrY - offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY - offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY - offset + bracketSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(qrX - offset, qrY + qrBoxSize + offset - bracketSize);
    ctx.lineTo(qrX - offset, qrY + qrBoxSize + offset);
    ctx.lineTo(qrX - offset + bracketSize, qrY + qrBoxSize + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(qrX + qrBoxSize + offset - bracketSize, qrY + qrBoxSize + offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY + qrBoxSize + offset);
    ctx.lineTo(qrX + qrBoxSize + offset, qrY + qrBoxSize + offset - bracketSize);
    ctx.stroke();

    // QR instructions below
    ctx.fillStyle = '#A3F542';
    ctx.font = '800 26px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛶  QR 코드를 스캔하여 연락해 주세요!', qrX + qrBoxSize / 2, qrY + qrBoxSize + 60);
    ctx.textAlign = 'left';
  } catch (e) {
    console.warn('QR failed to load', e);
  }

  // 4. Bottom Row: 3 Pill Buttons
  const pillY = 780;
  const pillW = 510;
  const pillH = 130;
  const pillR = 32;

  // Button 1: WhatsApp
  ctx.fillStyle = 'rgba(16, 20, 26, 0.9)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(90, pillY, pillW, pillH, pillR);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#25D366';
  ctx.beginPath();
  ctx.arc(160, pillY + pillH / 2, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('W', 145, pillY + pillH / 2 + 12);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 32px sans-serif';
  ctx.fillText('WhatsApp', 220, pillY + 54);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('문의하기', 220, pillY + 94);
  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('→', 90 + pillW - 60, pillY + 76);

  // Button 2: KakaoTalk
  ctx.fillStyle = 'rgba(16, 20, 26, 0.9)';
  ctx.beginPath();
  ctx.roundRect(645, pillY, pillW, pillH, pillR);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEE500';
  ctx.beginPath();
  ctx.arc(715, pillY + pillH / 2, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#191919';
  ctx.font = '900 18px sans-serif';
  ctx.fillText('TALK', 691, pillY + pillH / 2 + 7);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('카카오톡', 775, pillY + 54);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('문의하기', 775, pillY + 94);
  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('→', 645 + pillW - 60, pillY + 76);

  // Button 3: Phone
  ctx.fillStyle = 'rgba(16, 20, 26, 0.9)';
  ctx.beginPath();
  ctx.roundRect(1200, pillY, pillW, pillH, pillR);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(1270, pillY + pillH / 2, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('📞', 1253, pillY + pillH / 2 + 10);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('전화하기', 1330, pillY + 54);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('바로 연결됩니다', 1330, pillY + 94);
  ctx.fillStyle = '#A3F542';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('→', 1200 + pillW - 60, pillY + 76);

  // 5. Bottom Meta
  ctx.fillStyle = '#A3F542';
  ctx.font = '32px sans-serif';
  ctx.fillText('😊', 100, height - 85);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif';
  ctx.fillText('빠른 연락에 감사드립니다.', 150, height - 88);

  ctx.strokeStyle = '#A3F542';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(900, height - 97);
  ctx.lineTo(1100, height - 97);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '700 22px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('FMKAL · VEHICLE CONTACT', width - 100, height - 88);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png', 1.0);
}
