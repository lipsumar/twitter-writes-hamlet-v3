export interface Word {
  token: string;
  alternative?: string;
  index: number;
}
export interface TextContent {
  raw: string;
  words: Word[];
}
export interface LiveWord extends Word {
  tweetId: string | null;
}
export interface LiveTextContent extends TextContent {
  words: LiveWord[];
}
interface BaseEntry {
  index: number;
}
export interface DialogueEntry<TContent = TextContent> extends BaseEntry {
  type: "dialogue";
  text: TContent;
  name: TContent;
  direction?: TContent;
}
export interface ContinuedDialogueEntry<TContent = TextContent>
  extends BaseEntry {
  type: "dialogue";
  text: TContent;
  continued: true; // if true, is a continued dialogue after a DirectionEntry that cuts it
}
export interface DirectionEntry<TContent = TextContent> extends BaseEntry {
  type: "direction";
  text: TContent;
}
export interface TitleEntry<TContent = TextContent> extends BaseEntry {
  type: "title";
  titleType: "title" | "scene";
  text: TContent;
}
export type Entry<TContent = TextContent> =
  | DialogueEntry<TContent>
  | ContinuedDialogueEntry<TContent>
  | DirectionEntry<TContent>
  | TitleEntry<TContent>;

export interface Scene {
  entries: Entry[];
  actNumber: number;
  sceneNumber: number;
}
