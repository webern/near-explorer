import React from "react";
import { Col, Row } from "react-bootstrap";

import DashboardCard from "../utils/DashboardCard";
import LongCardCell from "../utils/LongCardCell";
import Term from "../utils/Term";

import { Translate } from "react-localize-redux";
import { useNetworkStats } from "../../hooks/subscriptions";

const DashboardNode = () => {
  const networkStats = useNetworkStats();

  return (
    <Translate>
      {({ translate }) => (
        <DashboardCard
          iconPath="/static/images/icon-nodes.svg"
          title={translate("common.nodes.title").toString()}
          className="node-card"
        >
          <Row noGutters>
            <Col xs="6" md="12">
              <LongCardCell
                title={
                  <Term
                    title={translate(
                      "component.dashboard.DashboardNode.nodes_online.title"
                    )}
                    text={translate(
                      "component.dashboard.DashboardNode.nodes_online.text"
                    )}
                    href={
                      "https://docs.near.org/docs/validator/staking#run-the-node"
                    }
                  />
                }
                loading={networkStats === undefined}
                text={networkStats?.onlineNodesCount.toLocaleString()}
              />
            </Col>
            <Col xs="6" md="12">
              <LongCardCell
                title={
                  <Term
                    title={translate(
                      "component.dashboard.DashboardNode.nodes_validating.title"
                    )}
                    text={translate(
                      "component.dashboard.DashboardNode.nodes_validating.text"
                    )}
                    href={
                      "https://docs.near.org/docs/roles/integrator/faq#validators"
                    }
                  />
                }
                loading={networkStats === undefined}
                text={networkStats?.currentValidatorsCount.toLocaleString()}
                href={"/nodes/validators"}
                className="dashboard-validating-nodes-count"
              />
            </Col>
          </Row>
          <style jsx global>{`
            .dashboard-validating-nodes-count .card-cell-text {
              color: #00c08b;
            }
          `}</style>
        </DashboardCard>
      )}
    </Translate>
  );
};

export default DashboardNode;
