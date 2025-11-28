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
  DeleteHotelData,
} from "@/api/types.gen";
import { getAppConfig } from "@/config/app.config.ts";

const appConfig = getAppConfig();

console.log({ appConfig });

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

  console.log("[MSW] Initialized with", hotels.length, "hotels");
  return hotels;
};

const mockHotels = initializeMockHotels();

const hotelHandlers: RequestHandler[] = [
  http.get<never, never, GetHotelsResponse>(
    `${appConfig.backendUrl}${"/hotels" satisfies GetHotelsData["url"]}`,
    ({ request }) => {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
      const start = (page - 1) * pageSize;

      console.log(`[MSW] GET /hotels - total: ${mockHotels.length}, page: ${page}`);

      const response: GetHotelsResponse = {
        items: mockHotels.slice(start, start + pageSize),
        totalItems: mockHotels.length,
        totalPages: Math.ceil(mockHotels.length / pageSize),
        currentPage: page,
        pageSize,
      };

      return HttpResponse.json(response);
    }
  ),

  http.get<GetHotelByIdData["path"]>(
    `${appConfig.backendUrl}/hotels/:id`,
    ({ params }) => {
      const hotel = mockHotels.find((h) => h.id === params.id);
      console.log(`[MSW] GET /hotels/${params.id} - ${hotel ? "found" : "not found"}`);
      return hotel
        ? HttpResponse.json(hotel)
        : new HttpResponse(null, { status: 404 });
    }
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
      console.log(`[MSW] POST /hotels - created: ${newHotel.name}`);
      return HttpResponse.json(newHotel, { status: 201 });
    }
  ),

  http.put<UpdateHotelData["path"], HotelUpsert, Hotel>(
    `${appConfig.backendUrl}/hotels/:id`,
    async ({ params, request }) => {
      const body = await request.json();
      const index = mockHotels.findIndex((h) => h.id === params.id);
      if (index === -1) {
        console.log(`[MSW] PUT /hotels/${params.id} - not found`);
        return new HttpResponse(null, { status: 404 });
      }

      mockHotels[index] = { ...mockHotels[index], ...body };
      console.log(`[MSW] PUT /hotels/${params.id} - updated`);
      return HttpResponse.json(mockHotels[index]);
    }
  ),

  http.delete<DeleteHotelData["path"]>(
    `${appConfig.backendUrl}/hotels/:id`,
    ({ params }) => {
      const index = mockHotels.findIndex((h) => h.id === params.id);
      if (index === -1) {
        console.log(`[MSW] DELETE /hotels/${params.id} - not found`);
        return new HttpResponse(null, { status: 404 });
      }

      mockHotels.splice(index, 1);
      console.log(`[MSW] DELETE /hotels/${params.id} - deleted`);
      return new HttpResponse(null, { status: 204 });
    }
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
  // Custom handlers AFTER OpenAPI handlers so they override
  return [...hotelHandlers, ...openApiHandlers];
};
