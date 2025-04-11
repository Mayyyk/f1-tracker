import RaceForm from "../components/RaceForm.jsx";

const ImportedRaces = ({ races, onSave, editData, updateField }) => (
  <>
    <h2>Imported Races</h2>
    <ul>
      {races.map((race) => (
        <li key={race.id}>
          <RaceForm
            race={race}
            isSaved={false}
            onSave={onSave}
            editData={editData}
            updateField={updateField}
          />
        </li>
      ))}
    </ul>
  </>
);

export default ImportedRaces;
