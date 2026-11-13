import { WordRepository } from "../repositories/WordRepository";

export class GetAllWordsUseCase {
  constructor(private wordRepo: WordRepository) {}

  async execute() {
    return await this.wordRepo.getAll();
  }
}
