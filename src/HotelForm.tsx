import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { createHotel, type HotelUpsert, updateHotel } from "@/api";
import { zHotelUpsert } from "@/api/zod.gen";
import { $hotelContent, $hotels } from "@/stores/hotels";
import { $router } from "@/stores/router";

export function HotelForm() {
  const router = useStore($router);
  const hotelData = useStore($hotelContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = router?.route === "hotelEdit";
  const hotelId = isEditMode ? router.params.id : undefined;

  const form = useForm<HotelUpsert>({
    defaultValues: {
      name: undefined,
      location: undefined,
      status: undefined,
    },
    resolver: zodResolver(zHotelUpsert),
  });

  useEffect(() => {
    if (hotelData?.data) {
      form.reset({
        name: hotelData.data.name,
        location: hotelData.data.location,
        status: hotelData.data.status,
      });
    }
  }, [hotelData?.data, form]);

  const onSubmit = async (data: HotelUpsert) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && hotelId) {
        await updateHotel({
          path: { id: hotelId },
          body: data,
        });
      } else {
        await createHotel({
          body: data,
        });
      }

      alert("Hotel saved!");
      $hotels.invalidate();
      $router.set({ route: "hotelList" });
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        "errors" in error &&
        typeof (error as Record<string, unknown>).errors === "object"
      ) {
        const validationErrors = (
          error as { errors: Record<string, string> }
        ).errors;

        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof HotelUpsert, {
            type: "server",
            message,
          });
        });
      }

      alert("Failed to save hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && hotelData?.loading) {
    return <div>Loading...</div>;
  }

  if (isEditMode && hotelData?.error) {
    return <div>Error: {hotelData.error.message}</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} style={{ maxWidth: 400 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Hotel Name</label>
        <input
          {...form.register("name")}
          placeholder="Olympus Mons Resort"
          style={{ width: "100%", padding: 8 }}
        />
        {form.formState.errors.name && (
          <span style={{ color: "red", fontSize: 12 }}>
            {form.formState.errors.name.message}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Location on Mars
        </label>
        <input
          {...form.register("location")}
          placeholder="Valles Marineris"
          style={{ width: "100%", padding: 8 }}
        />
        {form.formState.errors.location && (
          <span style={{ color: "red", fontSize: 12 }}>
            {form.formState.errors.location.message}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Status</label>
        <select
          {...form.register("status")}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="closed">Closed</option>
        </select>
        {form.formState.errors.status && (
          <span style={{ color: "red", fontSize: 12 }}>
            {form.formState.errors.status.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "8px 16px",
          background: isSubmitting ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Saving..." : "Save Hotel"}
      </button>
    </form>
  );
}
