import { supabaseWordRepository } from "@/repositories/SupabaseWordRepository";
import { AddWordUseCase } from "@/usecases/AddWordUseCase";
import { useState } from "react";

const addWordUseCase = new AddWordUseCase(supabaseWordRepository);

export function useWordViewModel() {
  const [text, setText] = useState("");
  const [hasReading, setHasReading] = useState(false);
  const [reading, setReading] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddWord = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const readingValue = hasReading ? reading.trim() : undefined;
      await addWordUseCase.execute(text, readingValue);
      setText("");
      setReading("");
      setHasReading(false);
      alert("Palabra agregada con éxito");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false); 
    }
  };

  return {
    text,
    setText,
    hasReading,
    setHasReading,
    reading,
    setReading,
    error,
    isLoading,
    handleAddWord,
  };
}
