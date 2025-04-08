import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const addDummyRace = async () => {
    await prisma.race.create({
        data: {
            id: "2023-14",
            name: "Italian Grand Prix",
            date: new Date("2023-09-03"),
            round: 14,
            circuit: "Monza",
            isNightRace: false,
            temperature: 28.5
        }
    })
}

const app = express();

const PORT = 5000;

app.use(cors())
app.use(express.json())

let dummyRaces = [
    {
      id: "2023-italy",
      name: "Italian Grand Prix",
      date: "2023-09-03",
      round: 14,
      circuit: "Monza",
      isNightRace: false,
      temperature: 27
    }
  ];


app.post("/api/import-races", async (req, res) => {
    const season = req.body.season || '2023' // post pozwala na większe dostosowanie tego, co wysyłamy w zapytaniu do api
    try {
        const response = await fetch('https://ergast.com/api/f1/2023.json')
        const data = await response.json()
    
        const races = data.MRData.RaceTable.Races.map(r => ({
            id: `${r.season}-${r.round}`,
            name: r.raceName,
            date: r.date,
            round: parseInt(r.round),
            circuit: r.Circuit.circuitName,
            isNightRace: false, // tymczasowo na sztywno
            temperature: null   // w przyszłości z OpenWeather
          }));
          res.json(races)
    } catch(err) {
        console.log("Błąd pobierania API. ", err)
        res.status(500).json({error:"Błąd importowania wyścigów"})
    }
})
app.post("/api/save-races", async (req, res) => {
    console.log("▶️ Otrzymano żądanie POST /api/save-races");
    console.log("Dane:", req.body);
  
    try {
      const race = await prisma.race.create({
        data: {
          id: req.body.id,
          name: req.body.name,
          date: new Date(req.body.date),
          round: req.body.round,
          circuit: req.body.circuit,
          isNightRace: req.body.isNightRace,
          temperature: req.body.temperature ?? null
        }
      });
  
      console.log("✅ Zapisano do bazy:", race.id);
      res.status(201).json(race);
    } catch (err) {
      console.error("❌ Błąd zapisu:", err);
      res.status(500).json({ error: "Błąd podczas zapisu do bazy" });
    }
  });
  

app.get('/api/races', async (req, res) => {
    try {
        const races = await prisma.race.findMany({
            orderBy: {
                date: 'asc'
            }
        })
        res.json(races)
    } catch(err) {
        console.error('❌ Błąd pobierania danych z bazy:', err);
        res.status(500).json({ error: 'Nie udało się pobrać wyścigów' });
    }
})

app.delete('/api/races/:id/delete', async (req, res) => {
    const {id} = req.params
    console.log(req.params)
    try {
        await prisma.race.delete({
            where: {id}
        })
        console.log('usunięto wyścig')
        res.status(200).json({message:`Usunięto wyścig: ${id}`})
    } catch(err){
        console.log("Błąd usuwania: ", err)
        res.status(500).json({message:`Nie udało się usunąć wyścigu: ${id}.`})
    }
})

app.put('api/races/:id/put', async (req, res) => {
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
        console.log("Błąd edycji", err)
        res.status(500).json({error: `Nie udało się edytować wyścigu: ${id}.`})
    }
})

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
  