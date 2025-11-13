import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://martian-hotel-booking-api.vercel.app/output.yml",
  output: "src/client",
});
