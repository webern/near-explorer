import { NextApiHandler } from "next";
import wampApi from "../../libraries/wamp/api";
import { getNearNetwork } from "../../libraries/config";

const handler: NextApiHandler = async (req, res) => {
  // This API is currently providing computed estimation based on the inflation, so we only have it for mainnet
  const nearNetwork = getNearNetwork(req);
  if (nearNetwork.name !== "mainnet") {
    res.status(404).end();
    return;
  }

  try {
    res.send(
      await wampApi.call(nearNetwork)("get-latest-circulating-supply", [])
    );
  } catch (error) {
    console.error(error);
    res.status(502).send(error);
  }
};

export default handler;
