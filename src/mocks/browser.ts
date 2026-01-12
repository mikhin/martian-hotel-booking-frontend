import { setupWorker } from "msw/browser";

import { hotelHandlers } from "./handlers";

export const worker = setupWorker(...hotelHandlers);
