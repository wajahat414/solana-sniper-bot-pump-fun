import WebSocket from 'ws';

const ws = new WebSocket('wss://pumpportal.fun/api/data');

ws.on('open', function open() {




  let payload = {
      method: "subscribeTokenTrade",
      keys: ["CntTfzwcpL5mPSogb5MNN5nugQuEePaw4H8fJQngpump"] 
    }
  ws.send(JSON.stringify(payload));
});

ws.on('message', function message(data) {
    const testData = JSON.parse(data.toString());
    const marketCapSol = testData['marketCapSol'];
    const vitualToken = testData['vTokensInBondingCurve'];
    const virtualSol = testData['vSolInBondingCurve'];
    console.log(testData);
    const tokenPrice = virtualSol / vitualToken;
    console.log(`Token Price: ${tokenPrice}`);
 
});