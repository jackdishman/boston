import { NextRequest, NextResponse } from 'next/server';
import { getUserByEthAddress } from '@/middleware/helpers';
import { checkPrivyAuth } from '@/middleware/auth';

export async function POST(req: NextRequest) {
  try {
  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);

  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const { addresses } = await req.json();
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ error: 'Invalid addresses provided' }, { status: 400 });
    }

    if (addresses.length > 350) {
      return NextResponse.json({ error: 'Too many addresses. Maximum is 350.' }, { status: 400 });
    }

    const addressesString = addresses.join(',');
    const profiles = await getUserByEthAddress(addressesString);

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
