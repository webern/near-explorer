import autobahn from "autobahn";
import { ExplorerConfig } from "next.config";
import getConfig from "next/config";

let connection: autobahn.Connection | undefined;

const getConnection = (): autobahn.Connection => {
  if (!connection) {
    const {
      publicRuntimeConfig,
      serverRuntimeConfig,
    } = getConfig() as ExplorerConfig;

    connection = new autobahn.Connection({
      url: (typeof window === "undefined"
        ? serverRuntimeConfig
        : publicRuntimeConfig
      ).wampNearExplorerUrl,
      realm: "near-explorer",
      retry_if_unreachable: true,
      max_retries: Number.MAX_SAFE_INTEGER,
      max_retry_delay: 10,
    });
  }
  return connection;
};

let sessionPromise: Promise<autobahn.Session>;

export const getSession = (): Promise<autobahn.Session> => {
  if (!sessionPromise) {
    sessionPromise = new Promise((resolve, reject) => {
      const connection = getConnection();
      connection.onopen = (session) => {
        resolve(session);
      };
      connection.onclose = (reason) => {
        reject(reason);
        return false;
      };
      connection.open();
    });
  }
  return sessionPromise;
};

let wampSucriptionCache: Record<
  string,
  {
    subscription: autobahn.ISubscription;
    lastValue?: unknown;
  }
> = {};

export const subscribeTopic = async <T>(
  topic: string,
  handler: (data: T) => void
): Promise<void> => {
  if (wampSucriptionCache[topic]) {
    return;
  }
  const session = await getSession();
  wampSucriptionCache[topic] = {
    subscription: await session.subscribe(topic, (_args, kwargs) => {
      handler(kwargs);
      wampSucriptionCache[topic].lastValue = kwargs;
    }),
    lastValue: undefined,
  };
};

export const unsubscribeTopic = async (topic: string): Promise<void> => {
  const cacheItem = wampSucriptionCache[topic];
  if (!cacheItem) {
    return;
  }
  delete wampSucriptionCache[topic];
  await cacheItem.subscription.unsubscribe();
};

export const getLastValue = <T>(topic: string): T | undefined => {
  return wampSucriptionCache[topic]?.lastValue as T;
};

export async function call<T, Args extends unknown[]>(
  procedure: string,
  args: Args
): Promise<T> {
  const session = await getSession();
  const result = await session.call(procedure, args);
  return result as T;
}
