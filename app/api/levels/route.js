import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getAllLevelConfigs,
  createLevelConfig,
} from "@/lib/levels";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const levels = await getAllLevelConfigs();
  return NextResponse.json({ levels });
}

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    if (payload == null || typeof payload !== "object") {
      return NextResponse.json(
        { message: "Invalid payload." },
        { status: 400 }
      );
    }

    const level = await createLevelConfig(payload);
    return NextResponse.json({ level }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message || "Unable to create level.",
      },
      { status: 400 }
    );
  }
}

