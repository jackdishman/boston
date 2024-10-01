import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { getCrowdfund, getCrowdfundABI } from '@/middleware/crowdfund';
import satori from 'satori';
import sharp from 'sharp';
import { join } from 'path';
import * as fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf');
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || '';

    if (!id) {
      return new NextResponse('Missing crowdfund id', { status: 400 });
    }

    // Fetch contract from db
    const crowdfund = await getCrowdfund(id);
    if (!crowdfund) {
      return new NextResponse('Crowdfund not found', { status: 404 });
    }

    // Initialize the public client
    const publicClient = createPublicClient({ chain: base, transport: http() });

    // Fetch the ABI for the contract
    const contractABI = await getCrowdfundABI();

    // Contract address
    const contractAddress = crowdfund.contract_address;

    // Fetch total amount raised from the contract
    const totalRaised = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'totalRaisedInUSD',
      args: [],
    })) as bigint;

    // Fetch the target amount
    const targetAmount = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'targetAmountInUSD',
      args: [],
    })) as bigint;

    // Fetch the deadline
    const deadline = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'deadline',
      args: [],
    })) as bigint;

    // Fetch the total number of contributors
    const totalContributors = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'getContributors',
      args: [],
    })) as string[];

    // Format the values for display
    const formattedTotalRaised = (parseInt(totalRaised.toString()) / 100).toFixed(2); // assuming USD with 2 decimals
    const formattedTargetAmount = (parseInt(targetAmount.toString()) / 1e6).toFixed(2); // adjust decimals as needed
    const percentage = Math.min(
      (parseFloat(formattedTotalRaised) / parseFloat(formattedTargetAmount)) * 100,
      100
    );
    const daysRemaining = Math.max(
      Math.ceil((Number(deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)),
      0
    );

    // Additional parameters
    const name = crowdfund.name;
    const description = crowdfund.description;

    // Thermometer dimensions
    const thermometerWidth = 80;
    const thermometerHeight = 400;
    const bulbDiameter = 80;

    const svg = await satori(
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          padding: '30px',
          fontFamily: 'Roboto',
          color: '#fff',
        }}
      >
        {/* Left side: thermometer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '300px',
            marginRight: '50px',
            alignItems: 'center',
          }}
        >
          {/* Target amount label at the top */}
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              marginBottom: '10px',
            }}
          >
            ${formattedTargetAmount} Target
          </div>

          {/* Thermometer container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              width: `${thermometerWidth}px`,
            }}
          >
            {/* Stem of the thermometer */}
            <div
              style={{
                display: 'flex',
                width: `${thermometerWidth / 2}px`,
                height: `${thermometerHeight}px`,
                backgroundColor: '#333',
                borderRadius: '25px',
                border: '5px solid #555',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Fill in the stem */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: `${Math.min(percentage, 100)}%`,
                  backgroundColor: '#ff4136',
                }}
              />

              {/* Line at current raised amount */}
              <div
                style={{
                  position: 'absolute',
                  bottom: `${Math.min(percentage, 100)}%`,
                  left: '-20px',
                  width: `${thermometerWidth + 40}px`,
                  height: '2px',
                  backgroundColor: '#fff',
                }}
              />

              {/* Current raised amount label */}
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  bottom: `${Math.min(percentage, 100)}%`,
                  left: '100%',
                  marginLeft: '10px',
                  color: '#ff4136',
                  fontSize: '18px',
                }}
              >
                ${formattedTotalRaised} Raised
              </div>
            </div>

            {/* Bulb of the thermometer */}
            <div
              style={{
                display: 'flex',
                width: `${bulbDiameter}px`,
                height: `${bulbDiameter}px`,
                backgroundColor: '#333',
                borderRadius: '50%',
                border: '5px solid #555',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '-20px', // Adjust to align with the stem
              }}
            >
              {/* Fill in the bulb */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#ff4136',
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right side: title, description, and stats */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Campaign title */}
          <div
            style={{
              display: 'flex',
              fontSize: '60px',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}
          >
            {name}
          </div>

          {/* Campaign description */}
          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              marginBottom: '20px',
              lineHeight: '1.4',
            }}
          >
            {description}
          </div>

          {/* Percentage funded */}
          <div
            style={{
              display: 'flex',
              fontSize: '64px',
              color: '#ff4136',
              fontWeight: 'bold',
              marginTop: '20px',
            }}
          >
            {percentage.toFixed(2)}% funded
          </div>

          {/* display current amout raised */}
          <div
            style={{
              display: 'flex',
              fontSize: '36px',
              color: '#baf8ba',
              marginTop: '10px',
            }}
          >
            ${formattedTotalRaised} Raised
          </div>
          {/* Days remaining */}
          <div
            style={{
              display: 'flex',
              fontSize: '36px',
              color: '#aaa',
              marginTop: '10px',
            }}
          >
            {daysRemaining} days remaining
          </div>
          {/* Total contributors */}
          <div
            style={{
              display: 'flex',
              fontSize: '36px',
              color: '#ffd700',
              marginTop: '10px',
            }}
          >
            {totalContributors.length} contributors
          </div>
        </div>
      </div>,
      {
        width: 1148,
        height: 600,
        fonts: [
          {
            data: fontData,
            name: 'Roboto',
            style: 'normal',
            weight: 400,
          },
        ],
      }
    );

    const pngBuffer = await sharp(Buffer.from(svg)).toFormat('png').toBuffer();

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'max-age=0',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
