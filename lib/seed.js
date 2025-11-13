import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
import { connectToDatabase } from "@/lib/db";

let hasSeeded = global._dotbackSeeded || false;

const DEFAULT_ADMIN = {
  email: "admin@dotback.com",
  password: "dotback123",
  name: "DotBack Admin",
};

export async function ensureSeedData() {
  if (hasSeeded) {
    return;
  }

  await connectToDatabase();

  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
    await Admin.create({
      email: DEFAULT_ADMIN.email,
      passwordHash,
      name: DEFAULT_ADMIN.name,
    });
  }

  global._dotbackSeeded = true;
  hasSeeded = true;
}

export function getDefaultAdminCredentials() {
  return {
    email: DEFAULT_ADMIN.email,
    password: DEFAULT_ADMIN.password,
  };
}

