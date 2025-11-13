import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getLevelConfig,
  updateLevelConfig,
  deleteLevelConfig,
} from "@/lib/levels";
import path from "path";
import { promises as fs } from "fs";

async function parseLevel(paramsPromise) {
  const params = await paramsPromise;
  const levelNumber = Number(params.level);
  if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
    return null;
  }
  return levelNumber;
}

export async function GET(_request, context) {
  const { params } = context;
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const levelNumber = await parseLevel(params);
  if (!levelNumber) {
    return NextResponse.json({ message: "Invalid level." }, { status: 400 });
  }

  const level = await getLevelConfig(levelNumber);
  if (!level) {
    return NextResponse.json({ message: "Level not found." }, { status: 404 });
  }

  return NextResponse.json({ level });
}

export async function PUT(request, context) {
  const { params } = context;
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const levelNumber = await parseLevel(params);
  if (!levelNumber) {
    return NextResponse.json({ message: "Invalid level." }, { status: 400 });
  }

  const payload = await request.json();
  const requiredFields = [
    "backgroundColor",
    "dot1Color",
    "dot2Color",
    "dot3Color",
    "dot4Color",
    "dot5Color",
  ];

  const missingField = requiredFields.find(
    (field) => typeof payload[field] !== "string"
  );

  if (missingField) {
    return NextResponse.json(
      { message: `Field ${missingField} is required.` },
      { status: 400 }
    );
  }

  // Get current level to check for old logo
  const currentLevel = await getLevelConfig(levelNumber);
  if (!currentLevel) {
    return NextResponse.json({ message: "Level not found." }, { status: 404 });
  }

  // Delete old logo file if logoUrl is being changed or cleared
  const oldLogoUrl = currentLevel.logoUrl;
  const newLogoUrl = payload.logoUrl ?? "";
  
  if (oldLogoUrl && oldLogoUrl !== newLogoUrl && oldLogoUrl.startsWith("/uploads/")) {
    try {
      const oldFilePath = path.join(process.cwd(), "public", oldLogoUrl);
      await fs.unlink(oldFilePath);
    } catch (error) {
      // Only log if it's not a "file not found" error (ENOENT)
      // File might have already been deleted or never existed
      if (error.code !== "ENOENT") {
        console.warn(`Failed to delete old logo file: ${oldLogoUrl}`, error);
      }
    }
  }

  const updated = await updateLevelConfig(levelNumber, payload);

  if (!updated) {
    return NextResponse.json({ message: "Level not found." }, { status: 404 });
  }

  return NextResponse.json({ level: updated });
}

export async function DELETE(_request, context) {
  const { params } = context;
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const levelNumber = await parseLevel(params);
  if (!levelNumber) {
    return NextResponse.json({ message: "Invalid level." }, { status: 400 });
  }

  // Get level before deleting to check for logo file
  const levelToDelete = await getLevelConfig(levelNumber);
  if (!levelToDelete) {
    return NextResponse.json(
      { message: "Level not found." },
      { status: 404 }
    );
  }

  // Delete logo file if it exists
  const logoUrl = levelToDelete.logoUrl;
  if (logoUrl && logoUrl.startsWith("/uploads/")) {
    try {
      const logoFilePath = path.join(process.cwd(), "public", logoUrl);
      await fs.unlink(logoFilePath);
    } catch (error) {
      // Only log if it's not a "file not found" error (ENOENT)
      // File might have already been deleted or never existed
      if (error.code !== "ENOENT") {
        console.warn(`Failed to delete logo file: ${logoUrl}`, error);
      }
    }
  }

  const deleted = await deleteLevelConfig(levelNumber);
  if (!deleted) {
    return NextResponse.json(
      { message: "Level not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ level: deleted });
}

