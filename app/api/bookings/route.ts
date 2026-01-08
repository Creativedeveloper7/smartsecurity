import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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

    // Handle service - find or create
    let finalServiceId = serviceId;
    const { serviceName, duration, servicePrice } = body;

    if (!finalServiceId && serviceName) {
      // Find existing service by name
      let existingService = await prisma.service.findFirst({
        where: { name: serviceName },
      });

      if (!existingService) {
        // Create new service
        existingService = await prisma.service.create({
          data: {
            name: serviceName,
            description: `Consultation service: ${serviceName}`,
            duration: duration || 60, // Default 60 minutes
            price: servicePrice || price || 0,
            active: true,
          },
        });
      }
      finalServiceId = existingService.id;
    }

    // For course bookings, find or create a "Course" service
    if (type === "course" && !finalServiceId) {
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

    if (!finalServiceId) {
      return NextResponse.json(
        { error: "Service ID or Service Name is required" },
        { status: 400 }
      );
    }

    // Build notes with course information if it's a course booking
    let finalNotes = notes || "";
    if (type === "course" && courseTitle) {
      finalNotes = `Course Booking: ${courseTitle}\nCourse ID: ${courseId}\nOrganization: ${organization || "N/A"}\n\n${finalNotes}`;
    } else if (organization) {
      // Add organization to notes if not a course booking
      finalNotes = organization ? `Organization: ${organization}\n\n${finalNotes}` : finalNotes;
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

