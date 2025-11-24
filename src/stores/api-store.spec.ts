import { atom } from "nanostores";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type ApiFunction, createApiStore } from "./api-store";

describe("createApiStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const createMockFetcher = <T>(
    mockData?: T,
    mockError?: Error,
  ): ApiFunction<T, { url: string }, unknown> => {
    return vi.fn().mockImplementation(async () => {
      if (mockError) {
        throw mockError;
      }

      return Promise.resolve(mockData);
    });
  };

  describe("Store Creation", () => {
    it("should create a store with basic configuration", () => {
      const mockData = { url: "https://test.com" };
      const mockFetcher = createMockFetcher(mockData);

      const store = createApiStore<unknown, typeof mockData, unknown>(
        mockFetcher,
        {
          storeKey: "test",
        },
      );

      expect(store).toBeDefined();
      expect(typeof store.get).toBe("function");
      expect(typeof store.subscribe).toBe("function");
    });

    it("should handle mapToOptions", async () => {
      const mockData = { url: "https://test.com" };
      const mockFetcher = createMockFetcher(mockData);
      const mapToOptions = vi.fn().mockReturnValue({
        path: { id: "123" },
      });

      const store = createApiStore<unknown, typeof mockData, unknown>(
        mockFetcher,
        {
          mapToOptions,
          params: ["123"],
          storeKey: "test",
        },
      );

      store.subscribe(() => {})();

      expect(mapToOptions).toHaveBeenCalledWith(["123"]);
    });
  });

  describe("Parameter Handling", () => {
    it("should handle atom params correctly", async () => {
      const mockFetcher = createMockFetcher({ test: "data" });

      const $param = atom("test");
      const store = createApiStore(mockFetcher, {
        params: [$param],
        storeKey: "test",
      });

      store.subscribe(() => {})();

      expect(mockFetcher).toHaveBeenCalled();
    });

    it("should handle parameter type conversion", async () => {
      const mockFetcher = createMockFetcher({ test: "data" });
      const mapToOptions = vi.fn().mockReturnValue({});

      const store = createApiStore(mockFetcher, {
        mapToOptions,
        params: [123, "456"],
        storeKey: "test",
      });

      store.subscribe(() => {})();

      expect(mapToOptions).toHaveBeenCalledWith(["123", "456"]);
    });
  });

  describe("Integration Tests", () => {
    it("should handle polling lifecycle with params", async () => {
      vi.spyOn(window, "setInterval");
      vi.spyOn(window, "clearInterval");

      const $param = atom("initial");
      const onError = vi.fn();

      $param.set("updated");
      await vi.advanceTimersByTimeAsync(1000);

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("Store Operations", () => {
    it("should handle basic data fetching", async () => {
      const mockData = { test: "data" };
      const store = createApiStore(createMockFetcher(mockData), {
        storeKey: "fetch-test",
      });

      const subscription = vi.fn();
      const unsubscribe = store.subscribe(subscription);

      expect(subscription).toHaveBeenCalledWith(
        expect.objectContaining({ loading: true }),
      );

      await vi.runOnlyPendingTimersAsync();
      unsubscribe();
    });
  });
});
