import { IEvent } from "@/types/interfaces";
import { supabase } from "./supabase";

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

export async function addEvent(event: IEvent) {
  const { data, error } = await supabase.from("events").insert([event]);
  if (error) {
    throw error;
  }
  return data;
}
