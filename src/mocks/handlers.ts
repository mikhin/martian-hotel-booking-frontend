import { http, HttpResponse, type RequestHandler } from "msw";
import { nanoid } from "nanoid";

import type {
  Hotel,
  HotelUpsert,
  GetHotelsResponse,
  GetHotelsData,
  GetHotelByIdData,
  CreateHotelData,
  UpdateHotelData,
  DeleteHotelData,
} from "@/api/types.gen";
import { getAppConfig } from "@/config/app.config.ts";

const appConfig = getAppConfig();

const initializeMockHotels = (): Hotel[] => {
  const hotels: Hotel[] = [
    {
      id: nanoid(),
      name: "Olympus Mons Resort",
      location: "Olympus Mons",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Valles Marineris Hotel",
      location: "Valles Marineris",
      status: "maintenance",
      createdAt: new Date().toISOString(),
    },
  ];

  return hotels;
};

const mockHotels = initializeMockHotels();

export const hotelHandlers: RequestHandler[] = [
  http.get<never, never, GetHotelsResponse>(
    `${appConfig.backendUrl}${"/hotels" satisfies GetHotelsData["url"]}`,
    ({ request }) => {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
      const start = (page - 1) * pageSize;

      const response: GetHotelsResponse = {
        items: mockHotels.slice(start, start + pageSize),
        totalItems: mockHotels.length,
        totalPages: Math.ceil(mockHotels.length / pageSize),
        currentPage: page,
        pageSize,
      };

      return HttpResponse.json(response);
    },
  ),

  http.get<GetHotelByIdData["path"]>(
    `${appConfig.backendUrl}/hotels/:id`,
    ({ params }) => {
      const hotel = mockHotels.find((h) => h.id === params.id);

      return hotel
        ? HttpResponse.json(hotel)
        : new HttpResponse(null, { status: 404 });
    },
  ),

  http.post<never, HotelUpsert, Hotel>(
    `${appConfig.backendUrl}${"/hotels" satisfies CreateHotelData["url"]}`,
    async ({ request }) => {
      const body = await request.json();
      const newHotel: Hotel = {
        id: nanoid(),
        ...body,
        createdAt: new Date().toISOString(),
      };
      mockHotels.push(newHotel);

      return HttpResponse.json(newHotel, { status: 201 });
    },
  ),

  http.put<UpdateHotelData["path"], HotelUpsert, Hotel>(
    `${appConfig.backendUrl}/hotels/:id`,
    async ({ params, request }) => {
      const body = await request.json();
      const index = mockHotels.findIndex((h) => h.id === params.id);
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockHotels[index] = { ...mockHotels[index], ...body };

      return HttpResponse.json(mockHotels[index]);
    },
  ),

  http.delete<DeleteHotelData["path"]>(
    `${appConfig.backendUrl}/hotels/:id`,
    ({ params }) => {
      const index = mockHotels.findIndex((h) => h.id === params.id);
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockHotels.splice(index, 1);

      return new HttpResponse(null, { status: 204 });
    },
  ),
];
