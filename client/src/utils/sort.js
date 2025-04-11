export const sortRaces = (a, b, sortBy) => {
  if (sortBy === "date") {
    return new Date(a.date) - new Date(b.date);
  } else if (sortBy === "name") {
    return a.name.localeCompare(b.name);
  }
  return 0;
};
