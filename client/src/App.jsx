import React from "react";
import { useState, useEffect } from "react";
import { API_URL } from "./config";
import {
  fetchImportedRaces,
  fetchSavedRaces,
  saveRace,
  editRace,
  toggleFavoriteRace,
  deleteRace,
} from "./api/raceApi.js";
import SavedRaces from "./pages/SavedRaces.jsx";
import ImportRaces from "./pages/ImportedRaces.jsx";
import { paginateRaces } from "./utils/pagination.js";
import { sortRaces } from "./utils/sort.js";

const App = () => {
  // ------ STATE SETUP SECTION -------

  const [importedRaces, setImportedRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState("2023");
  const [savedRaces, setSavedRaces] = useState([]);
  const [editData, setEditData] = useState({}); // storing temporary local data
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("import");
  const [sortBy, setSortBy] = useState("date"); // by default sort by date - set in backend

  const savedIds = new Set(savedRaces.map((r) => r.id)); // make a set of ID's of races saved in DB

  const seasons = [
    2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
    2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005,
    2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995,
    1994, 1993, 1992, 1991, 1990, 1989, 1988, 1987, 1986, 1985,
    1984, 1983, 1982, 1981, 1980, 1979, 1978, 1977, 1976, 1975,
    1974, 1973, 1972, 1971, 1970, 1969, 1968, 1967, 1966, 1965,
    1964, 1963, 1962, 1961, 1960, 1959, 1958, 1957, 1956, 1955,
    1954, 1953, 1952, 1951, 1950
  ];
 

  // ------ PAGE LOAD SECTION -------

  useEffect(() => {
    // after refresh always go back to the first page to avoid undefined behavior
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch immediately after page load
  useEffect(() => {
    const loadRaces = async () => {
      setLoading(true);
      try {
        const [imported, saved] = await Promise.all([
          fetchImportedRaces(season),
          fetchSavedRaces(),
        ]);
        setImportedRaces(imported);
        setSavedRaces(saved);
      } catch (err) {
        console.error("Error fetching races: ", err);
      } finally {
        setLoading(false);
      }
    };
    loadRaces();
  }, [season]); // it reacts to changes in the season selection

  // ------ DISPLAY SECTION --------
  // Filter -> sort -> paginate

  const filteredSavedRaces = savedRaces.filter(
    (
      race // filters saved races by name
    ) => race.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApiRaces = importedRaces
    .filter((race) => !savedIds.has(race.id))
    .filter((race) =>
      race.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sortedSavedRaces = [...filteredSavedRaces].sort((a, b) =>
    sortRaces(a, b, sortBy)
  );

  const sortedApiRaces = [...filteredApiRaces].sort((a, b) =>
    sortRaces(a, b, sortBy)
  );

  const paginatedSavedRaces = paginateRaces(
    sortedSavedRaces,
    currentPage,
    itemsPerPage
  );

  const paginatedApiRaces = paginateRaces(
    sortedApiRaces,
    currentPage,
    itemsPerPage
  );

  const totalPages = Math.ceil(
    // counts total pages of pagination based on which tab is active (imported or saved races)
    (activeTab === "saved"
      ? filteredSavedRaces.length
      : filteredApiRaces.length) / Math.max(itemsPerPage, 1) // first argument must be in brackets
  );

  // ------ FUNCTIONAL SECTION --------

  const updateField = (id, field, value) => {
    // changing the value of wasRain or comment for a given race
    setEditData((prev) => ({
      ...prev,
      [id]: {
        //using Id as a key
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (race, isSaved) => {
    if (!race.id || !race.name || !race.date || !race.round || !race.circuit) {
      alert("Missing data. Cannot save race.");
      return;
    }
    try {
      const body = {
        id: race.id,
        name: race.name,
        date: race.date,
        round: race.round,
        circuit: race.circuit,
        wasRain: editData[race.id]?.wasRain || false,
        comment: editData[race.id]?.comment || "",
        temperature: race.temperature ?? null,
      };

      if (isSaved) {
        const res = await editRace(race.id, {
          wasRain: body.wasRain,
          comment: body.comment,
        });

        if (res.ok) {
          alert("Edit was successful.");
          setSavedRaces(
            // also edit the local state so there is no need to wait for another fetch from DB
            (prev) =>
              prev.map((r) => (r.id === race.id ? { ...r, ...body } : r)) // adding a new race at the end
          );
        }
      } else {
        // saving a new race
        const res = await saveRace(body);

        if (res.ok) {
          alert("Saved to DataBase");
          setSavedRaces((prev) => [...prev, body]);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this race?")) return;
    const res = await deleteRace(id);
    if (res.ok) {
      setSavedRaces((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleToggleFavorite = async (id, isCurrentlyFavorite) => {
    const res = await toggleFavoriteRace(id, isCurrentlyFavorite);
    if (res.ok) {
      setSavedRaces((prev) =>
        prev.map((r) => ({
          ...r,
          isFavorite: isCurrentlyFavorite ? false : r.id === id,
        }))
      );
    }
  };

  // ------ RENDER SECTION --------

  return (
    <main className="app-container">
      <h1 className="app-title">F1 Tracker 🏁</h1>
  
      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button
          className={activeTab === "saved" ? "active" : ""}
          onClick={() => setActiveTab("saved")}
        >
          Saved Races
        </button>
        <button
          className={activeTab === "import" ? "active" : ""}
          onClick={() => setActiveTab("import")}
        >
          Import Races from API
        </button>
      </div>
  
      {/* Search */}
      <input
        type="text"
        placeholder="Find a race by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
  
      {/* Sort By */}
      <div className="sort-select">
        <label>
          Sort by
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
  
      {/* SAVED RACES */}
      {activeTab === "saved" && (
        <SavedRaces
          races={paginatedSavedRaces}
          onDelete={handleDelete}
          onSave={handleSave}
          onToggleFavorite={handleToggleFavorite}
          editData={editData}
          updateField={updateField}
        />
      )}
  
      {/* IMPORTED RACES */}
      {activeTab === "import" && (
        <>
          <div className="season-select">
            <label>
              Season:
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                {seasons.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </label>
          </div>
  
          {loading ? (
            <p>Loading...</p>
          ) : importedRaces.length === 0 ? (
            <p>No races to show.</p>
          ) : (
            <ImportRaces
              races={paginatedApiRaces}
              onSave={handleSave}
              editData={editData}
              updateField={updateField}
            />
          )}
        </>
      )}
  
      {/* Pagination */}
      <div className="pagination">
        <label>
          Races per page:
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(e.target.value);
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
  
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ◀️ Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
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
