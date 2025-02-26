import Head from "next/head";
import NodeProvider, { NodeConsumer } from "../../context/NodeProvider";
import NetworkStatsProvider from "../../context/NetworkStatsProvider";

import Content from "../../components/utils/Content";
import TransactionsByDate from "../../components/stats/TransactionsByDate";
import GasUsedByDate from "../../components/stats/GasUsedByDate";
import NewAccountsByDate from "../../components/stats/NewAccountsByDate";
import NewContractsByDate from "../../components/stats/NewContractsByDate";
import ActiveAccountsByDate from "../../components/stats/ActiveAccountsByDate";
import ActiveContractsByDate from "../../components/stats/ActiveContractsByDate";
import ActiveAccountsList from "../../components/stats/ActiveAccountsList";
import ActiveContractsList from "../../components/stats/ActiveContractsList";
import StakingBar from "../../components/stats/StakingBar";
import ProtocolConfigInfo from "../../components/stats/ProtocolConfigInfo";
import CirculatingSupplyStats from "../../components/stats/CirculatingSupplyStats";
import { useNetworkContext } from "../../hooks/use-network-context";

import { Translate } from "react-localize-redux";
import { NextPage } from "next";
import { useAnalyticsTrackOnMount } from "../../hooks/analytics/use-analytics-track-on-mount";

const Stats: NextPage = () => {
  useAnalyticsTrackOnMount("Explorer View Stats page");
  const { currentNetwork } = useNetworkContext();

  const chartStyle = {
    height: "480px",
    width: "100%",
    marginTop: "26px",
    marginLeft: "24px",
  };
  return (
    <>
      <Head>
        <title>NEAR Explorer | Stats</title>
      </Head>
      <Content
        title={
          <h1>
            <Translate id="common.stats.title" />
          </h1>
        }
      >
        <div id="protocolConfiguration">
          <NetworkStatsProvider>
            <ProtocolConfigInfo />
          </NetworkStatsProvider>
        </div>
        {currentNetwork.name === "mainnet" ? (
          <div id="circulatingSupply">
            <CirculatingSupplyStats chartStyle={chartStyle} />
          </div>
        ) : null}
        <div id="transactionsByDate">
          <TransactionsByDate chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="gasUsedByDate">
          <GasUsedByDate chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="newAccountsByDate">
          <NewAccountsByDate chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="newContractsByDate">
          <NewContractsByDate chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="activeAccountsBydate">
          <ActiveAccountsByDate chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="activeContractsByDate">
          <ActiveContractsByDate chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="activeAccountsList">
          <ActiveAccountsList chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="activeContractsList">
          <ActiveContractsList chartStyle={chartStyle} />
        </div>
        <hr />
        <div id="validators">
          <NodeProvider>
            <NodeConsumer>
              {(context) =>
                typeof context.currentValidators !== "undefined" ? (
                  <StakingBar validators={context.currentValidators} />
                ) : null
              }
            </NodeConsumer>
          </NodeProvider>
        </div>
      </Content>
    </>
  );
};

export default Stats;
