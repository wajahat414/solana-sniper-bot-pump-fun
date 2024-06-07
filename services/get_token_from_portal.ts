import WebSocket from "ws";

const ws = new WebSocket("wss://pumpportal.fun/api/data");

ws.on("open", function open() {
  // Subscribing to token creation events
  let payload = {
    method: "subscribeNewToken",
  };
  ws.send(JSON.stringify(payload));
});

ws.on("message", function message(data: any) {
  console.log(JSON.parse(data));
});
