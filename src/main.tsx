import { createRoot } from "react-dom/client";

import { getAppConfig } from "@/config/app.config";

import "./index.css";
import { App } from "./App";

const appConfig = getAppConfig();

const enableMocking = async (): Promise<
  ServiceWorkerRegistration | undefined
> => {
  if (!appConfig.apiMocksEnabled) {
    return undefined;
  }

  try {
    const { worker } = await import("./mocks/browser");

    return await worker.start({
      onUnhandledRequest: "bypass",
    });
  } catch (error) {
    console.warn("MSW failed to start:", error);

    return undefined;
  }
};

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
