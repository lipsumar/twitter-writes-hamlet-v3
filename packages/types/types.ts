export interface Word {
  token: string;
  alternative?: string;
  index: number;
  tweetId?: string | null;
}

export interface TextContent {
  raw: string;
  words: Word[];
}

export interface Entry {
  index: number;
  type: "dialogue" | "name" | "direction" | "title" | "title-scene";
  text: TextContent;
  actNumber: number;
  sceneNumber: number;
  lineNumber?: number;
}
