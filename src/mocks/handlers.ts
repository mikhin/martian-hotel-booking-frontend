import { fromOpenApi } from "@msw/source/open-api";
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
} from "@/api/types.gen";
import { getAppConfig } from "@/config/app.config.ts";

const appConfig = getAppConfig();

const mockHotels: Hotel[] = [
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

const hotelHandlers: RequestHandler[] = [
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
      if (index === -1) return new HttpResponse(null, { status: 404 });

      mockHotels[index] = { ...mockHotels[index], ...body };
      return HttpResponse.json(mockHotels[index]);
    },
  ),
];

const generateOpenApiHandlers = async (): Promise<RequestHandler[]> => {
  try {
    const response = await fetch(appConfig.apiDocsUrl);
    if (!response.ok) throw new Error(`${response.status}`);

    const handlers = await fromOpenApi(await response.text());
    console.log(`✅ ${handlers.length} OpenAPI handlers from spec`);
    return handlers;
  } catch (err) {
    console.error("❌ OpenAPI generation failed:", err);
    return [];
  }
};

export const getHandlers = async () => {
  const openApiHandlers = await generateOpenApiHandlers();
  return [...hotelHandlers, ...openApiHandlers];
};
