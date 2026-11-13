import { WordRepository } from "@/repositories/WordRepository";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
    FuriganaSegment,
    ParseSentenceFuriganaUseCase,
} from "./ParseSentenceFuriganaUseCase";

export class ExportToAnkiUseCase {
  private parseFuriganaUseCase: ParseSentenceFuriganaUseCase;

  constructor(private wordRepository: WordRepository) {
    this.parseFuriganaUseCase = new ParseSentenceFuriganaUseCase();
  }

  async execute(): Promise<void> {
    const allWords = await this.wordRepository.getAll();
    const completedWords = allWords.filter((w) => w.state === "completed");

    if (completedWords.length === 0) {
      throw new Error("No hay tarjetas completadas disponibles para exportar.");
    }

    const rows = completedWords.map((word) => {
      // PROCESAMOS PALABRA
      const wordSegments = this.parseFuriganaUseCase.execute(
        word.term || "",
        word.term_reading || "",
      );

      const palabraPura = wordSegments.map((s) => s.text).join("");
      const palabraConLectura = this.formatAnkiFurigana(wordSegments);

      const hasKanjiInWord = wordSegments.some(
        (s) => s.reading !== undefined && s.reading.trim() !== "",
      );
      const kanjiField = hasKanjiInWord ? palabraPura : "";

      // PROCESAMOS FRASE
      const sentenceSegments = this.parseFuriganaUseCase.execute(
        word.sentence || "",
        word.sentence_reading || "",
      );

      const frasePura =
        sentenceSegments.length > 0
          ? sentenceSegments.map((s) => s.text).join("")
          : word.sentence || "";
      const fraseConLectura = this.formatAnkiFurigana(sentenceSegments);

      const definicion = word.spanish_meaning
        ? word.spanish_meaning.join(", ")
        : "";
      const traduccion = word.spanish_sentence || "";
      const indiceOrdenacion = String(word.id);

      // PROCESAMOS TAGS (CLASIFICACIÓN)
      const tagsParaAnki =
        word.tags && word.tags.length > 0
          ? word.tags.map((tag) => tag.trim().replace(/\s+/g, "_")).join(" ")
          : "";

      // ORDENAMOS LOS DATOS EXACTAMENTE COMO ESPERA ANKI
      return [
        this.escapeCsvField(indiceOrdenacion), // 1: Índ. ordenación
        this.escapeCsvField(palabraPura), // 2: Palabra
        this.escapeCsvField(palabraConLectura), // 3: Palabra con lectura
        this.escapeCsvField(definicion), // 4: Definición
        this.escapeCsvField(frasePura), // 5: Ejemplo de frase
        this.escapeCsvField(fraseConLectura), // 6: Frase con lectura
        this.escapeCsvField(traduccion), // 7: Traducción
        this.escapeCsvField(kanjiField), // 8: Kanji
        this.escapeCsvField(tagsParaAnki), // 9: Clasificación
      ];
    });

    const ankiHeaders = [
      "#separator:comma",
      "#html:true",
      "#tags column:9",
      "#deck:AnkiLang",
    ].join("\n");

    const rowsContent = rows.map((row) => row.join(",")).join("\n");
    const csvContent = `${ankiHeaders}\n${rowsContent}`;

    const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!cacheDir) {
      throw new Error(
        "No se pudo acceder al directorio temporal del dispositivo.",
      );
    }

    const fileUri = `${cacheDir}anki_completed_words_${Date.now()}.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Exportar tarjetas a Anki",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      throw new Error(
        "La función de compartir no está disponible en este dispositivo.",
      );
    }
  }

  /**
   * Formato oficial estricto de Anki (Espacio + Kanji[Lectura])
   */
  private formatAnkiFurigana(segments: FuriganaSegment[]): string {
    let result = "";
    for (const seg of segments) {
      if (seg.reading && seg.reading.trim() !== "") {
        // Anki REQUIERE un espacio antes del kanji
        result += ` ${seg.text}[${seg.reading}]`;
      } else {
        result += seg.text;
      }
    }
    return result;
  }

  private escapeCsvField(field: string): string {
    if (!field) return '""';
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
