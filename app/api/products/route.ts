import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const id = searchParams.get("id");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  console.log("📥 [GET /api/products]", {
    url: requestUrl.pathname + requestUrl.search,
    id,
    category,
    search,
    timestamp: new Date().toISOString(),
  });

  try {
    // If ID is provided, return single product
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ product });
    }

    const where: any = {};

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("✅ [GET /api/products] Success", {
      productsCount: products.length,
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("❌ [GET /api/products] Error:", {
      message: error.message,
      code: error.code,
      name: error.name,
      url: requestUrl.pathname + requestUrl.search,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });
    
    // Return empty array instead of 500 error to prevent frontend breakage
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: Request) {
  console.log("📥 [POST /api/products] Request received", {
    timestamp: new Date().toISOString(),
  });

  try {
    const body = await request.json();
    const { name, slug, description, price, images, category, stock, isDigital } = body;

    console.log("📥 [POST /api/products] Request data:", {
      name,
      slug,
      price,
      imagesCount: images?.length || 0,
      category,
      stock,
      isDigital,
    });

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    if (!price || parseFloat(price) <= 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || "",
        price: parseFloat(price),
        images: images || [],
        category: category || "Publications",
        stock: parseInt(stock) || 0,
        isDigital: isDigital || false,
      },
    });

    console.log("✅ [POST /api/products] Product created successfully", {
      productId: product.id,
      slug: product.slug,
      name: product.name,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/products] Error creating product:", {
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });
    
    // Handle unique constraint violation (duplicate slug)
    if (error.code === "P2002") {
      console.warn("⚠️ [POST /api/products] Duplicate slug detected");
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

