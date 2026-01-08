"use client";

import { useState } from "react";
import { BookingDetails } from "./booking-details";

export function ViewDetailsButton({ booking }: { booking: any }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDetails(true)}
        className="text-[#007CFF] hover:text-[#0066CC] transition-colors"
      >
        View Details
      </button>
      {showDetails && (
        <BookingDetails booking={booking} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
}

