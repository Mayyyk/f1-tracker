import { API_URL } from "../config";

// Import races from external API (POST)
export const fetchImportedRaces = async (season) => {
  try {
    const res = await fetch(`${API_URL}/api/races/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season }),
    });
    if (!res.ok) throw new Error("Failed to fetch imported races");
    return await res.json();
  } catch (err) {
    console.error("fetchImportedRaces error:", err);
    return [];
  }
};

// Fetch saved races from DB
export const fetchSavedRaces = async () => {
  try {
    const res = await fetch(`${API_URL}/api/races`);
    if (!res.ok) throw new Error("Failed to fetch saved races");
    return await res.json();
  } catch (err) {
    console.error("fetchSavedRaces error:", err);
    return [];
  }
};

// Save new race to DB
export const saveRace = async (race) => {
  try {
    const res = await fetch(`${API_URL}/api/races/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(race),
    });
    return res;
  } catch (err) {
    console.error("saveRace error:", err);
    return { ok: false };
  }
};

// Edit existing race in DB
export const editRace = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/api/races/${id}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res;
  } catch (err) {
    console.error("editRace error:", err);
    return { ok: false };
  }
};

// Toggle favorite status
export const toggleFavoriteRace = async (id, remove) => {
  try {
    const res = await fetch(`${API_URL}/api/races/${id}/favorite`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remove }),
    });
    return res;
  } catch (err) {
    console.error("toggleFavoriteRace error:", err);
    return { ok: false };
  }
};

// Delete race by ID
export const deleteRace = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/races/${id}/delete`, {
      method: "DELETE",
    });
    return res;
  } catch (err) {
    console.error("deleteRace error:", err);
    return { ok: false };
  }
};
