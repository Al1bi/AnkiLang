import { WordRepository } from "../repositories/WordRepository";

export class ImportWordsFromCsvUseCase {
  constructor(private wordRepo: WordRepository) {}

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        fields.push(this.cleanValue(currentField));
        currentField = "";
      } else {
        currentField += char;
      }
    }
    fields.push(this.cleanValue(currentField));
    return fields;
  }

  private cleanValue(val: string): string {
    return val
      .replace(/\r/g, "")
      .trim()
      .replace(/^"+|"+$/g, "")
      .trim();
  }

  async execute(
    csvText: string,
  ): Promise<{ updatedCount: number; totalRows: number }> {
    const cleanText = csvText.replace(/^\uFEFF/, "").trim();
    const lines = cleanText.split("\n").filter((l) => l.trim().length > 0);

    if (lines.length <= 1) {
      throw new Error("El archivo CSV está vacío o solo contiene la cabecera.");
    }

    const headers = this.parseCSVLine(lines[0]).map((h) => h.toLowerCase());
    const idIndex = headers.indexOf("id");

    if (idIndex === -1) {
      throw new Error("No se encontró la columna 'id' en la cabecera del CSV.");
    }

    const dataRows = lines.slice(1);
    let updatedCount = 0;

    for (const row of dataRows) {
      const values = this.parseCSVLine(row);
      const id = values[idIndex];

      if (!id) continue;

      const getVal = (headerName: string) => {
        const idx = headers.indexOf(headerName);
        if (idx === -1 || !values[idx]) return undefined;
        return values[idx].length > 0 ? values[idx] : undefined;
      };

      const meaningRaw = getVal("spanish_meaning");
      const meaningArray = meaningRaw
        ? meaningRaw
            .split(";")
            .map((m) => m.trim())
            .filter((m) => m.length > 0)
        : undefined;

      const tagsRaw = getVal("tags");
      const tagsArray = tagsRaw
        ? tagsRaw
            .split(";")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : undefined;

      const payload: Record<string, any> = {
        state: "completed",
      };

      const term = getVal("term");
      if (term) payload.term = term;

      const termReading = getVal("term_reading");
      if (termReading) payload.term_reading = termReading;

      if (meaningArray) payload.spanish_meaning = meaningArray;

      const sentence = getVal("sentence");
      if (sentence) payload.sentence = sentence;

      const sentenceReading = getVal("sentence_reading");
      if (sentenceReading) payload.sentence_reading = sentenceReading;

      const spanishSentence = getVal("spanish_sentence");
      if (spanishSentence) payload.spanish_sentence = spanishSentence;

      if (tagsArray) payload.tags = tagsArray;

      const isUpdated = await this.wordRepo.update(id, payload);

      if (isUpdated) {
        updatedCount++;
      } else {
        console.warn(
          `No se encontró o no se pudo actualizar el ID en Supabase: [${id}]`,
        );
      }
    }

    if (updatedCount === 0) {
      throw new Error(
        `No se actualizó ningún registro. Revisa en la consola de Metro los IDs que fallaron o verifica las políticas RLS en Supabase.`,
      );
    }

    return { updatedCount, totalRows: dataRows.length };
  }
}
