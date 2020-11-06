const moment = require("moment");

const models = require("../models");
const {
  backupDbOnReset,
  regularCheckGenesisInterval,
  regularSyncNewNearcoreStateInterval,
  regularSyncMissingNearcoreStateInterval,
  regularQueryRPCInterval,
  regularQueryStatsInterval,
  regularCheckNodeStatusInterval,
} = require("./config");

const { nearRpc, queryFinalTimestamp, queryNodeStats } = require("./near");

const {
  syncNewNearcoreState,
  syncMissingNearcoreState,
  syncGenesisState,
} = require("./sync");

const { setupWamp, wampPublish } = require("./wamp");

const {
  addNodeInfo,
  queryOnlineNodes,
  pickOnlineValidatingNode,
  getSyncedGenesis,
  queryDashboardBlockInfo,
  queryDashboardTxInfo,
} = require("./db-utils");

async function main() {
  console.log("Starting NEAR Explorer backend service...");

  await models.sequelize.sync();

  let genesisHeight, genesisTime, genesisChainId;

  const SyncGenesisState = async () => {
    console.log("Starting Genesis state sync...");
    try {
      await syncGenesisState();
    } catch (error) {
      console.warn("Genesis state crashed due to:", error);
    }
  };

  const syncedGenesis = await getSyncedGenesis();
  if (syncedGenesis) {
    genesisHeight = syncedGenesis.genesisHeight;
    genesisTime = syncedGenesis.genesisTime;
    genesisChainId = syncedGenesis.chainId;
  } else {
    setTimeout(SyncGenesisState, 0);
  }

  const regularCheckGenesis = async () => {
    console.log("Starting regular Genesis check...");
    try {
      const genesisConfig = await nearRpc.sendJsonRpc(
        "EXPERIMENTAL_genesis_config"
      );
      const genesisConfigGenesisTime = moment(
        genesisConfig.genesis_time
      ).valueOf();
      if (
        (genesisHeight &&
          genesisHeight !== genesisConfig.genesis_height.toString()) ||
        (genesisTime && genesisTime !== genesisConfigGenesisTime) ||
        (genesisChainId && genesisChainId !== genesisConfig.chain_id)
      ) {
        console.log(
          `Genesis has changed (height ${genesisHeight} -> ${genesisConfig.genesis_height}; \
          time ${genesisTime} -> ${genesisConfigGenesisTime}; chain id ${genesisChainId} -> \
          ${genesisConfig.chain_id}). We are resetting the database and shutting down the backend \
          to let it auto-start and sync from scratch.`
        );
        models.resetDatabase({ saveBackup: backupDbOnReset });
        process.exit(0);
      }
      genesisHeight = genesisConfig.genesis_height.toString();
      genesisTime = genesisConfigGenesisTime;
      console.log("Regular Genesis check is completed.");
    } catch (error) {
      console.warn("Regular Genesis check crashed due to:", error);
    }
    setTimeout(regularCheckGenesis, regularCheckGenesisInterval);
  };
  setTimeout(regularCheckGenesis, 0);

  const regularSyncNewNearcoreState = async () => {
    console.log("Starting regular new nearcore state sync...");
    try {
      await syncNewNearcoreState();
      console.log("Regular new nearcore state sync is completed.");
    } catch (error) {
      console.warn("Regular new nearcore state sync crashed due to:", error);
    }
    setTimeout(
      regularSyncNewNearcoreState,
      regularSyncNewNearcoreStateInterval
    );
  };
  setTimeout(regularSyncNewNearcoreState, 0);

  const regularSyncMissingNearcoreState = async () => {
    console.log("Starting regular missing nearcore state sync...");
    try {
      await syncMissingNearcoreState();
      console.log("Regular missing nearcore state sync is completed.");
    } catch (error) {
      console.warn(
        "Regular missing nearcore state sync crashed due to:",
        error
      );
    }
    setTimeout(
      regularSyncMissingNearcoreState,
      regularSyncMissingNearcoreStateInterval
    );
  };
  setTimeout(
    regularSyncMissingNearcoreState,
    regularSyncMissingNearcoreStateInterval
  );

  const wamp = setupWamp();
  console.log("Starting WAMP worker...");
  wamp.open();

  // regular check finalTimesamp and publish to final-timestamp uri
  const regularCheckFinalTimestamp = async () => {
    console.log("Starting regular final timestamp check...");
    try {
      if (wamp.session) {
        const finalTimestamp = await queryFinalTimestamp();
        wampPublish("final-timestamp", [finalTimestamp], wamp);
      }
      console.log("Regular final timestamp check is completed.");
    } catch (error) {
      console.warn("Regular final timestamp check  crashed due to:", error);
    }
    setTimeout(regularCheckFinalTimestamp, regularQueryRPCInterval);
  };
  setTimeout(regularCheckFinalTimestamp, 0);

  // regular check block/tx data stats and publish to data-stats uri
  const regularCheckDataStats = async () => {
    console.log("Starting regular data stats check...");
    try {
      if (wamp.session) {
        const blockStats = await queryDashboardBlockInfo();
        const transactionCountArray = await queryDashboardTxInfo();
        wampPublish("chain-block-stats", [{ blockStats }], wamp);
        wampPublish("chain-txs-stats", [{ transactionCountArray }], wamp);
      }
      console.log("Regular data stats check is completed.");
    } catch (error) {
      console.warn("Regular data stats check crashed due to:", error);
    }
    setTimeout(regularCheckDataStats, regularQueryStatsInterval);
  };
  setTimeout(regularCheckDataStats, 0);

  // regular check block/tx data from indexer
  const regularCheckDataStatsFromIndexer = async () => {
    console.log("Starting regular data stats check from indexer...");
    try {
      if (wamp.session) {
        const blockStats = await queryDashboardBlockInfo((from_indexer = true));
        const transactionCountArray = await queryDashboardTxInfo(
          (from_indexer = true)
        );
        wampPublish("chain-block-stats:from-indexer", [{ blockStats }], wamp);
        wampPublish(
          "chain-txs-stats:from-indexer",
          [{ transactionCountArray }],
          wamp
        );
      }
      console.log("Regular data stats check from indexer is completed.");
    } catch (error) {
      console.warn(
        "Regular data stats check from indexer is crashed due to:",
        error
      );
    }
    setTimeout(regularCheckDataStatsFromIndexer, regularQueryStatsInterval);
  };
  setTimeout(regularCheckDataStatsFromIndexer, 0);

  // regular check node status and publish to nodes uri
  const regularCheckNodeStatus = async () => {
    console.log("Starting regular node status check...");
    try {
      if (wamp.session) {
        let { currentValidators, proposals } = await queryNodeStats();
        let validators = await addNodeInfo(currentValidators);
        let onlineValidatingNodes = pickOnlineValidatingNode(validators);
        let onlineNodes = await queryOnlineNodes();
        if (!onlineNodes) {
          onlineNodes = [];
        }
        wampPublish(
          "nodes",
          [{ onlineNodes, validators, proposals, onlineValidatingNodes }],
          wamp
        );
        wampPublish(
          "node-stats",
          [
            {
              validatorAmount: validators.length,
              onlineNodeAmount: onlineNodes.length,
              proposalAmount: proposals.length,
            },
          ],
          wamp
        );
      }
      console.log("Regular node status check is completed.");
    } catch (error) {
      console.warn("Regular node status check crashed due to:", error);
    }
    setTimeout(regularCheckNodeStatus, regularCheckNodeStatusInterval);
  };
  setTimeout(regularCheckNodeStatus, 0);
}

main();
