import { setupWorker } from "msw/browser";

import { getHandlers } from "./handlers";

const resolvedHandlers = await getHandlers();

export const worker = setupWorker(...resolvedHandlers);
