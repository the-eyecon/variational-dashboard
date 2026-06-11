import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,arbitrum,gmx,usd-coin&vs_currencies=usd",
      {
        next: { revalidate: 60 }, // Cache prices for 60 seconds
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `CoinGecko returned status ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("CoinGecko price proxy error:", error);
    return NextResponse.json(
      { error: message || "Internal server error connecting to CoinGecko" },
      { status: 500 }
    );
  }
}
