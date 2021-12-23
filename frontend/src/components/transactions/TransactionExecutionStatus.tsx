import { Translate } from "react-localize-redux";
import { ExecutionStatus } from "../../libraries/wamp/types";

export interface Props {
  status: ExecutionStatus;
}
const TransactionExecutionStatusComponent = ({ status }: Props) => {
  return <Translate id={`common.transactions.status.${status}`} />;
};

export default TransactionExecutionStatusComponent;
