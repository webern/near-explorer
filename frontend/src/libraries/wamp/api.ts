import { ExplorerConfig, NearNetwork } from "next.config";
import getConfig from "next/config";
import * as connection from "./connection";
import {
  SubscriptionTopicType,
  SubscriptionTopicTypes,
  ProcedureType,
  ProcedureArgs,
  ProcedureResult,
} from "./types";

const nextConfig = getConfig() as ExplorerConfig;

const getTopicName = (
  nearNetwork: NearNetwork,
  topic: string,
  withDataSource?: boolean
): string => {
  let wampTopic = `com.nearprotocol.${nearNetwork.name}.explorer.${topic}`;
  if (withDataSource) {
    return `${wampTopic}:${nextConfig.publicRuntimeConfig.nearExplorerDataSource}`;
  }
  return wampTopic;
};

const getProcedureName = (
  nearNetwork: NearNetwork,
  procedure: string
): string => {
  return `com.nearprotocol.${nearNetwork.name}.explorer.${procedure}`;
};

let subscriptions: Record<string, ((data: any) => void)[]> = {};

function subscribe<T extends SubscriptionTopicType>(
  nearNetwork: NearNetwork,
  topic: T,
  handler: (data: SubscriptionTopicTypes[T]) => void,
  withDataSource?: boolean
): () => void {
  if (!subscriptions[topic]) {
    subscriptions[topic] = [];
  }
  subscriptions[topic].push(handler);
  void connection.subscribeTopic(
    getTopicName(nearNetwork, topic, withDataSource),
    (data) => subscriptions[topic].forEach((handler) => handler(data))
  );
  const lastValue = connection.getLastValue<SubscriptionTopicTypes[T]>(topic);
  if (lastValue) {
    handler(lastValue);
  }
  return () => {
    subscriptions[topic] = subscriptions[topic].filter(
      (lookupHandler) => lookupHandler !== handler
    );
    void connection.unsubscribeTopic(topic);
  };
}

export type WampCall = <P extends ProcedureType>(
  procedure: P,
  args: ProcedureArgs<P>
) => Promise<ProcedureResult<P>>;

function call(nearNetwork: NearNetwork): WampCall {
  return (procedure, args) =>
    connection.call(getProcedureName(nearNetwork, procedure), args);
}

const wampApi = { subscribe, call };

export default wampApi;
