import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";

import { Props } from "./TransactionsByDate";

import { Translate } from "react-localize-redux";
import { useWampSimpleQuery } from "../../hooks/wamp";

const ActiveContractsByDate = ({ chartStyle }: Props) => {
  const contractsByDate =
    useWampSimpleQuery("active-contracts-count-aggregated-by-date", []) ?? [];
  const contractsByDateCount = useMemo(
    () => contractsByDate.map(({ contractsCount }) => contractsCount),
    [contractsByDate]
  );
  const contractsByDateDates = useMemo(
    () => contractsByDate.map(({ date }) => date.slice(0, 10)),
    [contractsByDate]
  );

  const getOption = (
    title: string,
    seriesName: string,
    data: Array<number>
  ) => {
    return {
      title: {
        text: title,
      },
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
        backgroundColor: "#F9F9F9",
        show: true,
        color: "white",
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: contractsByDateDates,
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            lineStyle: {
              color: "white",
            },
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
          filterMode: "filter",
        },
        {
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: seriesName,
          type: "line",
          lineStyle: {
            color: "#04a7bf",
            width: 2,
          },
          symbol: "circle",
          itemStyle: {
            color: "#25272A",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(4, 167, 191)",
              },
              {
                offset: 1,
                color: "rgb(201, 248, 255)",
              },
            ]),
          },
          data: data,
        },
      ],
    };
  };

  return (
    <Translate>
      {({ translate }) => (
        <ReactEcharts
          option={getOption(
            translate(
              "component.stats.ActiveContractsByDate.daily_number_of_active_contracts"
            ).toString(),
            translate(
              "component.stats.ActiveContractsByDate.active_contracts"
            ).toString(),
            contractsByDateCount
          )}
          style={chartStyle}
        />
      )}
    </Translate>
  );
};

export default ActiveContractsByDate;
