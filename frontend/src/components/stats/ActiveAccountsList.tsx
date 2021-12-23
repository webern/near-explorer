import React, { useCallback, useMemo } from "react";
import ReactEcharts from "echarts-for-react";

import { truncateAccountId } from "../../libraries/formatting";

import { Props } from "./TransactionsByDate";

import { Translate } from "react-localize-redux";
import { useWampQuery } from "../../hooks/wamp";

const ActiveAccountsList = ({ chartStyle }: Props) => {
  const accounts =
    useWampQuery(
      useCallback(
        async (wampCall) =>
          (await wampCall("active-accounts-list", [])).reverse(),
        []
      )
    ) ?? [];
  const accountsIds = useMemo(
    () => accounts.map(({ account }) => truncateAccountId(account)),
    [accounts]
  );
  const accountsTransactionCount = useMemo(
    () => accounts.map(({ transactionsCount }) => Number(transactionsCount)),
    [accounts]
  );

  const getOption = (translate: Function) => {
    return {
      title: {
        text: translate("component.stats.ActiveAccountsList.title"),
      },
      grid: { containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: [
        {
          name: translate("common.transactions.transactions"),
          type: "value",
        },
      ],
      yAxis: [
        {
          type: "category",
          data: accountsIds,
        },
      ],
      series: [
        {
          type: "bar",
          data: accountsTransactionCount,
        },
      ],
    };
  };

  return (
    <Translate>
      {({ translate }) => (
        <ReactEcharts option={getOption(translate)} style={chartStyle} />
      )}
    </Translate>
  );
};

export default ActiveAccountsList;
