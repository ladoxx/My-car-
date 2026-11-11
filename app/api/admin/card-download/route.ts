import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const template = searchParams.get('template') === 'horizontal' ? 'horizontal' : 'acrylic';

    const publicDir = path.join(process.cwd(), 'public');
    const isHorizontal = template === 'horizontal';
    const targetFile = isHorizontal ? 'media_1794363775642_1ce7cbad.jpg' : 'card-acrylic-cropped.jpg';
    const fileName = isHorizontal ? 'fmkal-kia-ray-card-template2-horizontal.jpg' : 'fmkal-kia-ray-card-template1-acrylic.jpg';

    const filePath = path.join(publicDir, targetFile);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Card file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Card download error:', error);
    return NextResponse.json({ error: 'Failed to download card' }, { status: 500 });
  }
}
