import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://muqukhfwgvfnftulpytf.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cXVraGZ3Z3ZmbmZ0dWxweXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzODkzNTMsImV4cCI6MjEwMDk2NTM1M30.rgRgd9WRPjTXojY5c90Jk7dPhSwLEu1zk0jAEvOEIq8";
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

export interface LineNotifySetting {
  enabled: boolean;
  updated_at?: string;
  updated_by?: string;
}

// In-memory cache for fast read access with TTL
let memoryCache: { setting: LineNotifySetting; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 1000; // 10 seconds

const SETTINGS_FILE_PATH = "settings/notify_status.json";
const STORAGE_BUCKET = "site-images";

export function isAdminCha(key?: string | null): boolean {
  if (!key) return false;
  const clean = key.trim();
  return clean === "Cha16072534" || clean === "Cha16072534--";
}

/**
 * Retrieve current LINE notification setting.
 * Defaults to true if no file exists.
 */
export async function getLineNotificationSetting(): Promise<LineNotifySetting> {
  const now = Date.now();
  if (memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    return memoryCache.setting;
  }

  try {
    const { data, error } = await getSupabase().storage
      .from(STORAGE_BUCKET)
      .download(SETTINGS_FILE_PATH);

    if (error || !data) {
      // Default enabled if setting not yet initialized
      const defaultSetting: LineNotifySetting = {
        enabled: true,
        updated_at: new Date().toISOString(),
        updated_by: "system"
      };
      memoryCache = { setting: defaultSetting, timestamp: now };
      return defaultSetting;
    }

    const text = await data.text();
    const parsed = JSON.parse(text) as LineNotifySetting;
    const finalSetting: LineNotifySetting = {
      enabled: parsed.enabled !== false,
      updated_at: parsed.updated_at,
      updated_by: parsed.updated_by
    };

    memoryCache = { setting: finalSetting, timestamp: now };
    return finalSetting;
  } catch (err) {
    console.error("Error reading LINE notification setting:", err);
    return memoryCache ? memoryCache.setting : { enabled: true };
  }
}

/**
 * Update LINE notification setting in Supabase Storage and cache.
 */
export async function setLineNotificationSetting(
  enabled: boolean,
  updatedBy: string = "Cha16072534"
): Promise<{ success: boolean; setting: LineNotifySetting; error?: string }> {
  try {
    const newSetting: LineNotifySetting = {
      enabled: Boolean(enabled),
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    };

    const buffer = Buffer.from(JSON.stringify(newSetting, null, 2), "utf-8");

    const { error } = await getSupabase().storage
      .from(STORAGE_BUCKET)
      .upload(SETTINGS_FILE_PATH, buffer, {
        upsert: true,
        contentType: "application/json"
      });

    if (error) {
      console.error("Error uploading LINE notification setting:", error);
      return { success: false, setting: newSetting, error: error.message };
    }

    // Update in-memory cache immediately
    memoryCache = { setting: newSetting, timestamp: Date.now() };

    return { success: true, setting: newSetting };
  } catch (err: any) {
    console.error("Failed to update LINE notification setting:", err);
    return { success: false, setting: { enabled }, error: err.message };
  }
}
