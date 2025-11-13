import { NextResponse } from "next/server";
import {
  authenticateAdminCredentials,
  createAuthToken,
  setAuthCookie,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await authenticateAdminCredentials(email, password);

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createAuthToken(admin);
    await setAuthCookie(token);

    return NextResponse.json({
      message: "Logged in successfully.",
      admin: {
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Unexpected error during login." },
      { status: 500 }
    );
  }
}

