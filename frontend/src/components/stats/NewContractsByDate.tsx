import React, { useMemo } from "react";
import { Tabs, Tab } from "react-bootstrap";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";

import { cumulativeSumArray } from "../../libraries/stats";

import { Props } from "./TransactionsByDate";

import { Translate } from "react-localize-redux";
import { useWampSimpleQuery } from "../../hooks/wamp";

const NewContractsByDate = ({ chartStyle }: Props) => {
  const uniqueDeployedContracts =
    useWampSimpleQuery(
      "unique-deployed-contracts-count-aggregate-by-date",
      []
    ) ?? [];
  const newContracts =
    useWampSimpleQuery("new-contracts-count-aggregated-by-date", []) ?? [];

  const newContractsDates = useMemo(
    () => newContracts.map(({ date }) => date.slice(0, 10)),
    [newContracts]
  );
  const newContractsCount = useMemo(
    () => newContracts.map(({ contractsCount }) => Number(contractsCount)),
    [newContracts]
  );
  const newContractsCountCumulative = useMemo(
    () => cumulativeSumArray(newContractsCount),
    [newContractsCount]
  );
  const uniqueContractsDates = useMemo(
    () => uniqueDeployedContracts.map(({ date }) => date.slice(0, 10)),
    [uniqueDeployedContracts]
  );
  const uniqueContractsCountCumulative = useMemo(
    () =>
      cumulativeSumArray(
        uniqueDeployedContracts.map(({ contractsCount }) =>
          Number(contractsCount)
        )
      ),
    [uniqueDeployedContracts]
  );

  const getOption = (
    title: string,
    seriesName: string,
    data: Array<number>,
    date: Array<string>
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
          data: date,
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
            color: "#48d4ab",
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
                color: "rgb(72, 212, 171)",
              },
              {
                offset: 1,
                color: "rgb(201, 255, 239)",
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
        <Tabs defaultActiveKey="daily" id="newContractsByDate">
          <Tab eventKey="daily" title={translate("common.stats.daily")}>
            <ReactEcharts
              option={getOption(
                translate(
                  "component.stats.NewContractsByDate.daily_number_of_new_contracts"
                ).toString(),
                translate(
                  "component.stats.NewContractsByDate.new_contracts"
                ).toString(),
                newContractsCount,
                newContractsDates
              )}
              style={chartStyle}
            />
          </Tab>
          <Tab eventKey="total" title={translate("common.stats.total")}>
            <ReactEcharts
              option={getOption(
                translate(
                  "component.stats.NewContractsByDate.total_number_of_new_contracts"
                ).toString(),
                translate(
                  "component.stats.NewContractsByDate.new_contracts"
                ).toString(),
                newContractsCountCumulative,
                newContractsDates
              )}
              style={chartStyle}
            />
          </Tab>
          <Tab eventKey="unique" title={translate("common.stats.unique")}>
            <ReactEcharts
              option={getOption(
                translate(
                  "component.stats.NewContractsByDate.total_number_of_unique_contracts"
                ).toString(),
                translate(
                  "component.stats.NewContractsByDate.new_contracts"
                ).toString(),
                uniqueContractsCountCumulative,
                uniqueContractsDates
              )}
              style={chartStyle}
            />
          </Tab>
        </Tabs>
      )}
    </Translate>
  );
};

export default NewContractsByDate;
