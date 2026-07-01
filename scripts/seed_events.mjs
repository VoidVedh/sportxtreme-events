import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envContent = fs.readFileSync(".env", "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function seed() {
  const email = "sportxtremeevents@gmail.com";
  const password = "GaneshKamatAdmin@123";

  console.log("Logging in as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error("Login failed:", authError.message);
    return;
  }
  console.log("Logged in successfully. User email:", authData.user.email);

  // Check if events are already seeded
  const { data: existingEvents, error: checkError } = await supabase.from("events").select("id").limit(1);
  if (checkError) {
    console.error("Error checking events:", checkError.message);
    return;
  }

  if (existingEvents && existingEvents.length > 0) {
    console.log("Events table already contains data. Skipping seed.");
    return;
  }

  console.log("Seeding events table with future events...");
  const events = [
    {
      title: "Mumbai Corporate Cricket League 2026",
      category: "Corporate",
      sport: "Cricket",
      description: "Annual corporate cricket tournament featuring 32 companies across Mumbai.",
      location: "Mumbai, Maharashtra",
      participants: "500+",
      event_date: "2026-10-15",
      status: "upcoming"
    },
    {
      title: "SportXtreme City Marathon 2026",
      category: "Marathon",
      sport: "Running",
      description: "City-wide marathon with 21K and 42K categories attracting elite runners.",
      location: "Mumbai, Maharashtra",
      participants: "2,500+",
      event_date: "2026-11-20",
      status: "upcoming"
    },
    {
      title: "Inter-School Sports Championship 2026",
      category: "School",
      sport: "Multi-Sport",
      description: "Multi-sport championship for schools across Mumbai with 8 different sports.",
      location: "Mumbai, Maharashtra",
      participants: "1,200+",
      event_date: "2026-09-10",
      status: "upcoming"
    },
    {
      title: "Football Super League Mumbai 2026",
      category: "League",
      sport: "Football",
      description: "Competitive football league with 16 teams competing for the championship title.",
      location: "Mumbai, Maharashtra",
      participants: "800+",
      event_date: "2026-12-01",
      status: "upcoming"
    },
    {
      title: "Western Mumbai Cyclothon 2026",
      category: "Cycling",
      sport: "Cycling",
      description: "Inaugural cycling event covering scenic routes across Western Mumbai.",
      location: "Mumbai, Maharashtra",
      participants: "3,000+",
      event_date: "2027-01-15",
      status: "upcoming"
    },
    {
      title: "Corporate Swim Challenge 2026",
      category: "Aquatic",
      sport: "Swimming",
      description: "Corporate swimming competition with relay and individual events.",
      location: "Mumbai, Maharashtra",
      participants: "400+",
      event_date: "2026-08-20",
      status: "upcoming"
    }
  ];

  const { data: insertedData, error: insertError } = await supabase
    .from("events")
    .insert(events)
    .select();

  if (insertError) {
    console.error("Failed to seed events:", insertError.message);
  } else {
    console.log(`Seeding successful! Seeded ${insertedData.length} events.`);
  }
}

seed();
