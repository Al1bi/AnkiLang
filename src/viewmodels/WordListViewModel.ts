import { Word } from "@/domain/Word";
import { supabaseWordRepository } from "@/repositories/SupabaseWordRepository";
import { ExportPendingWordsToCsvUseCase } from "@/usecases/ExportPendingWordsToCsvUseCase";
import { GetAllWordsUseCase } from "@/usecases/GetAllWordsUseCase";
import {
    FuriganaSegment,
    ParseSentenceFuriganaUseCase,
} from "@/usecases/ParseSentenceFuriganaUseCase";
import { useEffect, useState } from "react";

export interface WordUI extends Word {
  parsedSentence?: FuriganaSegment[];
}

const getWordsUseCase = new GetAllWordsUseCase(supabaseWordRepository);
const exportPendingWordsToCsvUseCase = new ExportPendingWordsToCsvUseCase(
  supabaseWordRepository,
);
const parseSentenceFuriganaUseCase = new ParseSentenceFuriganaUseCase();

export function useWordsListViewModel() {
  const [words, setWords] = useState<Word[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);
      const rawWords = await getWordsUseCase.execute();

      const processedWords: WordUI[] = rawWords.map((word) => ({
        ...word,
        parsedSentence: parseSentenceFuriganaUseCase.execute(
          word.sentence,
          word.sentence_reading,
        ),
      }));

      setWords(processedWords);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const pendingWords = words.filter((w) => w.state === "pending");
  const completedWords = words.filter((w) => w.state === "completed");
  const currentList = activeTab === "pending" ? pendingWords : completedWords;

  const exportPendingToCSV = async (limit: number) => {
    try {
      setIsExporting(true);
      setError(null);
      await exportPendingWordsToCsvUseCase.execute(limit);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    currentList,
    activeTab,
    setActiveTab,
    pendingCount: pendingWords.length,
    completedCount: completedWords.length,
    isLoading,
    isRefreshing,
    isExporting,
    error,
    refreshWords: () => fetchWords(true),
    exportPendingToCSV,
  };
}
