import prisma from "../prisma/client.js";
import { fetchRacesFromAPI } from "../utils/fetchExternalData.js";

export const importRacesFromApi = async (req, res) => {
  const season = req.body.season || "2023"; // post allows for more flexibility on the params given to the API
  console.log(season);
  try {
    const races = await fetchRacesFromAPI(season);
    console.log(races);
    res.json(races);
  } catch (err) {
    console.log("Error loading data from API: ", err);
    res.status(500).json({ error: "Failed to import races from api" });
  }
};

export const getAllRaces = async (req, res) => {
  try {
    const races = await prisma.race.findMany({
      orderBy: {
        date: "asc",
      },
    });
    res.json(races);
  } catch (err) {
    console.error("Error while fetching data from database:", err);
    res.status(500).json({ error: "Failed to load races." });
  }
};

export const saveRace = async (req, res) => {
  const { id, name, date, round, circuit, wasRain, comment, temperature } =
    req.body;

  if (!id || !name || !date || !round || !circuit) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const race = await prisma.race.create({
      data: {
        id,
        name,
        date: new Date(date),
        round,
        circuit,
        wasRain,
        comment,
        temperature: temperature ?? null,
      },
    });

    console.log("Saved to Database:", race.id);
    res.status(201).json(race);
  } catch (err) {
    console.error("Error while saving to database:", err);
    res.status(500).json({ error: "Error while saving to database." });
  }
};

export const editRace = async (req, res) => {
  const { wasRain, comment } = req.body;
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Missing race ID" });

  try {
    const updated = await prisma.race.update({
      where: { id },
      data: {
        wasRain: Boolean(wasRain),
        comment: comment || null,
      },
    });
    res.json(updated);
  } catch (err) {
    console.log("Error while editing:", err);
    res.status(500).json({ error: `Failed to edit race #${id}.` });
  }
};

export const toggleFavorite = async (req, res) => {
  const { id } = req.params;
  const { remove } = req.body;

  try {
    if (remove) {
      const updated = await prisma.race.update({
        where: { id },
        data: { isFavorite: false },
      });
      return res.json(updated);
    }

    await prisma.race.updateMany({ data: { isFavorite: false } });

    const updated = await prisma.race.update({
      where: { id },
      data: { isFavorite: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error toggling favorite race:", err);
    res.status(500).json({ error: "Failed to set/change a favorite race." });
  }
};

export const deleteRace = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.race.delete({
      where: { id },
    });
    res.status(200).json({ message: `Race deleted: ${id}` });
  } catch (err) {
    console.log("Error while deleting this race:", err);
    res.status(500).json({ message: `Failed to delete race #${id}.` });
  }
};
