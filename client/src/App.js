import { useState, useEffect } from "react";

const App = () => {
  const [importedRaces, setImportedRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState("2023");
  const [savedRaces, setSavedRaces] = useState([]);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("import");

  const savedIds = new Set(savedRaces.map((r) => r.id)); // make a set of ID's of races saved in DB

  const fetchRaces = async (selectedSeason) => { // fetching races from Ergast API
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/import-races`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ season: selectedSeason }),
      });
      const data = await res.json();
      setImportedRaces(data);
    } catch (err) {
      console.error("Error while fetching data from API:", err);
      setImportedRaces([]);
    } finally {
      setLoading(false);
    }
  };

   const deleteRace = async (id) => { // delete race from DB by ID
    if (!window.confirm("Are you sure to delete this race?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/races/${id}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Race deleted.");
        setSavedRaces((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("❌ Error while deleting this race. Race was not deleted.");
      }
    } catch (err) {
      console.error("❌ Connection error while deleting this race.", err);
      alert("❌ Error while deleting this race. Race was not deleted.");
    }
  };
  
  const toggleFavorite = async (id, isCurrentlyFavorite) => {
    try {
      if(isCurrentlyFavorite) {
        
      }
      const res = await fetch(`http://localhost:5000/api/races/${id}/favorite`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updated = await res.json();
        setSavedRaces(prev => // update local state so there is no need to wait for fetch from DB
          prev.map(r => ({ ...r, isFavorite: r.id === id }))
        );
      }
    } catch (err) {
      console.error("❌ Error while setting favorite race:", err);
    }
  };

  const renderRaceForm = (race, isSaved) => { // the form for each race is rendered individually
    const data = editData[race.id] || {
      // check if it contains data edited by the user in the current moment, in case it was already edited before saving
      comment: race.comment || "", // if nothing is edited, data is fetched from the original race (from import), or from the DB (if it is saved in DB)
      wasRain: race.wasRain || false,
    };

    const updateField = (field, value) => {
      // changing the value of wasRain or comment for a given race
      setEditData((prev) => ({
        ...prev,
        [race.id]: {
          //using Id as a key
          ...prev[race.id],
          [field]: value,
        },
      }));
    };

    const handleSave = async () => { // different save rules if the race already exists in DB or not
      const body = {
        ...race, // copying data from the given race
        ...editData[race.id], // overwriting the copied data with new changes
      };
      if (isSaved) {
        const res = await fetch(
          `http://localhost:5000/api/races/${race.id}/edit`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wasRain: body.wasRain,
              comment: body.comment,
            }),
          }
        );

        if (res.ok) {
          alert("✅ Edit was successful.");
          setSavedRaces( // also edit the local state so there is no need to wait for another fetch from DB
            (prev) =>
              prev.map((r) => (r.id === race.id ? { ...r, ...body } : r)) // adding a new race at the end
          );
        }
      } else { // saving a new race
        const res = await fetch("http://localhost:5000/api/save-race", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          alert("✅ Zapisano do bazy");
          setSavedRaces((prev) => [...prev, body]);
        }
      }
    };

    

    return ( // returns a form for each race
      <div>
        <strong>{race.name}</strong> – {race.circuit} ({race.date})
        <div>
          <label>
            Was it rainy?
            <select
              value={data.wasRain ? "yes" : "no"}
              onChange={(e) => updateField("wasRain", e.target.value === "yes")}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <br />
          <label>
            Comment:
            <input
              type="text"
              value={data.comment}
              onChange={(e) => updateField("comment", e.target.value)}
            />
          </label>
          {isSaved && (
            <button onClick={() => toggleFavorite(race.id)}>
                  {race.isFavorite ? '⭐ Favorite' : '☆ Set as favorite'}
            </button>
          )}
          <br />
          <button onClick={handleSave}>
            {isSaved ? "Save changes" : "Save to DataBase"}
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // after refresh always go back to the first page to avoid undefined behavior
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch immediately after page load
  useEffect(() => {
    const fetchSavedRaces = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/races");
        const data = await res.json();
        setSavedRaces(data);
      } catch (err) {
        console.error("❌ Error while fetching saved races: ", err);
      }
    };
    fetchRaces(season);
    fetchSavedRaces();
  }, [season]); // it reacts to changes in the season selection

  const filteredSavedRaces = savedRaces.filter((race) => // filters saved races by name
    race.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApiRaces = importedRaces // filters imported races by name, used in 
    .filter((race) => !savedIds.has(race.id))
    .filter((race) =>
      race.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginateRaces = (data, page = currentPage, limit = itemsPerPage) =>
      data.slice((page - 1) * limit, page * limit);
    

  const paginatedApiRaces = paginateRaces(filteredApiRaces)
  
  const paginatedSavedRaces = paginateRaces(filteredSavedRaces)

  const totalPages = Math.ceil(
    // counts total pages of pagination based on which tab is active (imported or saved races)
    (activeTab === "saved"
      ? filteredSavedRaces.length
      : filteredApiRaces.length) / Math.max(itemsPerPage, 1) // first argument must be in brackets
  );

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>F1 Tracker 🏁</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("saved")}
          style={{
            marginRight: "0.5rem",
            backgroundColor: activeTab === "saved" ? "#ccc" : "#eee",
          }}
        >
          Saved Races
        </button>
        <button
          onClick={() => {
            setActiveTab("import");
          }}
          style={{
            backgroundColor: activeTab === "import" ? "#ccc" : "#eee",
          }}
        >
          Import Races from API
        </button>
      </div>

      <input // for to find races by name
        type="text"
        placeholder="Find a race by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ margin: "1rem 0", padding: "0.5rem", width: "100%" }}
      />

      {activeTab === "saved" && ( // react shortcut for conditional render
        <> 
          <h2> Saved Races</h2> 
          <ul>
            {paginatedSavedRaces.map((race) => (
              <li key={race.id} style={{ marginBottom: "1rem" }}>
                {renderRaceForm(race, true)}
                <button onClick={() => deleteRace(race.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {activeTab === "import" && (
        <>
          <label>
            Season:
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            >
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(
                (yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                )
              )}
            </select>
          </label>

          {loading ? ( // handles showing imported races from API
            <p>Loading...</p>
          ) : importedRaces.length === 0 ? (
            <p>No races to show.</p>
          ) : (
            <ul>
              {paginatedApiRaces.map((race) => (
                <li key={race.id} style={{ marginBottom: "1rem" }}>
                  {renderRaceForm(race, false)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Pagination form */}
      <label> 
        Races per page:
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(e.target.value);
            setCurrentPage(1);
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          {[5, 10, 20, 50].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: "1rem" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ◀️ Previous
        </button>
        <span style={{ margin: "0 1rem" }}>
          Strona {currentPage} z {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next ▶️
        </button>
      </div>
    </main>
  );
};

export default App;
