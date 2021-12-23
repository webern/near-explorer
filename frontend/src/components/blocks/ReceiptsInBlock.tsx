import { FC } from "react";

import Receipts from "../receipts/Receipts";
import Placeholder from "../utils/Placeholder";
import PaginationSpinner from "../utils/PaginationSpinner";

import { Translate } from "react-localize-redux";
import { useWampSimpleQuery } from "../../hooks/wamp";

interface Props {
  blockHash: string;
}

const ReceiptsInBlock: FC<Props> = ({ blockHash }) => {
  const receiptsList = useWampSimpleQuery("receipts-list-by-block-hash", [
    blockHash,
  ]);

  return (
    <Translate>
      {({ translate }) => (
        <>
          {!receiptsList ? (
            <PaginationSpinner hidden={false} />
          ) : receiptsList.length > 0 ? (
            <Receipts receipts={receiptsList} />
          ) : (
            <Placeholder>
              {translate("component.blocks.ReceiptsInBlock.no_receipts")}
            </Placeholder>
          )}
        </>
      )}
    </Translate>
  );
};

export default ReceiptsInBlock;
