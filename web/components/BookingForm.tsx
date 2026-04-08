"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

type Errors = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
};

export default function BookingForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (!destination.trim()) nextErrors.destination = "Destination is required";
    if (!checkIn) nextErrors.checkIn = "Check-in date is required";
    if (!checkOut) nextErrors.checkOut = "Check-out date is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    router.push(
      `/search?destination=${destination}&checkIn=${checkIn}&checkOut=${checkOut}`,
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="destination">Destination</label>
      <input
        id="destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      {errors.destination && <p>{errors.destination}</p>}

      <label htmlFor="check-in-date">Check-in date</label>
      <input
        id="check-in-date"
        type="date"
        value={checkIn}
        onChange={(e) => setCheckIn(e.target.value)}
      />
      {errors.checkIn && <p>{errors.checkIn}</p>}

      <label htmlFor="check-out-date">Check-out date</label>
      <input
        id="check-out-date"
        type="date"
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
      />
      {errors.checkOut && <p>{errors.checkOut}</p>}

      <button type="submit">Search availability</button>
    </form>
  );
}
