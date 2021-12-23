import { FC } from "react";
import { Translate } from "react-localize-redux";
import { Receipt } from "../../libraries/wamp/types";

import ActionGroup from "../transactions/ActionGroup";
import ReceiptLink from "../utils/ReceiptLink";
import ReceiptExecutionStatus from "./ReceiptExecutionStatus";

interface Props {
  receipts: Receipt[];
}

const Receipts: FC<Props> = ({ receipts }) => (
  <Translate>
    {({ translate }) => (
      <>
        {receipts.map((receipt, index) => (
          <ActionGroup
            key={`${receipt.receiptId}_${index}`}
            actionGroup={receipt}
            detailsLink={
              <ReceiptLink
                transactionHash={receipt.originatedFromTransactionHash}
                receiptId={receipt.receiptId}
              />
            }
            status={
              receipt.status ? (
                <ReceiptExecutionStatus status={receipt.status} />
              ) : (
                <>
                  {translate(
                    "component.receipts.ReceiptAction.fetching_status"
                  )}
                </>
              )
            }
            title={translate(
              "component.receipts.ReceiptAction.batch_receipt"
            ).toString()}
          />
        ))}
      </>
    )}
  </Translate>
);

export default Receipts;
