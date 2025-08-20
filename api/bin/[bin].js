// api/bin/[bin].js
export default async function handler(req, res) {
  const { bin } = req.query;

  if (!/^\d{6}/.test(bin)) {
    return res.status(400).json({ error: 'Invalid BIN' });
  }

  try {
    const response = await fetch(`https://api.bindb.app/v1/${bin}`);
    if (!response.ok) throw new Error('BIN lookup failed');

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({
      issuer: 'Unknown Bank',
      brand: 'Unknown',
      cardType: 'Unknown',
      level: 'Unknown',
      country: { name: 'Unknown', currency: 'USD' }
    });
  }
}
