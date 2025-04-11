export const fetchRacesFromAPI = async (season = "2023") => {
    const res = await fetch(`https://ergast.com/api/f1/${season}.json`);
    const data = await res.json();
    return data.MRData.RaceTable.Races.map(r => ({
      id: `${r.season}-${r.round}`,
      name: r.raceName,
      date: r.date,
      round: parseInt(r.round),
      circuit: r.Circuit.circuitName,
      wikiUrl: r.url
    }));
  };