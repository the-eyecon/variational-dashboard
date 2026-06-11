import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats", {
      next: { revalidate: 60 }, // Cache response on server for 60 seconds
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Variational API returned status ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Variational proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error connecting to Variational" },
      { status: 500 }
    );
  }
}
