import { useStore } from "@nanostores/react";
import { $hotels } from "@/stores/hotels.ts";
import { $router } from "@/stores/router.ts";
import { HotelForm } from "./HotelForm";
import { useEffect } from "react";
import { client } from "./api/client.gen";
import { getAppConfig } from "@/config/app.config.ts";

const appConfig = getAppConfig();

export function App() {
  const router = useStore($router);
  const { data, error, loading } = useStore($hotels);

  useEffect(() => {
    client.setConfig({
      baseUrl: appConfig.backendUrl,
      throwOnError: true,
    });
  }, []);

  if (router?.route === "hotelEdit") {
    return (
      <div style={{ padding: 20 }}>
        <button
          onClick={() => $router.set({ route: "hotelList" })}
          style={{ marginBottom: 16, padding: "6px 12px", cursor: "pointer" }}
        >
          ← Back to List
        </button>
        <h1>Edit Hotel</h1>
        <HotelForm />
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: 20 }}>Error: {error.message}</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1>Hotels</h1>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {data?.items.map((hotel) => (
          <div
            key={hotel.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0, marginBottom: 8 }}>{hotel.name}</h2>
              <p style={{ margin: 0, color: "#666" }}>{hotel.location}</p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "4px 8px",
                  background: hotel.status === "active" ? "#d4edda" : "#fff3cd",
                  color: hotel.status === "active" ? "#155724" : "#856404",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                {hotel.status}
              </span>
            </div>
            <button
              onClick={() =>
                $router.set({ route: "hotelEdit", params: { id: hotel.id } })
              }
              style={{
                padding: "6px 12px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
