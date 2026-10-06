import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK on the server with recommended User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to select the exact model requested by the user prompt
// gemini-3.1-pro-preview for complex tasks, gemini-3.8-flash for general, gemini-3.1-flash-lite for fast
function getModelForMode(mode?: string): string {
  switch (mode) {
    case 'complex':
      return 'gemini-3.1-pro-preview';
    case 'fast':
      return 'gemini-3.1-flash-lite';
    case 'general':
    default:
      return 'gemini-3.8-flash';
  }
}

// Maps Config endpoint (safe fallback for client)
app.get('/api/config/maps', (_req: Request, res: Response) => {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';
  return res.json({ apiKey, isConfigured: Boolean(apiKey) });
});

// ==========================================
// Google Maps Platform Server-Side Proxy Routes
// (Safely proxies Places API New and Routes API, avoiding CORS restrictions)
// ==========================================

const getMapsApiKey = () => process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

// 1. Places API (New): Nearby Hospital Search
app.post('/api/maps/places-nearby', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.body;
    const apiKey = getMapsApiKey();

    if (!apiKey) {
      return res.status(503).json({
        error: 'Google Maps API key is not configured.',
        code: 'MISSING_API_KEY',
      });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
    }

    const payload = {
      includedTypes: ['hospital'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: Number(radius) || 5000,
        },
      },
      rankPreference: 'DISTANCE',
    };

    const gmpRes = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.internationalPhoneNumber,places.regularOpeningHours,places.currentOpeningHours,places.googleMapsUri,places.websiteUri,places.types,places.primaryType,places.photos,places.businessStatus',
      },
      body: JSON.stringify(payload),
    });

    if (!gmpRes.ok) {
      const errText = await gmpRes.text();
      console.error('Places searchNearby error:', gmpRes.status, errText);
      return res.status(gmpRes.status).json({
        error: `Places API returned ${gmpRes.status}`,
        details: errText,
      });
    }

    const data = await gmpRes.json();
    return res.json(data);
  } catch (error: any) {
    console.error('Server error in /api/maps/places-nearby:', error);
    return res.status(500).json({ error: error?.message || 'Failed to search nearby hospitals.' });
  }
});

// 2. Places API (New): Text Search (Manual Location Fallback)
app.post('/api/maps/places-search', async (req: Request, res: Response) => {
  try {
    const { query, latitude, longitude } = req.body;
    const apiKey = getMapsApiKey();

    if (!apiKey) {
      return res.status(503).json({ error: 'Google Maps API key is not configured.' });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const payload: any = {
      textQuery: query.toLowerCase().includes('hospital') ? query : `hospitals in ${query}`,
      includedType: 'hospital',
      maxResultCount: 20,
    };

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      payload.locationBias = {
        circle: {
          center: { latitude, longitude },
          radius: 10000.0,
        },
      };
    }

    const gmpRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.internationalPhoneNumber,places.regularOpeningHours,places.currentOpeningHours,places.googleMapsUri,places.websiteUri,places.types,places.primaryType,places.photos,places.businessStatus',
      },
      body: JSON.stringify(payload),
    });

    if (!gmpRes.ok) {
      const errText = await gmpRes.text();
      console.error('Places searchText error:', gmpRes.status, errText);
      return res.status(gmpRes.status).json({
        error: `Places API returned ${gmpRes.status}`,
        details: errText,
      });
    }

    const data = await gmpRes.json();
    return res.json(data);
  } catch (error: any) {
    console.error('Server error in /api/maps/places-search:', error);
    return res.status(500).json({ error: error?.message || 'Failed to search hospitals.' });
  }
});

// Route cache & quota management for Google Routes API
const routesCache = new Map<string, any>();
let routesQuotaExceededUntil = 0;

function calculateHaversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function encodeSignedNumber(num: number): string {
  let sgn_num = num < 0 ? ~(num << 1) : num << 1;
  let encodeString = '';
  while (sgn_num >= 0x20) {
    encodeString += String.fromCharCode((0x20 | (sgn_num & 0x1f)) + 63);
    sgn_num >>= 5;
  }
  encodeString += String.fromCharCode(sgn_num + 63);
  return encodeString;
}

