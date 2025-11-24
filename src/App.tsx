import { useStore } from "@nanostores/react";
import { $hotels } from "@/stores/hotels.ts";

export function App() {
  const { data, error, loading } = useStore($hotels);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {data?.items.map((hotel) => (
        <div key={hotel.id}>
          <h2>{hotel.name}</h2>
          <p>{hotel.description}</p>
        </div>
      ))}
    </div>
  );
}
