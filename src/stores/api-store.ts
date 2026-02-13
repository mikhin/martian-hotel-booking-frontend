import {
  type CommonSettings,
  type FetcherStore,
  type KeyInput,
  nanoquery,
} from "@nanostores/query";
import { type ReadableAtom } from "nanostores";

import type { TDataShape as ClientTDataShape } from "@/api/client";
import type { Options } from "@/api/sdk.gen";

const [createFetcherStore] = nanoquery({});

export type StoreConfig<
  TDataShape extends ClientTDataShape,
  TParams extends readonly ParamValue[],
> = CommonSettings & {
  mapToOptions?: TParams extends readonly []
    ? () => Options<TDataShape, false>
    : (params: ParamsTuple<TParams>) => Options<TDataShape, false>;
  params?: TParams;
  storeKey: string;
};

type ApiStore<T> = FetcherStore<T>;

type ExtractResponseData<TResponses> = TResponses extends { 200: infer TData }
  ? TData
  : TResponses;

type InferResponses<F> = F extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<{ data?: infer TResponses }>
  ? TResponses
  : never;

type ParamsTuple<T extends readonly ParamValue[]> = {
  [K in keyof T]: string;
};

type ParamValue = number | ReadableAtom<null | number | string> | string;

export function createApiStore<
  TDataShape extends ClientTDataShape,
  F extends (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<{ data?: unknown }>,
  TParams extends readonly ParamValue[] = readonly [],
>(
  fetcher: F,
  config: StoreConfig<TDataShape, TParams>,
): ApiStore<ExtractResponseData<InferResponses<F>>> {
  const storeParams: KeyInput = [config.storeKey, ...(config.params ?? [])];

  return createFetcherStore(storeParams, {
    cacheLifetime: config.cacheLifetime,
    dedupeTime: config.dedupeTime,
    fetcher: async (...fetchParams: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...queryParams] = fetchParams;
      const mappedParams = queryParams.map(String);

      const options = config.mapToOptions
        ? config.mapToOptions(mappedParams as never)
        : {};

      const result = await fetcher({
        ...options,
        throwOnError: true,
      } as never);

      if (result.data === undefined) {
        throw new Error("No data received");
      }

      return result.data;
    },
    onErrorRetry: false,
    revalidateInterval: config.revalidateInterval,
    revalidateOnFocus: false,
  }) as ApiStore<ExtractResponseData<InferResponses<F>>>;
}
