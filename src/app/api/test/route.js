import { NextResponse } from 'next/server';

export async function POST(request) {
  // Read form data from the request
  const body = await request.json();

  const requestData = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Use form data from submitted form
      name: body.name || '',
      email: body.email || '',
      timestamp: new Date().toISOString(),
    })
  };

  const response = await fetch('https://api.example.com/endpoint', requestData);
  
  return NextResponse.json({ success: response.ok });
}