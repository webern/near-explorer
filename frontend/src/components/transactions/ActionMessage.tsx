import { hexy } from "hexy";

import AccountLink from "../utils/AccountLink";
import Balance from "../utils/Balance";
import CodePreview from "../utils/CodePreview";

import { Translate } from "react-localize-redux";
import {
  AddKey,
  CreateAccount,
  DeleteAccount,
  DeleteKey,
  DeployContract,
  FunctionCall,
  Stake,
  Transfer,
} from "../../libraries/wamp/types";

export interface Props<A> {
  actionKind: keyof TransactionMessageRenderers;
  actionArgs: A;
  receiverId: string;
  showDetails?: boolean;
}

type AnyAction =
  | CreateAccount
  | DeleteAccount
  | DeployContract
  | FunctionCall
  | Transfer
  | Stake
  | AddKey
  | DeleteKey;

interface TransactionMessageRenderers {
  CreateAccount: React.FC<Props<CreateAccount>>;
  DeleteAccount: React.FC<Props<DeleteAccount>>;
  DeployContract: React.FC<Props<DeployContract>>;
  FunctionCall: React.FC<Props<FunctionCall>>;
  Transfer: React.FC<Props<Transfer>>;
  Stake: React.FC<Props<Stake>>;
  AddKey: React.FC<Props<AddKey>>;
  DeleteKey: React.FC<Props<DeleteKey>>;
}

export const displayArgs = (args: string) => {
  const decodedArgs = Buffer.from(args, "base64");
  let prettyArgs: string;
  try {
    const parsedJSONArgs = JSON.parse(decodedArgs.toString());
    prettyArgs = JSON.stringify(parsedJSONArgs, null, 2);
  } catch {
    prettyArgs = hexy(decodedArgs, { format: "twos" });
  }
  return (
    <Translate>
      {({ translate }) => (
        <CodePreview
          collapseOptions={{
            collapseText: translate("button.show_more").toString(),
            expandText: translate("button.show_less").toString(),
            minHeight: 200,
            maxHeight: 600,
          }}
          value={prettyArgs}
        />
      )}
    </Translate>
  );
};

const transactionMessageRenderers: TransactionMessageRenderers = {
  CreateAccount: ({ receiverId }: Props<CreateAccount>) => (
    <>
      <Translate id="component.transactions.ActionMessage.CreateAccount.new_account_created" />
      <AccountLink accountId={receiverId} />
    </>
  ),
  DeleteAccount: ({ receiverId, actionArgs }: Props<DeleteAccount>) => (
    <>
      <Translate id="component.transactions.ActionMessage.DeleteAccount.delete_account" />
      <AccountLink accountId={receiverId} />
      <Translate id="component.transactions.ActionMessage.DeleteAccount.and_transfer_fund_to" />
      <AccountLink accountId={actionArgs.beneficiary_id} />
    </>
  ),
  DeployContract: ({ receiverId }: Props<DeployContract>) => (
    <>
      <Translate id="component.transactions.ActionMessage.DeployContract.contract_deployed" />
      <AccountLink accountId={receiverId} />
    </>
  ),
  FunctionCall: ({
    receiverId,
    actionArgs,
    showDetails,
  }: Props<FunctionCall>) => {
    let args;
    if (showDetails) {
      if (typeof actionArgs.args === "undefined") {
        args = <p>Loading...</p>;
      } else if (
        (typeof actionArgs.args === "string" && actionArgs.args.length === 0) ||
        !actionArgs.args
      ) {
        args = <p>The arguments are empty</p>;
      } else {
        args = displayArgs(actionArgs.args);
      }
    }
    return (
      <>
        <Translate
          id="component.transactions.ActionMessage.FunctionCall.called_method"
          data={{ method_name: actionArgs.method_name }}
        />
        <AccountLink accountId={receiverId} />
        {showDetails ? (
          <dl>
            <dt>
              <Translate
                id="component.transactions.ActionMessage.FunctionCall.arguments"
                data={{ method_name: actionArgs.method_name }}
              />
            </dt>
            <dd>{args}</dd>
          </dl>
        ) : null}
      </>
    );
  },
  Transfer: ({ receiverId, actionArgs: { deposit } }: Props<Transfer>) => (
    <>
      <Translate id="component.transactions.ActionMessage.Transfer.transferred" />
      <Balance amount={deposit} />
      <Translate id="component.transactions.ActionMessage.Transfer.to" />
      <AccountLink accountId={receiverId} />
    </>
  ),
  Stake: ({ actionArgs: { stake, public_key } }: Props<Stake>) => (
    <>
      <Translate id="component.transactions.ActionMessage.Stake.staked" />
      <Balance amount={stake} />{" "}
      <Translate
        id="component.transactions.ActionMessage.Stake.with_key"
        data={{ public_key: public_key.substring(0, 15) }}
      />
    </>
  ),
  AddKey: ({ receiverId, actionArgs }: Props<AddKey>) => (
    <>
      {typeof actionArgs.access_key.permission === "object" ? (
        actionArgs.access_key.permission.permission_kind ? (
          <>
            <Translate id="component.transactions.ActionMessage.AddKey.new_key_added" />
            <AccountLink accountId={receiverId} />
            {`: ${actionArgs.public_key.substring(0, 15)}...`}
            <p>
              <Translate
                id="component.transactions.ActionMessage.AddKey.with_permission_and_nounce"
                data={{
                  permission: actionArgs.access_key.permission.permission_kind,
                  nonce: actionArgs.access_key.nonce,
                }}
              />
            </p>
          </>
        ) : (
          <>
            <Translate id="component.transactions.ActionMessage.AddKey.access_key_added_for_contract" />
            <AccountLink
              accountId={
                actionArgs.access_key.permission.FunctionCall.receiver_id
              }
            />
            {`: ${actionArgs.public_key.substring(0, 15)}...`}
            <Translate>
              {({ translate }) => (
                <p>
                  {translate(
                    "component.transactions.ActionMessage.AddKey.with_permission_call_method_and_nounce",
                    {
                      methods:
                        actionArgs.access_key.permission.FunctionCall
                          .method_names.length > 0
                          ? `(${actionArgs.access_key.permission.FunctionCall.method_names.join(
                              ", "
                            )})`
                          : translate(
                              "component.transactions.ActionMessage.AddKey.any"
                            ),
                      nonce: actionArgs.access_key.nonce,
                    }
                  )}
                </p>
              )}
            </Translate>
          </>
        )
      ) : (
        <>
          <Translate id="component.transactions.ActionMessage.AddKey.new_key_added" />
          <AccountLink accountId={receiverId} />
          {`: ${actionArgs.public_key.substring(0, 15)}...`}
          <p>
            <Translate
              id="component.transactions.ActionMessage.AddKey.with_permission_and_nounce"
              data={{
                permission: actionArgs.access_key.permission,
                nonce: actionArgs.access_key.nonce,
              }}
            />
          </p>
        </>
      )}
    </>
  ),
  DeleteKey: ({ actionArgs: { public_key } }: Props<DeleteKey>) => (
    <Translate
      id="component.transactions.ActionMessage.DeleteKey.key_deleted"
      data={{ public_key: public_key.substring(0, 15) }}
    />
  ),
};

const ActionMessage = (props: Props<AnyAction>) => {
  const MessageRenderer = transactionMessageRenderers[props.actionKind];
  if (MessageRenderer === undefined) {
    return (
      <>
        `${props.actionKind}: ${JSON.stringify(props.actionArgs)}`
      </>
    );
  }
  return (
    <MessageRenderer {...(props as any)} showDetails={props.showDetails} />
  );
};

export default ActionMessage;
