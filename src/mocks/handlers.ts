import { fromOpenApi } from "@msw/source/open-api";
import { getAppConfig } from "@/config/app.config.ts";
import { RequestHandler } from "msw";

const appConfig = getAppConfig();

const generateOpenApiHandlers = async (): Promise<RequestHandler[]> => {
  try {
    const response = await fetch(appConfig.apiDocsUrl);

    if (!response.ok) throw new Error(`${response.status}`);
    const openApiDocument = await response.text();
    const handlers = await fromOpenApi(openApiDocument);

    console.log(`✅ ${handlers.length} OpenAPI handlers from spec`);

    return handlers;
  } catch (err) {
    console.error("❌ OpenAPI generation failed:", err);

    return [];
  }
};

export const getHandlers = async () => {
  const openApiHandlers = await generateOpenApiHandlers();

  return [...openApiHandlers];
};
