import { renderI18nElement } from "../../../libraries/tester";

import ReceiptRow from "../ReceiptRow";

import {
  TRANSACTION_WITH_SUCCESSFUL_RECEIPT,
  TRANSACTION_WITH_MANY_RECEIPTS,
  TRANSACTION_WITH_FAILING_RECEIPT,
} from "./common";

describe("<ReceiptRow />", () => {
  it("renders successful receipt", () => {
    expect(
      renderI18nElement(
        <ReceiptRow
          receipt={TRANSACTION_WITH_SUCCESSFUL_RECEIPT.receipt!}
          transactionHash={TRANSACTION_WITH_SUCCESSFUL_RECEIPT.hash}
          key={TRANSACTION_WITH_SUCCESSFUL_RECEIPT.receipt!.receipt_id}
        />
      )
    ).toMatchSnapshot();
  });

  it("renders receipt with many outcome receipts", () => {
    expect(
      renderI18nElement(
        <ReceiptRow
          receipt={TRANSACTION_WITH_MANY_RECEIPTS.receipt!}
          transactionHash={TRANSACTION_WITH_MANY_RECEIPTS.hash}
          key={TRANSACTION_WITH_MANY_RECEIPTS.receipt!.receipt_id}
        />
      )
    ).toMatchSnapshot();
  });

  it("renders Failure receipt", () => {
    expect(
      renderI18nElement(
        <ReceiptRow
          receipt={TRANSACTION_WITH_FAILING_RECEIPT.receipt!}
          transactionHash={TRANSACTION_WITH_FAILING_RECEIPT.hash}
          key={TRANSACTION_WITH_FAILING_RECEIPT.receipt!.receipt_id}
        />
      )
    ).toMatchSnapshot();
  });
});
