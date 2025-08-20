// api/bin/[bin].js
export default async function handler(req, res) {
  const { bin } = req.query;

  if (!/^\d{6}$/.test(bin)) {
    return res.status(400).json({ error: 'Invalid BIN' });
  }

  try {
    const response = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error('BIN lookup failed');

    const data = await response.json();

    return res.status(200).json({
      bank: data.bank || { name: 'Unknown Bank' },
      brand: data.brand || 'Unknown',
      country: data.country || { name: 'Unknown', currency: 'USD' }
    });
  } catch (error) {
    return res.status(200).json({
      bank: { name: 'Unknown Bank' },
      brand: 'Unknown',
      country: { name: 'Unknown', currency: 'USD' }
    });
  }
}