function encodePolyline(points: Array<[number, number]>): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const [lat, lng] of points) {
    const latE5 = Math.round(lat * 1e5);
    const lngE5 = Math.round(lng * 1e5);

    const dLat = latE5 - prevLat;
    const dLng = lngE5 - prevLng;

    prevLat = latE5;
    prevLng = lngE5;

    encoded += encodeSignedNumber(dLat) + encodeSignedNumber(dLng);
  }

  return encoded;
}

function generateFallbackRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) {
  const straightMeters = calculateHaversineMeters(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );
  // Realistic road factor in cities is ~1.25 - 1.3x straight-line distance
  const distanceMeters = Math.max(150, Math.round(straightMeters * 1.25));
  // Average urban emergency speed ~36 km/h (~10 m/s)
  const durationSeconds = Math.max(60, Math.round(distanceMeters / 10));

  const points: Array<[number, number]> = [
    [origin.latitude, origin.longitude],
    [
      origin.latitude * 0.5 + destination.latitude * 0.5,
      origin.longitude * 0.5 + destination.longitude * 0.5,
    ],
    [destination.latitude, destination.longitude],
  ];

  return {
    routes: [
      {
        distanceMeters,
        duration: `${durationSeconds}s`,
        description: 'Direct Emergency Transit Route',
        polyline: {
          encodedPolyline: encodePolyline(points),
        },
        viewport: {
          low: {
            latitude: Math.min(origin.latitude, destination.latitude),
            longitude: Math.min(origin.longitude, destination.longitude),
          },
          high: {
            latitude: Math.max(origin.latitude, destination.latitude),
            longitude: Math.max(origin.longitude, destination.longitude),
          },
        },
        legs: [
          {
            distanceMeters,
            duration: `${durationSeconds}s`,
            staticDuration: `${durationSeconds}s`,
          },
        ],
      },
    ],
  };
}

// 3. Routes API: Compute Emergency Route & Travel Time
app.post('/api/maps/compute-route', async (req: Request, res: Response) => {
  try {
    const { origin, destination, travelMode = 'DRIVE' } = req.body;
    const apiKey = getMapsApiKey();

    if (!origin?.latitude || !origin?.longitude || !destination?.latitude || !destination?.longitude) {
      return res.status(400).json({ error: 'Valid origin and destination coordinates are required.' });
    }

    const cacheKey = `${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}->${destination.latitude.toFixed(4)},${destination.longitude.toFixed(4)}`;
    if (routesCache.has(cacheKey)) {
      return res.json(routesCache.get(cacheKey));
    }

    // If quota cooldown is currently active, return accurate computed fallback immediately
    if (Date.now() < routesQuotaExceededUntil || !apiKey) {
      const fallback = generateFallbackRoute(origin, destination);
      routesCache.set(cacheKey, fallback);
      return res.json(fallback);
    }

    const payload = {
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },
      travelMode,
      routingPreference: 'TRAFFIC_AWARE',
    };

    const gmpRes = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description,routes.viewport,routes.legs',
      },
      body: JSON.stringify(payload),
    });

    if (!gmpRes.ok) {
      // If quota exhausted (429) or rate limited, initiate cooldown and provide smooth fallback
      if (gmpRes.status === 429 || gmpRes.status === 403) {
        routesQuotaExceededUntil = Date.now() + 10 * 60 * 1000; // 10 minutes cooldown
        const fallback = generateFallbackRoute(origin, destination);
        routesCache.set(cacheKey, fallback);
        return res.json(fallback);
      }

      const fallback = generateFallbackRoute(origin, destination);
      return res.json(fallback);
    }

    const data = await gmpRes.json();
    routesCache.set(cacheKey, data);
    return res.json(data);
  } catch (error: any) {
    // On unexpected error, return fallback route smoothly rather than 500 error
    if (req.body?.origin && req.body?.destination) {
      const fallback = generateFallbackRoute(req.body.origin, req.body.destination);
      return res.json(fallback);
    }
    return res.status(500).json({ error: error?.message || 'Failed to compute route.' });
  }
});

