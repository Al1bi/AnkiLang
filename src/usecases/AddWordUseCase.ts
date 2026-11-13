import { WordRepository } from "../repositories/WordRepository";

export class AddWordUseCase {
  constructor(private wordRepo: WordRepository) {}

  async execute(text: string, reading?: string) {
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error("La palabra no puede estar vacía");
    }

    const trimmedReading = reading?.trim();

    return await this.wordRepo.add({
      term: trimmedText,
      term_reading: trimmedReading || undefined,
      state: "pending",
      language: "ja",
    });
  }
}
