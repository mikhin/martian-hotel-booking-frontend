import { z } from "zod";

export interface ApplicationConfig {
  apiMocksEnabled: boolean;
  backendUrl: string;
  envMode: string;
  apiDocsUrl: string;
}

export const ApplicationConfigSchema = z.object({
  apiMocksEnabled: z.boolean(),
  backendUrl: z.string(),
  envMode: z.string(),
  apiDocsUrl: z.string(),
});

export const getAppConfig = (): ApplicationConfig => {
  const config = {
    apiMocksEnabled: import.meta.env.VITE_API_MOCKS_ENABLED === "true",
    backendUrl: import.meta.env.VITE_BACKEND_URL ?? "",
    envMode: import.meta.env.MODE ?? "production",
    apiDocsUrl: import.meta.env.VITE_API_DOCS_URL ?? "",
  };

  try {
    return ApplicationConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `[Application Config]: Environments validation failed. Please check environment variables.
        Error message: ${error.message}`,
      );
    }

    throw error;
  }
};
