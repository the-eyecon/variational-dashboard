import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const address = searchParams.get("address");

    // 1. Intercept token balance checks and handle them via public Arbitrum RPC
    if (action === "tokenbalance") {
      const contractaddress = searchParams.get("contractaddress");
      
      if (contractaddress && address) {
        let method = "eth_call";
        let params: any[] = [];

        if (contractaddress === "native") {
          method = "eth_getBalance";
          params = [address, "latest"];
        } else {
          // Pad address for keccak balanceOf data: 0x70a08231 + 32-byte padded address
          const cleanAddress = address.startsWith("0x") ? address.substring(2) : address;
          const paddedAddress = cleanAddress.toLowerCase().padStart(64, "0");
          const dataPayload = `0x70a08231${paddedAddress}`;
          params = [
            {
              to: contractaddress,
              data: dataPayload,
            },
            "latest",
          ];
        }

        const rpcRes = await fetch("https://arb1.arbitrum.io/rpc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: method,
            params: params,
          }),
        });

        if (rpcRes.ok) {
          const rpcData = await rpcRes.json();
          if (rpcData.result && rpcData.result !== "0x") {
            const balanceDec = BigInt(rpcData.result).toString();
            return NextResponse.json({
              status: "1",
              message: "OK",
              result: balanceDec,
            });
          }
        }
        console.warn("RPC balance fetch failed");
        return NextResponse.json({ status: "0", message: "RPC failed", result: "0" });
      }
    }

    // 2. Intercept transaction histories and retrieve from Blockscout
    if (action === "transfers" && address) {
      const txsUrl = `https://arbitrum.blockscout.com/api/v2/addresses/${address}/transactions`;
      const tokensUrl = `https://arbitrum.blockscout.com/api/v2/addresses/${address}/token-transfers`;
      
      const mergedTxs: any[] = [];
      
      try {
        const [txsRes, tokensRes] = await Promise.all([
          fetch(txsUrl, { next: { revalidate: 30 } }),
          fetch(tokensUrl, { next: { revalidate: 30 } }),
        ]);

        if (txsRes.ok) {
          const data = await txsRes.json();
          if (data && Array.isArray(data.items)) {
            data.items.forEach((item: any) => {
              const timestamp = item.timestamp;
              const txHash = item.hash;

              // Process native ETH value transfers
              const valBigInt = BigInt(item.value || "0");
              if (valBigInt > BigInt(0)) {
                const isOutgoing = item.from?.hash?.toLowerCase() === address.toLowerCase();
                const amount = Number(valBigInt) / 1e18;
                mergedTxs.push({
                  hash: txHash,
                  timestamp: timestamp,
                  direction: isOutgoing ? "outgoing" : "incoming",
                  token: "ETH",
                  amount: amount,
                  counterparty: isOutgoing ? (item.to?.hash || "Unknown") : (item.from?.hash || "Unknown"),
                });
              }
            });
          }
        }

        if (tokensRes.ok) {
          const data = await tokensRes.json();
          if (data && Array.isArray(data.items)) {
            data.items.forEach((transfer: any) => {
              const tokenSymbol = transfer.token?.symbol || "ERC20";
              const decimals = Number(transfer.token?.decimals || 18);
              const rawValue = BigInt(transfer.total?.value || "0");
              
              if (rawValue > BigInt(0)) {
                const amount = Number(rawValue) / Math.pow(10, decimals);
                const isOutgoing = transfer.from?.hash?.toLowerCase() === address.toLowerCase();
                
                mergedTxs.push({
                  hash: transfer.transaction_hash || transfer.tx_hash,
                  timestamp: transfer.timestamp,
                  direction: isOutgoing ? "outgoing" : "incoming",
                  token: tokenSymbol,
                  amount: amount,
                  counterparty: isOutgoing ? (transfer.to?.hash || "Unknown") : (transfer.from?.hash || "Unknown"),
                });
              }
            });
          }
        }
      } catch (err) {
        console.error("Error retrieving transfers from Blockscout:", err);
      }

      // Sort by date descending and limit to 15
      const sortedTxs = mergedTxs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      return NextResponse.json(sortedTxs);
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Treasury API proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error connecting to Treasury API" },
      { status: 500 }
    );
  }
}
