import Head from "next/head";

import { Container } from "react-bootstrap";

import AccountDetails from "../../components/accounts/AccountDetails";
import ContractDetails from "../../components/contracts/ContractDetails";
import Transactions from "../../components/transactions/Transactions";
import Content from "../../components/utils/Content";

import TransactionIcon from "../../../public/static/images/icon-t-transactions.svg";

import { Translate } from "react-localize-redux";
import { GetServerSideProps, NextPage } from "next";
import { useAnalyticsTrackOnMount } from "../../hooks/analytics/use-analytics-track-on-mount";
import wampApi from "../../libraries/wamp/api";
import { getNearNetwork } from "../../libraries/config";
import { Account, getAccount } from "../../providers/accounts";

interface Props {
  accountId: string;
  account?: Account;
  accountFetchingError?: unknown;
  accountError?: unknown;
}

const AccountDetail: NextPage<Props> = ({
  accountId,
  account,
  accountError,
  accountFetchingError,
}) => {
  useAnalyticsTrackOnMount("Explorer View Individual Account", {
    accountId,
  });

  return (
    <>
      <Head>
        <title>NEAR Explorer | Account</title>
      </Head>
      <Content
        title={
          <h1>
            <Translate id="common.accounts.account" />
            {`: @${accountId}`}
          </h1>
        }
        border={false}
      >
        {account ? (
          <AccountDetails account={account} />
        ) : accountError ? (
          <Translate
            id="page.accounts.error.account_not_found"
            data={{ account_id: accountId }}
          />
        ) : (
          <Translate
            id="page.accounts.error.account_fetching"
            data={{ account_id: accountId }}
          />
        )}
      </Content>
      {accountError || accountFetchingError ? null : (
        <>
          <Container>
            <ContractDetails accountId={accountId} />
          </Container>
          <Content
            size="medium"
            icon={<TransactionIcon style={{ width: "22px" }} />}
            title={
              <h2>
                <Translate id="common.transactions.transactions" />
              </h2>
            }
          >
            <Transactions accountId={accountId} count={10} />
          </Content>
        </>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async ({ req, params, res }) => {
  const accountId = params!.id;
  if (/[A-Z]/.test(accountId) && res) {
    return {
      redirect: {
        permanent: true,
        destination: `/accounts/${accountId.toLowerCase()}`,
      },
    };
  }

  try {
    const currentNetwork = getNearNetwork(req);
    const wampCall = wampApi.call(currentNetwork);
    const isAccountExist = await wampCall("is-account-indexed", [accountId]);
    if (isAccountExist) {
      try {
        return {
          props: {
            accountId,
            account: await getAccount(wampCall, accountId),
          },
        };
      } catch (accountFetchingError) {
        return {
          props: {
            accountId,
            accountFetchingError,
          },
        };
      }
    }
    return {
      props: {
        accountId,
        accountError: `Account ${accountId} does not exist`,
      },
    };
  } catch (accountError) {
    return {
      props: {
        accountId,
        accountError,
      },
    };
  }
};

export default AccountDetail;
