// api/bin/[bin].js - Enhanced BIN lookup with multiple fallbacks
export default async function handler(req, res) {
  const { bin } = req.query;

  // Validate BIN format (6-8 digits)
  if (!/^\d{6,8}$/.test(bin)) {
    return res.status(400).json({ error: 'Invalid BIN - must be 6-8 digits' });
  }

  // Extract first 6 digits for API calls
  const binCode = bin.slice(0, 6);

  try {
    // Primary API: BinList (free, comprehensive)
    let data = await tryBinListAPI(binCode);
    
    // Fallback 1: BinDB.app (your current API)
    if (!data) {
      data = await tryBinDBAPI(binCode);
    }
    
    // Fallback 2: IIN Lookup API
    if (!data) {
      data = await tryIINAPI(binCode);
    }
    
    // If all APIs fail, return structured unknown data
    if (!data) {
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
        message: 'BIN not found in any database'
      });
    }

    // Return successful result
    return res.status(200).json({
      ...data,
      success: true,
      message: 'BIN information found'
    });

  } catch (error) {
    console.error('BIN lookup error:', error);
    return res.status(500).json({
      error: 'Service temporarily unavailable',
      bin: binCode,
      brand: 'Unknown',
      issuer: 'Unknown Bank',
      level: 'Unknown',
      cardType: 'Unknown',
      country: { name: 'Unknown', currency: 'USD' },
      success: false
    });
  }
}

// Primary API: BinList.net (free, good coverage)
async function tryBinListAPI(bin) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Cosmic-Card-Analyzer'
      },
      timeout: 5000
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      bin: bin,
      brand: data.scheme?.toUpperCase() || 'Unknown',
      issuer: data.bank?.name || 'Unknown Bank',
      level: data.type?.toUpperCase() || 'Unknown',
      cardType: data.brand?.toUpperCase() || 'Unknown',
      country: {
        name: data.country?.name || 'Unknown',
        currency: data.country?.currency || 'USD',
        code: data.country?.alpha2 || 'XX'
      },
      bankPhone: data.bank?.phone || null,
      bankUrl: data.bank?.url || null,
      prepaid: data.prepaid || false,
      commercial: data.commercial || false
    };
  } catch (error) {
    console.error('BinList API error:', error);
    return null;
  }
}

// Fallback 1: BinDB.app (your current API)
async function tryBinDBAPI(bin) {
  try {
    const response = await fetch(`https://api.bindb.app/v1/${bin}`, {
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      bin: bin,
      brand: data.brand || 'Unknown',
      issuer: data.issuer || 'Unknown Bank',
      level: data.level || 'Unknown',
      cardType: data.cardType || 'Unknown',
      country: {
        name: data.country?.name || 'Unknown',
        currency: data.country?.currency || 'USD',
        code: data.country?.code || 'XX'
      },
      bankPhone: null,
      bankUrl: null
    };
  } catch (error) {
    console.error('BinDB API error:', error);
    return null;
  }
}

// Fallback 2: IIN API (additional coverage)
async function tryIINAPI(bin) {
  try {
    const response = await fetch(`https://iin-api.com/api/iin/${bin}`, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Cosmic-Card-Analyzer'
      },
      timeout: 5000
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.success) return null;
    
    return {
      bin: bin,
      brand: data.scheme?.toUpperCase() || 'Unknown',
      issuer: data.issuer || 'Unknown Bank',
      level: data.type?.toUpperCase() || 'Unknown',
      cardType: data.brand?.toUpperCase() || 'Unknown',
      country: {
        name: data.country || 'Unknown',
        currency: data.currency || 'USD',
        code: data.countryCode || 'XX'
      },
      bankPhone: null,
      bankUrl: null
    };
  } catch (error) {
    console.error('IIN API error:', error);
    return null;
  }
}
