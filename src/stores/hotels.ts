import { computed } from "nanostores";
import { createApiStore } from "./api-store";
import { getHotels, getHotelById } from "@/api";
import { $router } from "./router";

export const $hotels = createApiStore(getHotels, {
  storeKey: "hotelsList",
  mapToOptions: () => ({
    query: { page: 1, pageSize: 10 },
  }),
});

export const $hotelContent = createApiStore(getHotelById, {
  storeKey: "hotelContent",
  params: [
    computed($router, (router) =>
      router?.route === "hotelEdit" ? router.params.id : null,
    ),
  ],
  mapToOptions: (params: string[]) => ({
    path: { id: params[0] ?? "" },
  }),
});
