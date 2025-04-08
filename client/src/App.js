import { useState, useEffect } from 'react';

const App = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState('2023');
  const [savedRaces, setSavedRaces] = useState([]);
  const [editData, setEditData] = useState({})

  const savedIds = new Set(savedRaces.map((r) => r.id)); // póki co to zapisuje się za każdym razem, ale dla małej ilości wyścigów wystarcza

  const fetchRaces = async (selectedSeason) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/import-races`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({season:selectedSeason})
      });
      const data = await res.json();
      setRaces(data);
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
      setRaces([]);
    } finally {
      setLoading(false);
    }
  };

  const saveRace = async (race) => {
    try {
      const res = await fetch("http://localhost:5000/api/save-races", {
        method: 'POST',
        headers: {"Content-Type" : "application/json"},
        body : JSON.stringify(race)
      })

      if (res.ok) {
        setSavedRaces(prev=>[...prev, race]) // od razu dodajemy do zapisanych, żeby przycisk był wyłączony bez czekania na kolejny fetch do bazy
        alert(`✅ Zapisano: ${race.name}`);
      } else if (res.status === 409) {
        alert(`⚠️ Wyścig już istnieje w bazie: ${race.name}`);
      } else {
        alert('❌ Błąd zapisu.');
      }
    } catch(err){
    console.error('❌ Błąd połączenia:', err);
    alert('❌ Nie udało się połączyć z backendem.');
    }
  }

  const deleteRace = async (id) => {
    if (!window.confirm('Na pewno chcesz usunąć ten wyścig?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/races/${id}/delete`, {method: "DELETE"})
      if (res.ok) {
        alert('✅ Wyścig usunięty');
        setSavedRaces(prev => prev.filter(r => r.id !== id));
      } else {
        alert('❌ Błąd usuwania');
      }
    } catch (err) {
      console.error('❌ Błąd połączenia przy usuwaniu:', err);
      alert('❌ Nie udało się usunąć wyścigu');
    }
  }

  const renderRaceForm = (race, isSaved) => {
    const data = editData[race.id] || { // check if it was edited already
      comment: race.comment || '',
      wasRain: race.wasRain || false
    };

    const updateField = (field, value) => {
      setEditData(prev => ({

      }))
    }

    const handleSave = async() => {
      const body = {
        ...race,
        ...editData[race.id]
      }
    }
  }

  // Fetchuj od razu po załadowaniu
  useEffect(() => {
    const fetchSavedRaces = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/races')
        const data = await res.json()
        setSavedRaces(data)
      } catch(err) {
        console.error('❌ Błąd przy pobieraniu zapisanych wyścigów:', err);

      }
    }
    fetchRaces(season);
    fetchSavedRaces()
  }, [season]); // porównanie z bazą dzieje się przy każdym wyborze sezonu, co na razie wystarcza

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>F1 Tracker 🏁</h1>

      <h2>📁 Zapisane wyścigi</h2>
<ul>
  {savedRaces.map((race) => (
    <li key={race.id} style={{ marginBottom: '1rem' }}>
      <strong>{race.name}</strong> – {race.circuit} ({race.date})<br />
      <button onClick={() => deleteRace(race.id)}>Usuń</button>
    </li>
  ))}
</ul>


      <label>
        Sezon:
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        >
          {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </label>

      {loading ? (
        <p>Ładowanie...</p>
      ) : races.length === 0 ? (
        <p>Brak wyścigów.</p>
      ) : (
        <ul>
            {races.map((race) => (
    <li key={race.id} style={{ marginBottom: '1rem' }}>
      <strong>{race.name}</strong> – {race.circuit} ({race.date})<br />
      <button onClick={() => saveRace(race)} disabled={savedIds.has(race.id)}>{savedIds.has(race.id) ? "Zapisano" : "Zapisz do bazy"}</button>
    </li>
  ))}
        </ul>
      )}
    </main>
  );
};

export default App;
