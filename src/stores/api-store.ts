import {
  type CommonSettings,
  type FetcherStore,
  type KeyInput,
  nanoquery,
} from "@nanostores/query";
import { type ReadableAtom } from "nanostores";

import type { Options } from "@/api/sdk.gen";
import type { TDataShape as ClientTDataShape } from "@/api/client";

const [createFetcherStore] = nanoquery({});

// Type-safe parameter definition
type ParamValue = ReadableAtom<string | number | null> | string | number;

// Extract response data from a Responses type (200 status code)
type ExtractResponseData<TResponses> = TResponses extends { 200: infer TData }
  ? TData
  : TResponses;

// Convert param tuple to string tuple type
type ParamsTuple<T extends readonly ParamValue[]> = {
  [K in keyof T]: string;
};

// Configuration for creating an API store
export type StoreConfig<
  TDataShape extends ClientTDataShape,
  TParams extends readonly ParamValue[],
> = {
  storeKey: string;
  params?: TParams;
  mapToOptions?: TParams extends readonly []
    ? () => Options<TDataShape, false>
    : (params: ParamsTuple<TParams>) => Options<TDataShape, false>;
} & CommonSettings;

// API Store type
export type ApiStore<T> = FetcherStore<T>;

// Main createApiStore function with type inference
export function createApiStore<
  TDataShape extends ClientTDataShape,
  TResponses,
  TParams extends readonly ParamValue[] = readonly [],
>(
  // Accept any function that returns a RequestResult-like structure
  // Type inference works on the actual function passed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetcher: (...args: any[]) => Promise<{ data?: any }>,
  config: StoreConfig<TDataShape, TParams>,
): ApiStore<ExtractResponseData<TResponses>> {
  const storeParams: KeyInput = [
    config.storeKey,
    ...(config.params?.map((param) => {
      if (typeof param === "string" || typeof param === "number") {
        return param;
      }
      return param;
    }) ?? []),
  ];

  return createFetcherStore(storeParams, {
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
  }) as ApiStore<ExtractResponseData<TResponses>>;
}
