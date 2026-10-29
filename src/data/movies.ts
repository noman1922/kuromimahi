export const GENRE_LIST = [
  'All',
  'Romance',
  'Drama',
  'Animation',
  'Fantasy',
  'Sci-Fi',
  'Comedy',
  'Mystery',
] as const;

export type FilterGenre = (typeof GENRE_LIST)[number];
