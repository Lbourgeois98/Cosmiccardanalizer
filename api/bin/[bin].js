// api/bin/[bin].js - BIN lookup using Handyapi
export default async function handler(req, res) {
  const { bin } = req.query;

  // Validate BIN format (6-8 digits)
  if (!/^\d{6,8}$/.test(bin)) {
    return res.status(400).json({ error: 'Invalid BIN - must be 6-8 digits' });
  }

  // Extract first 6 digits for API calls
  const binCode = bin.slice(0, 6);

  try {
    // Use Handyapi for BIN lookup
    const response = await fetch(`https://handyapi.com/api/bin/${binCode}`, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Cosmic-Card-Analyzer'
      },
      timeout: 10000
    });

    if (!response.ok) {
      return res.status(200).json({
        bin: binCode,
        brand: 'Unknown',
        issuer: 'Unknown Bank',
        level: 'Unknown',
        cardType: 'Unknown',
        country: { 
          name: 'Unknown', 
          currency: 'USD',
          code: 'XX' 
        },
        bankPhone: null,
        bankUrl: null,
        success: false,
        message: 'BIN not found in database'
      });
    }
    
    const data = await response.json();
    
    // Return successful result with Handyapi data structure
    return res.status(200).json({
      bin: binCode,
      brand: data.scheme?.toUpperCase() || data.brand?.toUpperCase() || 'Unknown',
      issuer: data.bank?.name || data.issuer || 'Unknown Bank',
      level: data.type?.toUpperCase() || data.level?.toUpperCase() || 'Unknown',
      cardType: data.brand?.toUpperCase() || data.cardType?.toUpperCase() || 'Unknown',
      country: {
        name: data.country?.name || data.country || 'Unknown',
        currency: data.country?.currency || data.currency || 'USD',
        code: data.country?.alpha2 || data.countryCode || 'XX'
      },
      bankPhone: data.bank?.phone || data.bankPhone || null,
      bankUrl: data.bank?.url || data.bankUrl || null,
      prepaid: data.prepaid || false,
      commercial: data.commercial || false,
      success: true,
      message: 'BIN information found'
    });

  } catch (error) {
    console.error('Handyapi BIN lookup error:', error);
    return res.status(500).json({
      error: 'Service temporarily unavailable',
      bin: binCode,
      brand: 'Unknown',
      issuer: 'Unknown Bank',
      level: 'Unknown',
      cardType: 'Unknown',
      country: { name: 'Unknown', currency: 'USD', code: 'XX' },
      bankPhone: null,
      bankUrl: null,
      success: false,
      message: 'Service error occurred'
    });
  }
}