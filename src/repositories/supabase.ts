import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Reemplaza estas comillas con las llaves reales de tu panel de Supabase
const SUPABASE_URL = "https://cczcukvkanzoujzpcyvi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Xt9N56I86kDxYpfe_xjT9A_EEz0uHXL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
