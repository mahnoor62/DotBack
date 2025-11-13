import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import path from "path";
import { promises as fs } from "fs";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { message: "File is required." },
      { status: 400 }
    );
  }

  const maxFileSizeBytes = 1 * 1024 * 1024; // 1MB

  if (file.size > maxFileSizeBytes) {
    return NextResponse.json(
      { message: "File size must not exceed 1MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate image dimensions
  try {
    const metadata = await sharp(buffer).metadata();
    const maxWidth = 1080;
    const maxHeight = 400;

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return NextResponse.json(
        { message: `Image dimensions must not exceed ${maxWidth}x${maxHeight} pixels. Current size: ${metadata.width}x${metadata.height}` },
        { status: 400 }
      );
    }
  } catch (error) {
    // If sharp can't process it, it might not be a valid image
    return NextResponse.json(
      { message: "Invalid image file. Please upload a valid image." },
      { status: 400 }
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sanitizedName = file.name.replace(/[^a-z0-9.\-_]/gi, "_").toLowerCase();
  const fileName = `${uniqueSuffix}-${sanitizedName}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, buffer);

  const publicPath = `/uploads/${fileName}`;
  return NextResponse.json({ url: publicPath });
}

