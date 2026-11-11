async function testCardDownload() {
  const tunnel = 'https://touched-sage-years-divx.trycloudflare.com';

  const r1 = await fetch(`${tunnel}/api/admin/card-download?template=acrylic`);
  console.log('Template 1 (Acrylic):', r1.status, r1.headers.get('content-type'), r1.headers.get('content-disposition'));

  const r2 = await fetch(`${tunnel}/api/admin/card-download?template=horizontal`);
  console.log('Template 2 (Horizontal):', r2.status, r2.headers.get('content-type'), r2.headers.get('content-disposition'));
}

testCardDownload();
