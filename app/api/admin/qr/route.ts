import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getVehicleSettings } from '@/lib/settings';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'png';
    const errorCorrectionLevel = (searchParams.get('ec') || 'H') as QRCode.QRCodeErrorCorrectionLevel;
    const margin = parseInt(searchParams.get('margin') || '4', 10);
    const size = parseInt(searchParams.get('size') || '1024', 10);
    const download = searchParams.get('download') === 'true';

    const settings = await getVehicleSettings();
    const domain = (searchParams.get('url') || settings.baseUrl || 'https://fmkal.com').replace(/\/+$/, '');
    const targetUrl = `${domain}/car?src=qr`;

    if (format === 'svg') {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        errorCorrectionLevel,
        margin,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return new NextResponse(svgString, {
        headers: {
          'Content-Type': 'image/svg+xml',
          ...(download
            ? { 'Content-Disposition': 'attachment; filename="fmkal-kia-ray-qr.svg"' }
            : {}),
        },
      });
    }

    if (format === 'json') {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel,
        margin,
        width: size,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return NextResponse.json({
        targetUrl,
        dataUrl,
        format,
        size,
        errorCorrectionLevel,
      });
    }

    // Default: PNG buffer
    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      errorCorrectionLevel,
      margin,
      width: size,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
        ...(download
          ? { 'Content-Disposition': `attachment; filename="fmkal-kia-ray-qr-${size}x${size}.png"` }
          : {}),
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
