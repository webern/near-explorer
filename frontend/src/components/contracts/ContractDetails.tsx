import moment from "moment";

import { FC, useCallback, useMemo } from "react";

import { Row, Col } from "react-bootstrap";

import CardCell from "../utils/CardCell";
import Term from "../utils/Term";
import TransactionLink from "../utils/TransactionLink";

import { Translate } from "react-localize-redux";
import { useWampQuery } from "../../hooks/wamp";

interface Props {
  accountId: string;
}

const ContractDetails: FC<Props> = ({ accountId }) => {
  const contractInfo = useWampQuery(
    useCallback(
      async (wampCall) => {
        // codeHash does not exist for deleted accounts
        const account = await wampCall("nearcore-view-account", [accountId]);
        const codeHash = account["code_hash"];
        // TODO: find out why we have magic number here
        if (!codeHash || codeHash === "11111111111111111111111111111111") {
          return;
        }
        const [contractInfo, accessKeys] = await Promise.all([
          wampCall("contract-info-by-account-id", [accountId]),
          wampCall("nearcore-view-access-key-list", [accountId]),
        ]);
        if (contractInfo !== undefined) {
          return {
            codeHash,
            transactionHash: contractInfo.hash,
            timestamp: contractInfo.blockTimestamp,
            accessKeys: accessKeys.keys,
          };
        } else {
          return {
            codeHash,
            accessKeys: accessKeys.keys,
          };
        }
      },
      [accountId]
    )
  );
  const locked = useMemo(
    () =>
      contractInfo?.accessKeys.every(
        (key) => key["access_key"]["permission"]["FunctionCall"] !== undefined
      ),
    [contractInfo]
  );

  let lockedShow: string | JSX.Element;
  if (locked !== undefined) {
    lockedShow =
      locked === true ? (
        <Translate id="common.state.yes" />
      ) : (
        <Translate id="common.state.no" />
      );
  }
  if (!contractInfo?.codeHash) {
    return null;
  }
  return (
    <Translate>
      {({ translate }) => (
        <>
          <div className="contract-title">
            <img
              src={"/static/images/icon-d-contract.svg"}
              className="card-cell-title-img"
            />
            <Translate id="common.contracts.contract" />
          </div>
          <div className="contract-info-container">
            <Row noGutters className="border-0">
              <Col md="4">
                <CardCell
                  title={
                    <Term
                      title={translate(
                        "component.contracts.ContractDetails.last_updated.title"
                      )}
                      text={translate(
                        "component.contracts.ContractDetails.last_updated.text"
                      )}
                      href={
                        "https://docs.near.org/docs/develop/basics/getting-started"
                      }
                    />
                  }
                  text={
                    contractInfo.timestamp
                      ? moment(contractInfo.timestamp).format(
                          translate(
                            "common.date_time.date_time_format"
                          ).toString()
                        )
                      : translate("common.state.not_available").toString()
                  }
                  className="block-card-created-text border-0"
                />
              </Col>
              <Col md="8">
                <CardCell
                  title={
                    <Term
                      title={translate(
                        "component.contracts.ContractDetails.transaction_hash.title"
                      )}
                      text={translate(
                        "component.contracts.ContractDetails.transaction_hash.text"
                      )}
                    />
                  }
                  text={
                    contractInfo.transactionHash ? (
                      <TransactionLink
                        transactionHash={contractInfo.transactionHash}
                      >
                        {contractInfo.transactionHash}
                      </TransactionLink>
                    ) : (
                      translate("common.state.not_available").toString()
                    )
                  }
                  className="block-card-created border-0"
                />
              </Col>
            </Row>
            <Row noGutters className="border-0">
              <Col md="4">
                <CardCell
                  title={
                    <Term
                      title={translate(
                        "component.contracts.ContractDetails.locked.title"
                      )}
                      text={translate(
                        "component.contracts.ContractDetails.locked.text",
                        undefined,
                        { renderInnerHtml: true }
                      )}
                    />
                  }
                  text={lockedShow ? lockedShow : ""}
                  className="block-card-created-text account-card-back border-0"
                />
              </Col>
              <Col md="8">
                <CardCell
                  title={
                    <Term
                      title={translate(
                        "component.contracts.ContractDetails.code_hash.title"
                      )}
                      text={translate(
                        "component.contracts.ContractDetails.code_hash.text"
                      )}
                    />
                  }
                  text={contractInfo.codeHash}
                  className="block-card-created account-card-back border-0"
                />
              </Col>
            </Row>
          </div>
          <style jsx global>{`
            .contract-title {
              position: relative;
              z-index: 1;
              padding: 8px;
              width: 140px;
              top: 16px;
              margin-top: 32px;
              margin-left: 50px;
              background: #ffffff;
              box-sizing: border-box;
              border-radius: 25px;
              font-size: 14px;
              line-height: 16px;
              color: #999999;
              font-weight: 500;
              letter-spacing: 1.75px;
              text-transform: uppercase;
            }

            .contract-info-container {
              border: solid 4px #e6e6e6;
              border-radius: 4px;
              margin: 0 15px;
              background: #f8f8f8;
            }
          `}</style>
        </>
      )}
    </Translate>
  );
};

export default ContractDetails;
