import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import path from "path";
import { promises as fs } from "fs";

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

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { message: "File size must be under 2MB." },
      { status: 400 }
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sanitizedName = file.name.replace(/[^a-z0-9.\-_]/gi, "_").toLowerCase();
  const fileName = `${uniqueSuffix}-${sanitizedName}`;
  const filePath = path.join(uploadsDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const publicPath = `/uploads/${fileName}`;
  return NextResponse.json({ url: publicPath });
}

