import { useTransferViewModel } from "@/viewmodels/TransferViewModel";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function TransferScreen() {
  const {
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
  } = useTransferViewModel();

  const isAnyActionBusy = isExporting || isExportingAnki || isImporting;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Transferencia de Datos</Text>
      <Text style={styles.description}>
        Exporta palabras pendientes a CSV, importa un archivo editado o exporta
        tus palabras completadas a Anki.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Tarjeta 1: Exportación CSV */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>1. Exportar a CSV</Text>
        <Text style={styles.cardTitle}>Palabras pendientes disponibles</Text>

        {isLoadingCount ? (
          <ActivityIndicator size="small" color="#E4CBFF" />
        ) : (
          <Text style={styles.countText}>{pendingCount}</Text>
        )}

        <Text style={styles.label}>¿Cuántas palabras deseas exportar?</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder={`Ej. 10 (Máximo ${pendingCount})`}
          placeholderTextColor="#6B7280"
          value={exportCountText}
          onChangeText={setExportCountText}
          editable={!isAnyActionBusy && pendingCount > 0}
        />

        {isExporting ? (
          <ActivityIndicator
            color="#E4CBFF"
            size="large"
            style={styles.loader}
          />
        ) : (
          <Button
            title="Exportar a CSV"
            color="#7A22C8"
            onPress={handleExport}
            disabled={
              pendingCount === 0 || !exportCountText.trim() || isAnyActionBusy
            }
          />
        )}
      </View>

      {/* Tarjeta 2: Importar desde CSV */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>2. Importar desde CSV</Text>
        <Text style={styles.cardDescription}>
          Selecciona un archivo CSV que contenga la columna{" "}
          <Text style={styles.bold}>id</Text> y los campos a actualizar (term,
          term_reading, spanish_meaning, etc.).
        </Text>

        {isImporting ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#10B981" size="large" />
            <Text style={styles.loaderText}>
              Actualizando registros en la base de datos...
            </Text>
          </View>
        ) : (
          <Button
            title="Seleccionar archivo CSV e Importar"
            color="#059669"
            onPress={handleImportCSV}
            disabled={isAnyActionBusy}
          />
        )}
      </View>

      {/* Tarjeta 3: Exportar a Anki */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>3. Exportar a Anki</Text>
        <Text style={styles.cardTitle}>Tarjetas completadas disponibles</Text>

        {isLoadingCount ? (
          <ActivityIndicator size="small" color="#C084FC" />
        ) : (
          <Text style={[styles.countText, styles.ankiCountText]}>
            {completedCount}
          </Text>
        )}

        <Text style={styles.cardDescription}>
          Exporta todas tus palabras completadas al formato compatible con Anki.
        </Text>

        {isExportingAnki ? (
          <ActivityIndicator
            color="#C084FC"
            size="large"
            style={styles.loader}
          />
        ) : (
          <Button
            title="Exportar a Anki"
            color="#9333EA"
            onPress={handleExportAnki}
            disabled={completedCount === 0 || isAnyActionBusy}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0F0C1B" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E4CBFF",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#1E1A2D",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2238",
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E4CBFF",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: "600", color: "#A78BFA" },
  cardDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 16,
    lineHeight: 18,
  },
  bold: { fontWeight: "bold", color: "#F3E8FF" },
  countText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E4CBFF",
    marginVertical: 4,
  },
  ankiCountText: {
    color: "#C084FC",
  },
  label: {
    fontSize: 14,
    color: "#D1D5DB",
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#2A2238",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#161224",
    color: "#FFFFFF",
  },
  errorText: {
    color: "#F87171",
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: "#3B1219",
    padding: 10,
    borderRadius: 8,
  },
  loader: { marginVertical: 10 },
  loaderContainer: { alignItems: "center", paddingVertical: 10 },
  loaderText: { marginTop: 8, color: "#10B981", fontSize: 13 },
});
