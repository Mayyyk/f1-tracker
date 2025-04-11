import express from "express";
import {
  importRacesFromApi,
  getSavedRaces,
  saveRace,
  editRace,
  toggleFavorite,
  deleteRace,
} from "../controllers/raceController.js";

const router = express.Router(); // small routing app

router.post("/import", importRacesFromApi);
router.get("/", getSavedRaces);
router.post("/save", saveRace);
router.put("/:id/edit", editRace);
router.put("/:id/favorite", toggleFavorite);
router.delete("/:id/delete", deleteRace);

export default router;
