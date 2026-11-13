// usecases/ParseSentenceFuriganaUseCase.ts

export interface FuriganaSegment {
  text: string;
  reading?: string;
}

export class ParseSentenceFuriganaUseCase {
  execute(sentence?: string, reading?: string): FuriganaSegment[] {
    if (!sentence) return [];

    // Si no hay lectura, son idénticas o no hay kanjis, retornamos el texto tal cual
    if (!reading || sentence === reading || !this.hasKanji(sentence)) {
      return [{ text: sentence }];
    }

    const normalizedReading = this.toHiragana(reading.trim());
    const normalizedSentence = sentence.trim();

    // Regex para separar bloques de Kanjis de todo lo demás (Hiragana, Katakana, Puntuación, etc.)
    const kanjiRegex = /([\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+)/g;
    const rawParts = normalizedSentence.split(kanjiRegex).filter(Boolean);

    const parts = rawParts.map((part) => ({
      text: part,
      isKanji: this.isKanjiBlock(part),
    }));

    const segments: FuriganaSegment[] = [];
    let readingIndex = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!part.isKanji) {
        // Bloque Kana / Puntuación
        segments.push({ text: part.text });

        // Avanzar el puntero de lectura buscando este bloque de Kana
        const matchedLen = this.findKanaMatchLength(
          normalizedReading,
          readingIndex,
          part.text,
        );
        readingIndex += matchedLen;
      } else {
        // Bloque Kanji: Buscamos la siguiente "ancla" (primer bloque NO-Kanji posterior)
        let nextAnchorIndex = -1;
        let anchorText = "";

        for (let j = i + 1; j < parts.length; j++) {
          if (!parts[j].isKanji) {
            nextAnchorIndex = j;
            anchorText = parts[j].text;
            break;
          }
        }

        if (nextAnchorIndex !== -1 && anchorText) {
          // NUEVO: Calcular la longitud mínima en caracteres Kana que ocupará este bloque Kanji.
          // Esto evita que el ancla haga "match" con el interior de la lectura del propio kanji.
          let minKanjiLength = 0;
          for (let k = i; k < nextAnchorIndex; k++) {
            minKanjiLength += parts[k].text.length;
          }

          const anchorPos = this.findAnchorPosition(
            normalizedReading,
            readingIndex + minKanjiLength, // ← SE APLICA EL SALTO AQUÍ
            anchorText,
          );

          if (anchorPos !== -1) {
            const kanjiBlocksCount = nextAnchorIndex - i;

            if (kanjiBlocksCount === 1) {
              const furigana = reading.substring(readingIndex, anchorPos);
              segments.push({ text: part.text, reading: furigana });
              readingIndex = anchorPos;
            } else {
              // Si hay múltiples bloques de Kanji seguidos antes del ancla
              const totalReadingChunk = reading.substring(
                readingIndex,
                anchorPos,
              );
              const kanjiSegments = this.distributeFurigana(
                parts.slice(i, nextAnchorIndex),
                totalReadingChunk,
              );
              segments.push(...kanjiSegments);
              readingIndex = anchorPos;
              i = nextAnchorIndex - 1; // Avanzar el índice al último Kanji procesado
            }
          } else {
            // Fallback si no encuentra el ancla por alguna inconsistencia
            const furigana = reading.substring(readingIndex);
            segments.push({ text: part.text, reading: furigana });
            readingIndex = reading.length;
          }
        } else {
          // No hay más anclas tras este Kanji (es el último bloque o los que quedan son todos Kanjis)
          const remainingKanjiParts = parts.slice(i);
          const remainingReading = reading.substring(readingIndex);

          const kanjiSegments = this.distributeFurigana(
            remainingKanjiParts,
            remainingReading,
          );

          segments.push(...kanjiSegments);
          break;
        }
      }
    }

    return segments;
  }

  private hasKanji(str: string): boolean {
    return /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(str);
  }

  private isKanjiBlock(str: string): boolean {
    return /^[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+$/.test(str);
  }

  private toHiragana(str: string): string {
    return str.replace(/[\u30a1-\u30f6]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) - 0x60),
    );
  }

  private findAnchorPosition(
    normalizedReading: string,
    fromIndex: number,
    anchorText: string,
  ): number {
    const normAnchor = this.toHiragana(anchorText);
    let pos = normalizedReading.indexOf(normAnchor, fromIndex);

    if (pos !== -1) return pos;

    const particleMap: Record<string, string> = {
      は: "わ",
      へ: "え",
      を: "お",
    };

    if (particleMap[normAnchor]) {
      pos = normalizedReading.indexOf(particleMap[normAnchor], fromIndex);
      if (pos !== -1) return pos;
    }

    return -1;
  }

  private findKanaMatchLength(
    normalizedReading: string,
    fromIndex: number,
    kanaText: string,
  ): number {
    const normKana = this.toHiragana(kanaText);
    const pos = normalizedReading.indexOf(normKana, fromIndex);

    if (pos === fromIndex) {
      return normKana.length;
    }
    return kanaText.length;
  }

  private distributeFurigana(
    kanjiParts: { text: string; isKanji: boolean }[],
    readingChunk: string,
  ): FuriganaSegment[] {
    if (kanjiParts.length === 1) {
      return [{ text: kanjiParts[0].text, reading: readingChunk }];
    }

    const totalKanjiChars = kanjiParts.reduce(
      (sum, p) => sum + p.text.length,
      0,
    );
    const result: FuriganaSegment[] = [];
    let currentPos = 0;

    for (let k = 0; k < kanjiParts.length; k++) {
      const part = kanjiParts[k];
      if (k === kanjiParts.length - 1) {
        result.push({
          text: part.text,
          reading: readingChunk.substring(currentPos),
        });
      } else {
        const ratio = part.text.length / totalKanjiChars;
        const charCount = Math.round(ratio * readingChunk.length);
        const segmentReading = readingChunk.substring(
          currentPos,
          currentPos + charCount,
        );
        currentPos += charCount;
        result.push({ text: part.text, reading: segmentReading });
      }
    }

    return result;
  }
}
