import { WampCall } from "../libraries/wamp/api";
import { BlockInfo } from "../libraries/wamp/types";

export type Block = BlockInfo & {
  gasUsed: string;
  receiptsCount: number;
};

export const getBlock = async (
  wampCall: WampCall,
  blockHashOrHeight: string | number
) => {
  const blockInfo = await wampCall("block-info", [blockHashOrHeight]);
  const [gasUsed, receiptsCount] = await Promise.all([
    wampCall("gas-used-in-chunks", [blockInfo.hash]),
    wampCall("receipts-count-in-block", [blockInfo.hash]),
  ]);
  return {
    ...blockInfo,
    gasUsed,
    receiptsCount,
  };
};
