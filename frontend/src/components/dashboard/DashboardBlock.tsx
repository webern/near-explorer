import React from "react";
import { Col, Row } from "react-bootstrap";

import DashboardCard from "../utils/DashboardCard";
import LongCardCell from "../utils/LongCardCell";
import Term from "../utils/Term";
import Link from "../utils/Link";

import { Translate } from "react-localize-redux";
import { useChainBlockStats } from "../../hooks/subscriptions";
import { useLatestBlockHeight } from "../../hooks/data";

export interface Props {
  className?: string;
}

const DashboardBlock = ({ className }: Props) => {
  const latestBlockHeight = useLatestBlockHeight();
  const recentBlockProductionSpeed = useChainBlockStats()
    ?.recentBlockProductionSpeed;

  return (
    <Translate>
      {({ translate }) => (
        <DashboardCard
          className={`block-card ${className || ""}`}
          iconPath="/static/images/icon-blocks.svg"
          title={translate("common.blocks.blocks").toString()}
          headerRight={
            <Link href="/blocks">
              <a>
                <Translate id="button.view_all" />
              </a>
            </Link>
          }
        >
          <Row noGutters>
            <Col xs="6" md="12">
              <LongCardCell
                title={
                  <Term
                    title={translate(
                      "component.dashboard.DashboardBlock.block_height.title"
                    )}
                    text={translate(
                      "component.dashboard.DashboardBlock.block_height.text",
                      undefined,
                      { renderInnerHtml: true }
                    )}
                    href={"https://docs.near.org/docs/concepts/new-to-near"}
                  />
                }
                loading={latestBlockHeight === undefined}
                text={latestBlockHeight?.toLocaleString()}
              />
            </Col>
            <Col xs="6" md="12">
              <LongCardCell
                title={
                  <Term
                    title={translate(
                      "component.dashboard.DashboardBlock.avg_block_time.title"
                    )}
                    text={translate(
                      "component.dashboard.DashboardBlock.avg_block_time.text"
                    )}
                  />
                }
                loading={recentBlockProductionSpeed === undefined}
                text={
                  recentBlockProductionSpeed !== undefined
                    ? `${(1.0 / recentBlockProductionSpeed).toFixed(
                        4
                      )} ${translate("common.unit.seconds").toString()}`
                    : undefined
                }
              />
            </Col>
          </Row>
        </DashboardCard>
      )}
    </Translate>
  );
};

export default DashboardBlock;
