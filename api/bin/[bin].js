// api/bin/[bin].js
export default async function handler(req, res) {
  const { bin } = req.query;

  if (!/^\d{6}$/.test(bin)) {
    return res.status(400).json({ error: 'Invalid BIN: must be 6 digits' });
  }

  try {
    const apiRes = await fetch(`https://api.bindb.app/v1/${bin}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!apiRes.ok) {
      throw new Error('BIN lookup failed');
    }

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      brand: 'Unknown',
      issuer: 'Unknown Bank',
      level: 'Unknown',
      cardType: 'Unknown',
      country: { name: 'Unknown', currency: 'USD' }
    });
  }
}
