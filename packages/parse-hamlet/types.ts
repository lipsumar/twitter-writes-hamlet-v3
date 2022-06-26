export interface Word {
  token: string;
  alternative?: string;
  index: number;
}
export interface TextContent {
  raw: string;
  words: Word[];
}
interface BaseEntry {
  index: number;
}
export interface DialogueEntry extends BaseEntry {
  type: "dialogue";
  text: TextContent;
  name: TextContent;
  direction?: TextContent;
}
export interface ContinuedDialogueEntry extends BaseEntry {
  type: "dialogue";
  text: TextContent;
  continued: true; // if true, is a continued dialogue after a DirectionEntry that cuts it
  direction?: TextContent;
}
export interface DirectionEntry extends BaseEntry {
  type: "direction";
  text: TextContent;
}
export interface TitleEntry extends BaseEntry {
  type: "title";
  titleType: "title" | "scene";
  text: TextContent;
}
export type Entry =
  | DialogueEntry
  | ContinuedDialogueEntry
  | DirectionEntry
  | TitleEntry;

export interface Scene {
  entries: Entry[];
  actNumber: number;
  sceneNumber: number;
}