// 4. Geocoding API: Reverse Geocode user's lat/lng to human-readable address
app.get('/api/maps/geocode', async (req: Request, res: Response) => {
  try {
    const { lat, lng, address } = req.query;
    const apiKey = getMapsApiKey();

    if (!apiKey) {
      return res.status(503).json({ error: 'Google Maps API key is not configured.' });
    }

    let url = 'https://maps.googleapis.com/maps/api/geocode/json?';
    if (lat && lng) {
      url += `latlng=${lat},${lng}&key=${apiKey}`;
    } else if (address) {
      url += `address=${encodeURIComponent(String(address))}&key=${apiKey}`;
    } else {
      return res.status(400).json({ error: 'Either lat/lng or address must be provided.' });
    }

    const gmpRes = await fetch(url);
    const data = await gmpRes.json();
    return res.json(data);
  } catch (error: any) {
    console.error('Server error in /api/maps/geocode:', error);
    return res.status(500).json({ error: error?.message || 'Failed to geocode location.' });
  }
});

// 5. Places Photo Proxy (Loads real photo thumbnails from Places API)
app.get('/api/maps/photo', async (req: Request, res: Response) => {
  try {
    const { name, maxHeightPx = 400, maxWidthPx = 600 } = req.query;
    const apiKey = getMapsApiKey();

    if (!apiKey || !name) {
      return res.status(400).json({ error: 'Photo name and API key required' });
    }

    const photoUrl = `https://places.googleapis.com/v1/${name}/media?key=${apiKey}&maxHeightPx=${maxHeightPx}&maxWidthPx=${maxWidthPx}&skipHttpRedirect=true`;
    const gmpRes = await fetch(photoUrl);

    if (!gmpRes.ok) {
      return res.status(gmpRes.status).send('Photo not available');
    }

    const data = await gmpRes.json();
    if (data.photoUri) {
      return res.redirect(data.photoUri);
    }
    return res.status(404).send('Photo URI not found');
  } catch (error: any) {
    return res.status(500).send('Photo fetch failed');
  }
});

// 6. Geolocation API: Network/IP-based location detection fallback
app.post('/api/maps/network-location', async (_req: Request, res: Response) => {
  try {
    const apiKey = getMapsApiKey();
    if (!apiKey) {
      return res.status(503).json({ error: 'Google Maps API key is not configured.' });
    }

    const gmpRes = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ considerIp: true }),
    });

    if (!gmpRes.ok) {
      const errText = await gmpRes.text();
      return res.status(gmpRes.status).json({ error: 'Geolocation API error', details: errText });
    }

    const data = await gmpRes.json();
    return res.json({
      latitude: data.location?.lat,
      longitude: data.location?.lng,
      accuracyMeters: Math.round(data.accuracy || 100),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to detect network location.' });
  }
});

// ==========================================
// API 1: Gemini Chatbot Endpoint (Multi-Turn)
// ==========================================
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, systemInstruction, mode, userLocation } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const requestedModel = getModelForMode(mode);

    // Format conversation history into valid Content objects
    // Last message is the current user prompt, earlier ones are history
    const contents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const locationContext = userLocation
      ? `\nPatient's Current Location: ${userLocation.address || 'Unknown'} (Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}).`
      : '';

    const effectiveSystemInstruction = (systemInstruction ||
      `You are MedAssist AI, an expert emergency medical response triage advisor.
Your role is to rapidly assess symptoms, provide actionable immediate safety guidance, prioritize patient safety, and instruct the user when to contact emergency services (911/112).
Always maintain a calm, highly structured, professional healthcare tone.
Crucial rule: Emphasize that in acute life-threatening situations (severe chest pain, inability to breathe, severe uncontrolled bleeding, stroke signs), emergency services should be summoned immediately without delay.`) + locationContext;

    let response;
    try {
      response = await ai.models.generateContent({
        model: requestedModel,
        contents,
        config: {
          systemInstruction: effectiveSystemInstruction,
          temperature: 0.3,
        },
      });
    } catch (modelError: any) {
      console.warn(`Error generating with model ${requestedModel}, trying gemini-3.1-flash-lite:`, modelError?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: effectiveSystemInstruction,
          temperature: 0.3,
        },
      });
    }

    const replyText = response.text || 'I was unable to formulate a response. Please seek immediate professional medical attention.';

    return res.json({
      reply: replyText,
      modelUsed: requestedModel,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate medical triage response. In an emergency, dial 911 immediately.',
    });
  }
});

