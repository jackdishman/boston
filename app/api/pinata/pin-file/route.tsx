import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {

  const res = await request.json();
  const { quizResults, metadata } = res;

  const pinataRequestBody = {
    pinataOptions: { cidVersion: 1 },
    pinataMetadata: { name: metadata.name },
    pinataContent: quizResults
  };

  try {
    const response = await fetch(`https://api.pinata.cloud/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PINATA_API_KEY}`
      },
      body: JSON.stringify(pinataRequestBody)
    });
    
    if (!response.ok) throw new Error(`Pinata API responded with ${response.status}`);

    const data = await response.json();
    const metadataUrl = `${process.env.PINATA_DEDICATED_GATEWAY + data.IpfsHash}`;

    return NextResponse.json({ metadataUrl});
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to pin metadata or mint NFT' }, { status: 500 });
  }
}