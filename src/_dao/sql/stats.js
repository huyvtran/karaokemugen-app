// SQL for stats

export const exportPlayed = 'SELECT fk_kid, session_started_at, modified_at FROM played';

export const exportRequested = 'SELECT fk_kid, session_started_at, requested_at FROM requested';

export const exportFavorites = `
SELECT f.fk_kid
FROM favorites f
WHERE f.login NOT LIKE '%@%';
`;