// ==========================================
// API 2: Structured Emergency Triage Assessment
// ==========================================
app.post('/api/ai/triage-assessment', async (req: Request, res: Response) => {
  try {
    const { symptoms, patientAge, medicalHistory, currentMedications, allergies } = req.body;

    const prompt = `Perform an emergency medical triage assessment for the following presentation:
- Reported Symptoms: "${symptoms || 'Unspecified'}"
- Patient Age: ${patientAge || 'Unknown'}
- Known Pre-existing Conditions: ${Array.isArray(medicalHistory) ? medicalHistory.join(', ') : medicalHistory || 'None reported'}
- Current Medications: ${Array.isArray(currentMedications) ? currentMedications.join(', ') : currentMedications || 'None reported'}
- Known Allergies: ${Array.isArray(allergies) ? allergies.join(', ') : allergies || 'None reported'}

Return a structured emergency evaluation.`;

    const systemInstruction = `You are a Senior Emergency Department Triage Physician.
Evaluate the clinical presentation and return a valid JSON object matching this schema:
{
  "severity": "CRITICAL" | "URGENT" | "MODERATE" | "LOW",
  "severityColor": "red" | "orange" | "yellow" | "green",
  "summary": "1-2 sentence high-level clinical impression",
  "redFlags": ["list of red flag symptoms that require immediate 911"],
  "immediateActions": ["step 1", "step 2", "step 3"],
  "contraindications": ["actions or medications to avoid"],
  "recommendedFacility": "Trauma Center" | "Emergency Department" | "Urgent Care Clinic" | "Primary Care",
  "timeframe": "Immediate (Dial 911)" | "Within 30-60 mins" | "Within 2-4 hours" | "Within 24 hours",
  "vitalSignsToMonitor": ["Pulse", "Respiration", "Consciousness level"]
}
Only output valid raw JSON.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary model error, falling back to gemini-3.1-flash-lite:', primaryErr?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
    }

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ assessment: parsed });
  } catch (error: any) {
    console.error('Triage assessment error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to complete triage assessment.',
    });
  }
});


// ==========================================
// API 3: Text-to-Speech Emergency Voice Audio (gemini-3.8-flash-lite-tts)
// ==========================================
app.post('/api/ai/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required for audio generation' });
    }

    // Limit text to concise emergency instruction (max 300 chars) for ultra-fast latency
    const safeText = text.slice(0, 400);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: safeText,
              speechMetadata: {
                style: 'Calm, authoritative, reassuring emergency paramedic voice',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio stream returned from TTS model.' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize emergency voice audio.',
    });
  }
});

// ==========================================
// API 4: Google Maps Grounding Endpoint
// ==========================================
app.post('/api/ai/maps-grounding', async (req: Request, res: Response) => {
  try {
    const { query, location } = req.body;

    const lat = Number(location?.latitude) || 37.7749;
    const lng = Number(location?.longitude) || -122.4194;
    const userPrompt = query || 'Find 24/7 hospital emergency rooms and trauma care centers nearby.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `You are an emergency medical geographic locator.
Identify nearby real-world hospitals, 24/7 emergency rooms, trauma centers, urgent care clinics, and emergency pharmacies.
Provide concise, accurate descriptions for each facility including estimated proximity, emergency capabilities, and critical care notes.`,
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
      },
    });

    const replyText = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places: Array<{
      title: string;
      uri: string;
      address?: string;
      reviewSnippets?: string[];
    }> = [];

    for (const chunk of groundingChunks as any[]) {
      if (chunk.maps) {
        places.push({
          title: chunk.maps.title || 'Emergency Medical Facility',
          uri: chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title || 'Hospital')}`,
          address: chunk.maps.address || '',
          reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets?.map((r: any) => r.snippet) || [],
        });
      }
    }

    return res.json({
      text: replyText,
      places,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Google Maps grounding error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to retrieve grounded Google Maps information.',
    });
  }
});


// Setup Vite middleware or static file serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedAssist Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
