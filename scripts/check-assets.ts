async function check() {
  const tunnelUrl = 'https://touched-sage-years-divx.trycloudflare.com';
  console.log('Testing Cloudflare Tunnel:', tunnelUrl);

  const res = await fetch(`${tunnelUrl}/car`);
  console.log('HTML status:', res.status);
  const html = await res.text();
  
  const cssMatches = html.match(/href="(\/_next\/static\/[^"]+)"/g) || [];
  const jsMatches = html.match(/src="(\/_next\/static\/[^"]+)"/g) || [];

  for (const match of cssMatches) {
    const url = match.replace(/href="|"/g, '');
    const r = await fetch(tunnelUrl + url);
    console.log(`Tunnel CSS ${url} -> status ${r.status}, type: ${r.headers.get('content-type')}`);
  }

  for (const match of jsMatches.slice(0, 2)) {
    const url = match.replace(/src="|"/g, '');
    const r = await fetch(tunnelUrl + url);
    console.log(`Tunnel JS ${url} -> status ${r.status}, type: ${r.headers.get('content-type')}`);
  }
}

check();
