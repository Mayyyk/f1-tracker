import RaceForm from "../components/RaceForm.jsx";

const SavedRaces = ({ races, onDelete, onSave, onToggleFavorite, editData, updateField }) => (
  <>
    <h2>Saved Races</h2>
    <ul>
      {races.map((race) => (
        <li key={race.id}>
          <RaceForm
            race={race}
            isSaved={true}
            onSave={onSave}
            onToggleFavorite={onToggleFavorite}
            editData={editData}
            updateField={updateField}
          />
          <button onClick={() => onDelete(race.id)}>Delete</button>
        </li>
      ))}
    </ul>
  </>
);

export default SavedRaces;
