import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
import { connectToDatabase } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

const TOKEN_COOKIE = "dotback_admin_token";
const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret() {
  return process.env.JWT_SECRET || "dotback_secret_key";
}

export async function authenticateAdminCredentials(email, password) {
  await ensureSeedData();
  await connectToDatabase();

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return null;
  }

  return admin;
}

export function createAuthToken(admin) {
  return jwt.sign(
    {
      sub: admin._id.toString(),
      email: admin.email,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRATION_SECONDS }
  );
}

export async function getCurrentAdmin() {
  await ensureSeedData();
  await connectToDatabase();

  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const admin = await Admin.findById(payload.sub).lean();
    if (!admin) {
      return null;
    }
    return {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    };
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_EXPIRATION_SECONDS,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

