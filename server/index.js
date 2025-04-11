import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const app = express();

const PORT = 5000;

app.use(cors())
app.use(express.json())

app.post("/api/save-race", async (req, res) => { //saving new race
    console.log("▶️ Received query POST /api/save-races");
    console.log("Data:", req.body);
  
    try {
      const race = await prisma.race.create({
        data: {
          id: req.body.id,
          name: req.body.name,
          date: new Date(req.body.date),
          round: req.body.round,
          circuit: req.body.circuit,
          wasRain: req.body.wasRain,
          comment: req.body.comment,
          temperature: req.body.temperature ?? null
        }
      });
  
      console.log("Saved to Database:", race.id);
      res.status(201).json(race);
    } catch (err) {
      console.error("Error while saving to database:", err);
      res.status(500).json({ error: "Error while saving to database." });
    }
  });
  

app.get('/api/races', async (req, res) => { //getting alle races from the db
    try {
        const races = await prisma.race.findMany({
            orderBy: {
                date: 'asc'
            }
        })
        res.json(races)
    } catch(err) {
        console.error('Error while fetching data from database:', err);
        res.status(500).json({ error: 'Failed to load races.' });
    }
})


app.post("/api/import-races", async (req, res) => {
    const season = req.body.season || '2023' // post allows for more flexibility on the params given to the API
    try {
        const response = await fetch('https://ergast.com/api/f1/2023.json')
        const data = await response.json()
    
        const races = data.MRData.RaceTable.Races.map(r => ({
            id: `${r.season}-${r.round}`,
            name: r.raceName,
            date: r.date,
            round: parseInt(r.round),
            circuit: r.Circuit.circuitName,
            wasRain: r.wasRain,
            comment: r.comment,
            temperature: null   //  OpenWeather?
          }));
          res.json(races)
    } catch(err) {
        console.log("Error loading data from API: ", err)
        res.status(500).json({error:"Failed to import races from api"})
    }
})

app.delete('/api/races/:id/delete', async (req, res) => { // deleting a race by id
    const {id} = req.params
    console.log(req.params)
    try {
        await prisma.race.delete({
            where: {id}
        })
        console.log('race deleted')
        res.status(200).json({message:`Race deleted: ${id}`})
    } catch(err){
        console.log("Error while deleting this race: ", err)
        res.status(500).json({message:`Failed to delete race #${id}.`})
    }
})

app.put('/api/races/:id/edit', async (req, res) => { //editing a race by it
    const {id} = req.params
    const {wasRain, comment} = req.body

    try{
        const updated = await prisma.race.update({
            where: {id},
            data: {
                wasRain: Boolean(wasRain),
                comment: comment || null
            }
        })
        res.json(updated)
    } catch(err) {
        console.log("Error while editing: ", err)
        res.status(500).json({error: `Failed to edit race #${id}.`})
      }
})

app.put('/api/races/:id/favorite', async (req, res) => {
    const { id } = req.params;
    try {
        // set isFavorite for all as false so only one can be favorite at once
        await prisma.race.updateMany({
        data: { isFavorite: false }
      });
  
     // set the one as favorite
      const updated = await prisma.race.update({
        where: { id },
        data: { isFavorite: true }
      });
  
      res.json(updated);
    } catch (err) {
      console.error('Error setting favorite race:', err);
      res.status(500).json({ error: 'Failed to set a favorite race.' });
    }
  });
  

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
  