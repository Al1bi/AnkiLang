import { supabaseWordRepository } from "@/repositories/SupabaseWordRepository";
import { ExportPendingWordsToCsvUseCase } from "@/usecases/ExportPendingWordsToCsvUseCase";
import { ExportToAnkiUseCase } from "@/usecases/ExportToAnkiUseCase";
import { ImportWordsFromCsvUseCase } from "@/usecases/ImportWordsFromCsvUseCase";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";

const exportWordsToCSVUseCase = new ExportPendingWordsToCsvUseCase(
  supabaseWordRepository,
);
const importWordsFromCSVUseCase = new ImportWordsFromCsvUseCase(
  supabaseWordRepository,
);
const exportToAnkiUseCase = new ExportToAnkiUseCase(supabaseWordRepository);

export function useTransferViewModel() {
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [exportCountText, setExportCountText] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAnki, setIsExportingAnki] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCounts = async () => {
    try {
      setIsLoadingCount(true);
      setError(null);
      const words = await supabaseWordRepository.getAll();

      const pending = words.filter((w) => w.state === "pending");
      const completed = words.filter((w) => w.state === "completed");

      setPendingCount(pending.length);
      setCompletedCount(completed.length);
    } catch (err: any) {
      setError("Error al obtener conteo de palabras: " + err.message);
    } finally {
      setIsLoadingCount(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const handleExport = async () => {
    const count = parseInt(exportCountText, 10);
    if (isNaN(count) || count <= 0) {
      alert("Por favor ingresa un número válido mayor a 0.");
      return;
    }
    if (count > pendingCount) {
      alert(`No puedes exportar más de ${pendingCount} palabras pendientes.`);
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      await exportWordsToCSVUseCase.execute(count);
      alert(`Se exportaron ${count} palabras con éxito.`);
      setExportCountText("");
      await loadCounts();
    } catch (err: any) {
      setError(err.message || "Error al exportar las palabras");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAnki = async () => {
    if (completedCount === 0) {
      alert("No hay palabras completadas disponibles para exportar.");
      return;
    }

    try {
      setIsExportingAnki(true);
      setError(null);
      await exportToAnkiUseCase.execute();
      alert("Se exportaron las palabras completadas a Anki con éxito.");
      await loadCounts();
    } catch (err: any) {
      setError(err.message || "Error al exportar a Anki");
    } finally {
      setIsExportingAnki(false);
    }
  };

  const handleImportCSV = async () => {
    try {
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "text/plain",
          "application/csv",
          "application/vnd.ms-excel",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedFile = result.assets[0];

      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Por favor selecciona un archivo con extensión .csv");
        return;
      }

      setIsImporting(true);

      const response = await fetch(selectedFile.uri);
      const csvContent = await response.text();

      const { updatedCount } =
        await importWordsFromCSVUseCase.execute(csvContent);

      alert(`¡Importación exitosa! Se actualizaron ${updatedCount} palabras.`);
      await loadCounts();
    } catch (err: any) {
      setError(err.message || "Error al importar el archivo CSV");
    } finally {
      setIsImporting(false);
    }
  };

  return {
    pendingCount,
    completedCount,
    exportCountText,
    setExportCountText,
    isExporting,
    isExportingAnki,
    isImporting,
    isLoadingCount,
    error,
    handleExport,
    handleExportAnki,
    handleImportCSV,
    reloadCount: loadCounts,
  };
}
