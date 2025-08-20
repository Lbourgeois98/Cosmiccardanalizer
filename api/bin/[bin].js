// api/bin/[bin].js
export default async function handler(req, res) {
  const { bin } = req.query;

  if (!/^\d{6}$/.test(bin)) {
    return res.status(400).json({ error: 'Invalid BIN: must be 6 digits' });
  }

  try {
    const apiRes = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!apiRes.ok) {
      return res.status(200).json({
        bank: { name: 'Unknown Bank' },
        brand: 'Unknown',
        scheme: 'Unknown',
        type: 'Unknown',
        country: { name: 'Unknown', currency: 'USD' }
      });
    }

    const data = await apiRes.json();

    return res.status(200).json({
      bank: data.bank || { name: 'Unknown Bank' },
      brand: data.brand || 'Unknown',
      scheme: data.scheme?.toUpperCase(),
      type: data.type?.toUpperCase(),
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
