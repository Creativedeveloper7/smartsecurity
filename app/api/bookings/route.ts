// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      organization,
      courseId,
      serviceName,
      price,
      preferredDate,
      preferredTime,
      additionalNotes,
    } = await request.json();

    // Basic validation
    if (!courseId || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create booking
    const bookingData: any = {
      clientName,
      clientEmail,
      clientPhone,
      organization: organization || null,
      serviceName,
      price,
      status: "PENDING",
      startTime: new Date(`${preferredDate}T${preferredTime}`),
      endTime: new Date(new Date(`${preferredDate}T${preferredTime}`).getTime() + 60 * 60 * 1000), // 1 hour default duration
      notes: additionalNotes || null,
    };

    // Only connect course if courseId is provided
    if (courseId) {
      bookingData.course = {
        connect: { id: courseId }
      };
    }

    const booking = await prisma.booking.create({
      data: bookingData
    });

    return NextResponse.json({ 
      success: true,
      bookingId: booking.id,
      message: "Booking created successfully"
    });

  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { 
        error: "Failed to create booking",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}