import { readFile, writeFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';

const localCounterPath = '/tmp/cseb-portal-visits.json';

// Local Fallback: Reads local JSON file data structure
async function readLocalData() {
  try {
    const data = await readFile(localCounterPath, 'utf8');
    const parsed = JSON.parse(data);
    return {
      count: Number.isFinite(parsed.count) ? parsed.count : 0,
      visitors: Array.isArray(parsed.visitors) ? parsed.visitors : []
    };
  } catch {
    return { count: 0, visitors: [] };
  }
}

// Local Fallback: Writes local JSON data structure
async function writeLocalData(data) {
  await writeFile(localCounterPath, JSON.stringify(data), 'utf8');
}

// Core Request Handler
async function requestCounter(visitorId) {
  const scriptUrl = process.env.GOOGLE_SHEETS_VISITS_URL;

  // FALLBACK ACTION: If Google Sheets URL is missing environment variable setup
  if (!scriptUrl) {
    const localData = await readLocalData();
    
    // Check if this visitorId has already been logged locally
    const isUnique = !localData.visitors.includes(visitorId);

    if (isUnique && visitorId) {
      localData.visitors.push(visitorId);
      localData.count += 1;
      await writeLocalData(localData);
    }

    return localData.count;
  }

  // MAIN ROUTE: Sending parameters directly downstream to your Google App Script
  const response = await fetch(scriptUrl, {
    method: 'POST', // Send via POST to transmit the payload safely
    body: new URLSearchParams({ 
      action: 'track_visit', 
      visitorId: visitorId || '' 
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Visit counter request failed.');
  }

  const data = await response.json();
  const count = Number(data.count);

  if (!Number.isFinite(count)) {
    throw new Error('Visit counter returned an invalid count.');
  }

  return count;
}

// GET Route (Kept for fallback UI fetches if necessary, treats as anonymous check)
export async function GET() {
  try {
    const count = await requestCounter('');
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load visit count.' },
      { status: 500 }
    );
  }
}

// POST Route (Triggered directly by your new FingerprintJS UI component)
export async function POST(request) {
  try {
    const { visitorId } = await request.json();
    
    if (!visitorId) {
      return NextResponse.json({ error: 'Missing unique tracking identifier.' }, { status: 400 });
    }

    const count = await requestCounter(visitorId);
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to update visit count.' },
      { status: 500 }
    );
  }
}