import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";
import { Tabs, Tab } from "react-bootstrap";

import { Props } from "./TransactionsByDate";

import { Translate } from "react-localize-redux";
import { useWampSimpleQuery } from "../../hooks/wamp";

const ActiveAccountsByDate = ({ chartStyle }: Props) => {
  const accountsByWeekCount =
    useWampSimpleQuery("active-accounts-count-aggregated-by-week", []) ?? [];
  const accountsByDateCount =
    useWampSimpleQuery("active-accounts-count-aggregated-by-date", []) ?? [];

  const accountsByWeek = useMemo(
    () => accountsByWeekCount.map(({ accountsCount }) => Number(accountsCount)),
    [accountsByWeekCount]
  );
  const accountsByWeekDate = useMemo(
    () => accountsByWeekCount.map(({ date }) => date.slice(0, 10)),
    [accountsByWeekCount]
  );

  const accountsByDate = useMemo(
    () => accountsByDateCount.map(({ accountsCount }) => Number(accountsCount)),
    [accountsByDateCount]
  );
  const accountsByDateDate = useMemo(
    () => accountsByDateCount.map(({ date }) => date.slice(0, 10)),
    [accountsByDateCount]
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
        <Tabs defaultActiveKey="daily" id="activeAccountsByDate">
          <Tab eventKey="daily" title={translate("common.stats.daily")}>
            <ReactEcharts
              option={getOption(
                translate(
                  "component.stats.ActiveAccountsByDate.daily_number_of_active_accounts"
                ).toString(),
                translate(
                  "component.stats.ActiveAccountsByDate.active_accounts"
                ).toString(),
                accountsByDate,
                accountsByDateDate
              )}
              style={chartStyle}
            />
          </Tab>
          <Tab eventKey="weekly" title={translate("common.stats.weekly")}>
            <ReactEcharts
              option={getOption(
                translate(
                  "component.stats.ActiveAccountsByDate.weekly_number_of_active_accounts"
                ).toString(),
                translate(
                  "component.stats.ActiveAccountsByDate.active_accounts"
                ).toString(),
                accountsByWeek,
                accountsByWeekDate
              )}
              style={chartStyle}
            />
          </Tab>
        </Tabs>
      )}
    </Translate>
  );
};

export default ActiveAccountsByDate;
