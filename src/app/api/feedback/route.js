import { NextResponse } from 'next/server';

export async function POST(request) {
  const scriptUrl = process.env.GOOGLE_SHEETS_FEEDBACK_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      {
        error:
          'Feedback service is not configured yet. Add GOOGLE_SHEETS_FEEDBACK_URL.',
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { rating, comments, name } = body;

    if (!rating || !comments || !name) {
      return NextResponse.json(
        { error: 'Rating, comments, and name are required.' },
        { status: 400 }
      );
    }

    const formBody = new URLSearchParams({
      rating: String(rating),
      comments: String(comments),
      name: String(name),
    });

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Google Sheets request failed.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit feedback right now.' },
      { status: 500 }
    );
  }
}
