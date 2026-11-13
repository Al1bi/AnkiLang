import { WordRepository } from "@/repositories/WordRepository";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export class ExportPendingWordsToCsvUseCase {
  constructor(private wordRepo: WordRepository) {}

  async execute(limit: number): Promise<void> {
    if (limit <= 0) {
      throw new Error("Ingresa una cantidad válida mayor a 0.");
    }

    const words = await this.wordRepo.getAll();
    const pendingWords = words.filter((w) => w.state === "pending");

    if (pendingWords.length === 0) {
      throw new Error("No hay palabras pendientes para exportar.");
    }

    const wordsToExport = pendingWords.slice(0, limit);

    const header = "id,term,term_reading\n";
    const rows = wordsToExport
      .map(
        (w) => `"${w.id}","${w.term.replace(/"/g, '""')}", "${w.term_reading}"`,
      )
      .join("\n");
    const csvContent = header + rows;

    const file = new File(Paths.document, "palabras_pendientes.csv");

    if (file.exists) {
      file.delete();
    }

    file.create();
    file.write(csvContent);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Exportar palabras pendientes",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      throw new Error(
        "La función de compartir no está disponible en este dispositivo.",
      );
    }
  }
}
