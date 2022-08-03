export type Stats = Record<
  string,
  {
    tweets: {
      id: string;
      text: string;
      username: string;
      created_at: string;
    }[];
    at: string;
  }
>;
