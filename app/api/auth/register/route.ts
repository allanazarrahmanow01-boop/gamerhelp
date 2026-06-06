import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const MAX_ACCOUNTS_PER_DEVICE = 1;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate inputs
    if (!username || !password)
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    if (username.length < 3 || username.length > 20)
      return NextResponse.json({ error: "Username must be 3–20 characters" }, { status: 400 });
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return NextResponse.json({ error: "Letters, numbers and underscores only" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const admin = supabaseAdmin();

    // Cookie-based device check
    const cookieStore = cookies();
    const deviceToken = cookieStore.get("gh_device")?.value;

    if (deviceToken) {
      const { count } = await admin
        .from("device_registrations")
        .select("*", { count: "exact", head: true })
        .eq("device_token", deviceToken);

      if ((count || 0) >= MAX_ACCOUNTS_PER_DEVICE) {
        return NextResponse.json(
          { error: "Only 1 account allowed per device. Contact support if you need help." },
          { status: 429 }
        );
      }
    }

    // Check username taken
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .ilike("username", username.trim())
      .maybeSingle();

    if (existing)
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create Supabase auth user (use fake email internally)
    const fakeEmail = `${username.toLowerCase().trim()}_${Date.now()}@gamerhelp.internal`;
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: fakeEmail,
      password,
      email_confirm: true,
      user_metadata: { username: username.toLowerCase().trim() },
    });

    if (authError || !authUser.user)
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });

    // Create profile
    const { error: profileError } = await admin.from("profiles").insert({
      id: authUser.user.id,
      username: username.toLowerCase().trim(),
      password_hash,
      provider: "credentials",
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Assign or reuse device token
    const newDeviceToken = deviceToken || uuidv4();
    await admin.from("device_registrations").insert({
      device_token: newDeviceToken,
      user_id: authUser.user.id,
    });

    // Set persistent cookie
    const response = NextResponse.json({ success: true });
    if (!deviceToken) {
      response.cookies.set("gh_device", newDeviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365 * 5, // 5 years
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
