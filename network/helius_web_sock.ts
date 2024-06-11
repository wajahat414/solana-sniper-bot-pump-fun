import WebSocket from "ws";

// Create a WebSocket connection
const ws = new WebSocket(
  "wss://mainnet.helius-rpc.com/?api-key=ee3680cf-196e-475b-8f62-812d6b540435"
);

// Function to send a request to the WebSocket server

function sendRequest(ws: WebSocket) {
  const request = {
    jsonrpc: "2.0",
    id: 420,
    method: "accountSubscribe",
    params: [
      "5Vy6PPXWUZxCPFLTyq4hfTgYVpvRUhrLkHipFj2jpump", // pubkey of account we want to subscribe to
      {
        encoding: "jsonParsed", // base58, base64, base65+zstd, jsonParsed
        commitment: "confirmed", // defaults to finalized if unset
      },
    ],
  };
  ws.send(JSON.stringify(request));
}
// Define WebSocket event handlers

ws.on("open", function open() {
  console.log("WebSocket is open");
  sendRequest(ws); // Send a request once the WebSocket is open
});

ws.on("message", function incoming(data) {
  const messageStr = data.toString("utf8");
  try {
    const messageObj = JSON.parse(messageStr);
    console.log("Received:", messageObj);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
  }
});

ws.on("error", function error(err) {
  console.error("WebSocket error:", err);
});

ws.on("close", function close() {
  console.log("WebSocket is closed");
});
