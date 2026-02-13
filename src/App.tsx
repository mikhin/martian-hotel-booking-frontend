import { useStore } from "@nanostores/react";
import { $hotels } from "@/stores/hotels.ts";
import { $router } from "@/stores/router.ts";
import { HotelForm } from "./HotelForm";
import { useEffect } from "react";
import { client } from "./api/client.gen";
import { getAppConfig } from "@/config/app.config.ts";

const appConfig = getAppConfig();

const statusColors: Record<string, { bg: string; text: string }> = {
  active: {
    bg: "var(--color-status-active-bg)",
    text: "var(--color-status-active-text)",
  },
  maintenance: {
    bg: "var(--color-status-maintenance-bg)",
    text: "var(--color-status-maintenance-text)",
  },
  closed: {
    bg: "var(--color-status-closed-bg)",
    text: "var(--color-status-closed-text)",
  },
};

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
      <div>
        <button
          onClick={() => $router.set({ route: "hotelList" })}
          style={{ marginBottom: 16 }}
        >
          ← Back to List
        </button>
        <h1
          style={{
            marginBottom: 32,
          }}
        >
          Edit Hotel
        </h1>
        <HotelForm />
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <h1>Hotels</h1>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {data?.items.map((hotel) => {
          const colors = statusColors[hotel.status] ?? statusColors.active;
          return (
            <div
              key={hotel.id}
              className="hotel-card"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: 16,
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ marginBottom: 4 }}>{hotel.name}</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  {hotel.location}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    padding: "3px 10px",
                    background: colors.bg,
                    color: colors.text,
                    borderRadius: 9999,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {hotel.status}
                </span>
              </div>
              <button
                className="btn-secondary"
                onClick={() =>
                  $router.set({ route: "hotelEdit", params: { id: hotel.id } })
                }
                style={{ padding: "6px 14px" }}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
