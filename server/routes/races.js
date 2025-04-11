import express from "express";
import {
  getAllRaces,
  saveRace,
  editRace,
  deleteRace,
  toggleFavorite,
  importRacesFromApi,
} from "../controllers/raceController.js";

const router = express.Router() // small routing app

router.get("/", getAllRaces);
router.post("/import", importRacesFromApi);
router.post("/save", saveRace);
router.put("/:id/edit", editRace);
router.put("/:id/favorite", toggleFavorite);
router.delete("/:id/delete", deleteRace);

export default router;
