import { setupWorker } from "msw/browser";

import { hotelHandlerMap } from "./handlers";

const handlers = Object.values(hotelHandlerMap).flat();

export const worker = setupWorker(...handlers);
