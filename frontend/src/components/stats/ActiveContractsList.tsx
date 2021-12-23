import React, { useCallback, useMemo } from "react";
import ReactEcharts from "echarts-for-react";

import { truncateAccountId } from "../../libraries/formatting";

import { Props } from "./TransactionsByDate";

import { Translate } from "react-localize-redux";
import { useWampQuery } from "../../hooks/wamp";

const ActiveContractsList = ({ chartStyle }: Props) => {
  const activeContracts =
    useWampQuery(
      useCallback(
        async (wampCall) =>
          (await wampCall("active-contracts-list", [])).reverse(),
        []
      )
    ) ?? [];
  const activeContractsIds = useMemo(
    () => activeContracts.map(({ contract }) => truncateAccountId(contract)),
    [activeContracts]
  );
  const activeContractsReceiptsCount = useMemo(
    () => activeContracts.map(({ receiptsCount }) => Number(receiptsCount)),
    [activeContracts]
  );

  const getOption = (translate: Function) => {
    return {
      title: {
        text: translate("component.stats.ActiveContractsList.title"),
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
          name: translate("common.receipts.receipts"),
          type: "value",
        },
      ],
      yAxis: [
        {
          type: "category",
          data: activeContractsIds,
        },
      ],
      series: [
        {
          type: "bar",
          data: activeContractsReceiptsCount,
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

export default ActiveContractsList;
