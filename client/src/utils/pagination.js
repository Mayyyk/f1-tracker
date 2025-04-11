export const paginateRaces = (data, page, limit)  =>
    data.slice((page - 1) * limit, page * limit);