import { CreateWordInput, Word } from "../domain/Word";
import { supabase } from "./supabase";
import { WordRepository } from "./WordRepository";

export class SupabaseWordRepository implements WordRepository {
  async add(wordData: CreateWordInput): Promise<Word> {
    const { data, error } = await supabase
      .from("words")
      .insert([
        {
          term: wordData.term,
          term_reading: wordData.term_reading,
          spanish_meaning: wordData.spanish_meaning,
          sentence: wordData.sentence,
          sentence_reading: wordData.sentence_reading,
          spanish_sentence: wordData.spanish_sentence,
          language: wordData.language,
          state: wordData.state || "pending",
          tags: wordData.tags || [],
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`La palabra "${wordData.term}" ya está registrada.`);
      }
      throw new Error(
        `Error en Supabase al guardar la palabra: ${error.message}`,
      );
    }

    return {
      id: data.id,
      term: data.term,
      term_reading: data.term_reading,
      spanish_meaning: data.spanish_meaning,
      sentence: data.sentence,
      sentence_reading: data.sentence_reading,
      spanish_sentence: data.spanish_sentence,
      language: data.language,
      date_created: new Date(data.date_created),
      state: data.state,
      tags: data.tags || [],
    };
  }

  async getAll(): Promise<Word[]> {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .order("date_created", { ascending: false });

    if (error) {
      throw new Error(
        `Error en Supabase al consultar las palabras: ${error.message}`,
      );
    }

    return data.map((item) => ({
      id: item.id,
      term: item.term,
      term_reading: item.term_reading,
      spanish_meaning: item.spanish_meaning,
      sentence: item.sentence,
      sentence_reading: item.sentence_reading,
      spanish_sentence: item.spanish_sentence,
      language: item.language,
      date_created: new Date(item.date_created),
      state: item.state,
      tags: item.tags || [],
    }));
  }

  async update(id: string, wordData: Partial<Word>): Promise<boolean> {
    const { data, error } = await supabase
      .from("words")
      .update(wordData) // Pasa solo los datos limpios que cambiaron
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(`Error en Supabase (ID ${id}): ${error.message}`);
    }

    return Array.isArray(data) && data.length > 0;
  }
}

export const supabaseWordRepository = new SupabaseWordRepository();
