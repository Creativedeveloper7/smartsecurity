// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      organization,
      courseId,
      serviceId,
      serviceName,
      price,
      preferredDate,
      preferredTime,
      startTime,
      endTime,
      additionalNotes,
      duration, // in minutes
    } = await request.json();

    // Basic validation
    if (!clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: "Missing required fields: clientName, clientEmail, and clientPhone are required" },
        { status: 400 }
      );
    }

    let serviceIdToUse: string | undefined;
    let bookingPrice: number = 0;
    let bookingDuration: number = 60; // Default 1 hour in minutes

    // If no courseId or serviceId provided, create or find a default "General Consultation" service
    if (!courseId && !serviceId) {
      let generalService = await prisma.service.findFirst({
        where: {
          name: "General Consultation",
        },
      });

      if (!generalService) {
        // Create a default general consultation service
        generalService = await prisma.service.create({
          data: {
            name: "General Consultation",
            description: "General security consultation and advisory services",
            duration: 60, // 1 hour
            price: 0, // Free consultation by default
            active: true,
          },
        });
      }

      serviceIdToUse = generalService.id;
      bookingPrice = Number(generalService.price);
      bookingDuration = generalService.duration;
    }
    // Handle course bookings - find or create a service for the course
    else if (courseId) {
      // Fetch course details
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      // Find or create a service for course bookings
      // Use a generic "Course Training" service or create one specific to the course
      let courseService = await prisma.service.findFirst({
        where: {
          name: `Course: ${course.title}`,
        },
      });

      if (!courseService) {
        // Create a service for this course
        // Parse price from course (could be "KES 5,000" or "On request")
        const priceMatch = course.price.match(/[\d,]+/);
        const parsedPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
        
        // Parse duration from course (could be "8 hours" or "2 days")
        const durationMatch = course.duration.match(/(\d+)/);
        const parsedDuration = durationMatch ? parseInt(durationMatch[1]) * 60 : 480; // Default 8 hours in minutes

        courseService = await prisma.service.create({
          data: {
            name: `Course: ${course.title}`,
            description: course.description || `Training course: ${course.title}`,
            duration: parsedDuration,
            price: parsedPrice,
            active: true,
          },
        });
      }

      serviceIdToUse = courseService.id;
      bookingPrice = Number(courseService.price);
      bookingDuration = courseService.duration;
    } 
    // Direct service booking
    else if (serviceId) {
      serviceIdToUse = serviceId;
      
      // Fetch service to get price and duration
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      bookingPrice = Number(service.price);
      bookingDuration = service.duration;
    }

    // Validate that serviceIdToUse is assigned (should never happen, but TypeScript needs this)
    if (!serviceIdToUse) {
      return NextResponse.json(
        { error: "Unable to determine service for booking. Please provide either a courseId or serviceId." },
        { status: 400 }
      );
    }

    // Calculate start and end times
    let bookingStartTime: Date;
    let bookingEndTime: Date;

    if (startTime && endTime) {
      // Use provided ISO strings
      bookingStartTime = new Date(startTime);
      bookingEndTime = new Date(endTime);
    } else if (preferredDate && preferredTime) {
      // Calculate from preferred date/time
      bookingStartTime = new Date(`${preferredDate}T${preferredTime}`);
      bookingEndTime = new Date(bookingStartTime.getTime() + (duration || bookingDuration) * 60 * 1000);
    } else {
      return NextResponse.json(
        { error: "Either startTime/endTime or preferredDate/preferredTime must be provided" },
        { status: 400 }
      );
    }

    // Generate unique booking number
    const bookingNumber = generateBookingNumber();

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        clientName,
        clientEmail,
        clientPhone,
        serviceId: serviceIdToUse,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        status: "PENDING",
        price: price ? Number(price) : bookingPrice,
        notes: additionalNotes || null,
        paid: false, // No payment integration yet
      },
    });

    // Check if payment is required (price > 0)
    const requiresPayment = Number(booking.price) > 0;

    return NextResponse.json({ 
      success: true,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      requiresPayment,
      message: requiresPayment 
        ? "Booking created successfully. Please proceed to payment."
        : "Booking created successfully"
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