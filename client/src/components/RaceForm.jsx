import React from "react";

const RaceForm = ({
  race,
  isSaved,
  onSave,
  onToggleFavorite,
  editData,
  updateField,
}) => {
  const data = editData[race.id] || {
    comment: race.comment || "",
    wasRain: race.wasRain || false,
  };

  return (
    <div className="race-form">
      <h3 className="race-title">
        <strong>{race.name}</strong> – {race.circuit}{" "}
        <span className="race-date">({race.date})</span>
      </h3>

      <div className="race-details">
        <label className="form-label">
          Was it rainy?
          <select
            className="form-select"
            value={data.wasRain ? "yes" : "no"}
            onChange={(e) =>
              updateField(race.id, "wasRain", e.target.value === "yes")
            }
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>

        {race.wikiUrl && (
          <p className="race-wiki">
            <a href={race.wikiUrl} target="_blank" rel="noopener noreferrer">
              🌐 See more details on Wikipedia
            </a>
          </p>
        )}

        <label>
          Comment:
          {isSaved ? (
            <p style={{ color: "#ccc" }}>{race.comment || "No comment"}</p>
          ) : (
            <input
              type="text"
              value={editData[race.id]?.comment || ""}
              onChange={(e) => updateField(race.id, "comment", e.target.value)}
            />
          )}
        </label>

        <div className="race-buttons">
          {isSaved && (
            <button
              className="btn-secondary"
              onClick={() => onToggleFavorite(race.id, race.isFavorite)}
            >
              {race.isFavorite ? "💔 Remove Favorite" : "⭐ Set as Favorite"}
            </button>
          )}

          <button className="btn-primary" onClick={() => onSave(race, isSaved)}>
            {isSaved ? "💾 Save Changes" : "📥 Save to Database"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceForm;
