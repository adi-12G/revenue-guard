import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🚀 API START");

    const cachedData = await redis.get("findings");

    if (cachedData) {
      console.log("✅ CACHE HIT");
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log("❌ CACHE MISS");

    const result = await supabase
      .from("findings")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Supabase result:", result);

    const { data, error } = result;

    if (error) {
      console.log("Supabase error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("Saving to Redis...");

    await redis.set("findings", JSON.stringify(data), {
      EX: 60,
    });

    console.log("Saved!");

    const test = await redis.get("findings");
    console.log("Redis contains:", test);

    return NextResponse.json(data);
  } catch (err) {
    console.error("🔥 CAUGHT ERROR:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}