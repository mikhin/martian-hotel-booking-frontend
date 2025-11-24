import {
  type CommonSettings,
  type FetcherStore,
  type KeyInput,
  nanoquery,
} from "@nanostores/query";
import { type ReadableAtom } from "nanostores";

import type { RequestResult } from "@/api/client";
import type { Options } from "@/api/sdk.gen";

const [createFetcherStore] = nanoquery({});

export type DataShape = {
  body?: unknown;
  headers?: Record<string, string>;
  path?: Record<string, string>;
  query?: Record<string, unknown>;
  url: string;
};

export type ApiFunctionWithOptionalOptions<
  T,
  TData extends DataShape,
  TError = unknown,
> = <ThrowOnError extends boolean = false>(
  options?: Options<TData, ThrowOnError>,
) => RequestResult<T | undefined, TError, ThrowOnError>;

export type ApiFunctionWithRequiredOptions<
  T,
  TData extends DataShape,
  TError = unknown,
> = <ThrowOnError extends boolean = false>(
  options: Options<TData, ThrowOnError>,
) => RequestResult<T, TError, ThrowOnError>;

export type ApiFunction<T, TData extends DataShape, TError = unknown> =
  | ApiFunctionWithOptionalOptions<T, TData, TError>
  | ApiFunctionWithRequiredOptions<T, TData, TError>;

export type StoreConfig<TData extends DataShape> = {
  mapToOptions?: (params: string[]) => Options<TData, false>;
  params?: Array<
    number | ReadableAtom<null | number | string | boolean> | string
  >;
  storeKey: string;
} & CommonSettings;

export type ApiStore<T> = FetcherStore<T>;

export const createApiStore = <T, TData extends DataShape, TError = unknown>(
  fetcher: ApiFunction<T, TData, TError>,
  config: StoreConfig<TData>,
): ApiStore<T> => {
  const storeParams: KeyInput = [
    config.storeKey,
    ...(config.params?.map((param) => {
      if (typeof param === "string" || typeof param === "number") {
        return param;
      }

      return param as ReadableAtom<null | number | string>;
    }) || []),
  ];

  return createFetcherStore<T>(storeParams, {
    fetcher: async (...fetchParams) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...queryParams] = fetchParams;
      const mappedParams = queryParams.map(String);
      const options = config.mapToOptions
        ? config.mapToOptions(mappedParams)
        : ({} as Options<TData, false>);

      const result = await fetcher({ ...options, throwOnError: true });

      if (result.data === undefined) {
        throw new Error("No data received");
      }

      return result.data as T;
    },
    onErrorRetry: false,
    revalidateInterval: config.revalidateInterval,
  });
};
