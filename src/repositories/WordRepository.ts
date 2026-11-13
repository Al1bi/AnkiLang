import { CreateWordInput, Word } from "../domain/Word";

export interface WordRepository {
  add(wordData: CreateWordInput): Promise<Word>;
  getAll(): Promise<Word[]>;
  update(id: string, wordData: Partial<Word>): Promise<boolean>;
}
