export type WordState = "pending" | "completed";

export interface Word {
  id: string;
  term: string;
  term_reading?: string;
  spanish_meaning?: string[];
  sentence?: string;
  sentence_reading?: string;
  spanish_sentence?: string;
  language?: string;
  date_created: Date;
  state: WordState;
  tags?: string[];
}

export type CreateWordInput = Omit<Word, "id" | "date_created"> & {
  state?: WordState;
};
