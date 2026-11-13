import { useWordViewModel } from "@/viewmodels/WordViewModel";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function WordScreen() {
  const {
    text,
    setText,
    hasReading,
    setHasReading,
    reading,
    setReading,
    error,
    isLoading,
    handleAddWord,
  } = useWordViewModel();

  const isButtonDisabled = !text.trim() || (hasReading && !reading.trim());

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Palabra</Text>
          <TextInput
            style={[styles.input, isLoading && styles.disabledInput]}
            placeholder="Escribe una palabra..."
            placeholderTextColor="#6B7280"
            value={text}
            onChangeText={setText}
            editable={!isLoading}
          />

          {/* Opción para activar/desactivar la lectura */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>¿Conoces la lectura?</Text>
            <Switch
              value={hasReading}
              onValueChange={setHasReading}
              disabled={isLoading}
              trackColor={{ false: "#2A2238", true: "#E4CBFF" }}
              thumbColor={hasReading ? "#7A22C8" : "#4B5563"}
            />
          </View>

          {/* Caja de texto condicional para la lectura */}
          {hasReading && (
            <View style={styles.readingContainer}>
              <Text style={styles.label}>Lectura / Pronunciación</Text>
              <TextInput
                style={[styles.input, isLoading && styles.disabledInput]}
                placeholder="Ej. Kana, Pinyin, fonética..."
                placeholderTextColor="#6B7280"
                value={reading}
                onChangeText={setReading}
                editable={!isLoading}
              />
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#E4CBFF"
              style={styles.loader}
            />
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isButtonDisabled && styles.disabledButton,
              ]}
              onPress={handleAddWord}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  isButtonDisabled && styles.disabledButtonText,
                ]}
              >
                Agregar
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#0F0C1B",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#E4CBFF" },
  input: {
    borderWidth: 1,
    borderColor: "#2A2238",
    backgroundColor: "#1E1A2D",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 20,
    color: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#161224",
    borderColor: "#2A2238",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#1E1A2D",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2238",
  },
  switchLabel: {
    fontSize: 16,
    color: "#F3E8FF",
  },
  readingContainer: {
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#E4CBFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#2A2238",
  },
  submitButtonText: {
    color: "#0F0C1B",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: "#6B7280",
  },
  errorText: { color: "#F87171", marginBottom: 16, textAlign: "center" },
  loader: { marginVertical: 10 },
});
