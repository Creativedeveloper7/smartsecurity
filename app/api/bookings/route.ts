import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      startTime,
      endTime,
      notes,
      price,
      type,
      courseId,
      courseTitle,
      organization,
    } = body;

    // Generate unique booking number
    const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // For course bookings, find or create a "Course" service
    let finalServiceId = serviceId;
    if (type === "course") {
      // Find or create a generic "Course" service
      let courseService = await prisma.service.findFirst({
        where: { name: "Course" },
      });

      if (!courseService) {
        courseService = await prisma.service.create({
          data: {
            name: "Course",
            description: "Professional security course",
            duration: 480, // 8 hours default
            price: 0, // Price varies by course
            active: true,
          },
        });
      }
      finalServiceId = courseService.id;
    }

    // Build notes with course information if it's a course booking
    let finalNotes = notes || "";
    if (type === "course" && courseTitle) {
      finalNotes = `Course Booking: ${courseTitle}\nCourse ID: ${courseId}\nOrganization: ${organization || "N/A"}\n\n${finalNotes}`;
    }

    // Calculate dates from preferred date/time
    const preferredDate = startTime ? new Date(startTime) : new Date();
    const endDate = endTime ? new Date(endTime) : new Date(preferredDate.getTime() + 8 * 60 * 60 * 1000); // Default 8 hours

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        userId: userId || null,
        clientName,
        clientEmail,
        clientPhone,
        serviceId: finalServiceId,
        startTime: preferredDate,
        endTime: endDate,
        notes: finalNotes,
        price: price ? parseFloat(price) : 0,
        status: "PENDING",
        paid: false,
      },
      include: {
        service: true,
      },
    });

    // TODO: Send confirmation email

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

