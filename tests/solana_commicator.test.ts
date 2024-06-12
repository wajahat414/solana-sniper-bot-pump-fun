import { SolanaCommunicator } from "../src/network/solana_communicator";

const solanaCommunicator = new SolanaCommunicator();

describe("gets AssociatedBonding Curve From Transaction Signature", () => {
  it("it should return the associated bonding curve from the transaction signature", async () => {
    const res = await solanaCommunicator.getAssocaitedBondingCurve(
      "5H74dUNyQ33bM2YM5FFfPuXHw11xdgKEuFxP3pb3jo7nz6GvcRGA2tXHovVR1aaMbmPM45dttEzXam9ytkDR4yLa"
    );
    console.log(res);
    expect(res).toEqual(3);
  }, 150000);
});
