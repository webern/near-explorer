import Head from "next/head";

import TransactionIcon from "../../../public/static/images/icon-t-transactions.svg";

import BlockDetails from "../../components/blocks/BlockDetails";
import ReceiptsInBlock from "../../components/blocks/ReceiptsInBlock";
import Transactions from "../../components/transactions/Transactions";
import Content from "../../components/utils/Content";

import { Translate } from "react-localize-redux";
import { GetServerSideProps, NextPage } from "next";
import { useAnalyticsTrackOnMount } from "../../hooks/analytics/use-analytics-track-on-mount";
import { getNearNetwork } from "../../libraries/config";
import wampApi from "../../libraries/wamp/api";
import { Block, getBlock } from "../../providers/blocks";

type Props = {
  hash: string;
  block?: Block;
  err?: unknown;
};

const BlockDetail: NextPage<Props> = (props) => {
  useAnalyticsTrackOnMount("Explorer View Individual Block", {
    block: props.hash,
  });

  // Prepare the block object with all the right types and field names on render() since
  // `getInitialProps` can only return basic types to be serializable after Server-side Rendering
  const block = props.block;

  return (
    <Translate>
      {({ translate }) => (
        <>
          <Head>
            <title>NEAR Explorer | Block</title>
          </Head>
          <Content
            title={
              <h1>{`${translate("page.blocks.title").toString()} ${
                block ? `#${block.height}` : `${props.hash.substring(0, 7)}...`
              }`}</h1>
            }
            border={false}
          >
            {!block ? (
              <>{translate("page.blocks.error.block_fetching")}</>
            ) : (
              <BlockDetails block={block} />
            )}
          </Content>
          {!("err" in props) ? (
            <>
              <Content
                size="medium"
                icon={<TransactionIcon style={{ width: "22px" }} />}
                title={<h2>{translate("common.transactions.transactions")}</h2>}
              >
                <Transactions blockHash={props.hash} count={1000} />
              </Content>

              <Content
                size="medium"
                icon={<TransactionIcon style={{ width: "22px" }} />}
                title={<h2>{translate("common.receipts.receipts")}</h2>}
              >
                <ReceiptsInBlock blockHash={props.hash} />
              </Content>
            </>
          ) : null}
        </>
      )}
    </Translate>
  );
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { hash: string }
> = async ({ req, params }) => {
  const hash = params!.hash;
  try {
    const nearNetwork = getNearNetwork(req);
    const block = await getBlock(wampApi.call(nearNetwork), hash);
    return {
      props: { hash: block.hash, block },
    };
  } catch (err) {
    return {
      props: { hash, err },
    };
  }
};

export default BlockDetail;
