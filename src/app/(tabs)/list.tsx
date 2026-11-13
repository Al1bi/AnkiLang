import { FuriganaSegment } from "@/usecases/ParseSentenceFuriganaUseCase";
import { useWordsListViewModel, WordUI } from "@/viewmodels/WordListViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function FuriganaText({
  segment,
  showFurigana,
}: {
  segment: FuriganaSegment;
  showFurigana: boolean;
}) {
  if (!segment.reading || !showFurigana) {
    return (
      <View style={styles.furiganaSegmentContainer}>
        <Text style={[styles.furiganaReading, { color: "transparent" }]}>
          {" "}
        </Text>
        <Text style={styles.sentenceText}>{segment.text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.furiganaSegmentContainer}>
      <Text style={styles.furiganaReading}>{segment.reading}</Text>
      <Text style={styles.sentenceText}>{segment.text}</Text>
    </View>
  );
}

function CompletedWordCard({ item }: { item: WordUI }) {
  const [showFurigana, setShowFurigana] = useState(false);

  const formattedMeaning = Array.isArray(item.spanish_meaning)
    ? item.spanish_meaning.join(", ")
    : item.spanish_meaning;

  const parsedSentence = item.parsedSentence ?? [];

  return (
    <View style={styles.completedCard}>
      {/* Encabezado: Término, Lectura y Significado */}
      <View style={styles.termHeader}>
        <View style={styles.termGroup}>
          {item.term_reading ? (
            <Text style={styles.termReadingText}>{item.term_reading}</Text>
          ) : null}
          <Text style={styles.completedTermText}>{item.term}</Text>
        </View>

        {formattedMeaning ? (
          <Text style={styles.meaningText}>{formattedMeaning}</Text>
        ) : null}
      </View>

      {/* Oración en Japonés */}
      {item.sentence ? (
        <View style={styles.sentenceSection}>
          <View style={styles.sentenceRow}>
            <View style={styles.sentenceContainer}>
              {parsedSentence.map((segment, index) => (
                <FuriganaText
                  key={index}
                  segment={segment}
                  showFurigana={showFurigana}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowFurigana(!showFurigana)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showFurigana ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#E4CBFF"
              />
            </TouchableOpacity>
          </View>

          {showFurigana && item.spanish_sentence ? (
            <View style={styles.spanishSentenceContainer}>
              <Text style={styles.spanishSentenceText}>
                {item.spanish_sentence}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Sección de Tags (Etiquetas) */}
      {item.tags && item.tags.length > 0 ? (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function WordListScreen() {
  const {
    currentList,
    activeTab,
    setActiveTab,
    pendingCount,
    completedCount,
    isLoading,
    isRefreshing,
    error,
    refreshWords,
  } = useWordsListViewModel();

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#E4CBFF" />
        <Text style={styles.loadingText}>Cargando palabras...</Text>
      </View>
    );
  }

  const isPending = activeTab === "pending";

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, isPending && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, isPending && styles.activeTabText]}>
            Pendientes ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, !isPending && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, !isPending && styles.activeTabText]}>
            Completadas ({completedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        key={isPending ? "pending-grid-2col" : "completed-list-1col"}
        data={currentList}
        keyExtractor={(item) => item.id}
        numColumns={isPending ? 2 : 1}
        columnWrapperStyle={isPending ? styles.rowWrapper : undefined}
        // ESPACIADO CLAVE: Evita que la última tarjeta quede oculta detrás de la imagen flotante
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) =>
          isPending ? (
            <View style={styles.gridCard}>
              {item.term_reading ? (
                <Text style={styles.pendingReadingText}>
                  {item.term_reading}
                </Text>
              ) : null}
              <Text style={styles.pendingTermText}>{item.term}</Text>
            </View>
          ) : (
            <CompletedWordCard item={item} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshWords}
            colors={["#E4CBFF"]}
            tintColor="#E4CBFF"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {isPending
              ? "No hay palabras pendientes."
              : "No hay palabras completadas."}
          </Text>
        }
      />

      {/* IMAGEN FLOTANTE DEL PERSONAJE */}
      <Image
        // Reemplaza esta ruta con la ubicación real de tu imagen (ej. require('../../assets/personaje.png'))
        source={require("@/assets/list.png")}
        style={styles.characterImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0F0C1B" },
  centered: { justifyContent: "center", alignItems: "center" },

  // Margen inferior extra para que el scroll termine antes de la imagen flotante
  listContent: {
    paddingBottom: 100,
  },

  // Estilo de la imagen del personaje flotando abajo a la derecha
  characterImage: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 90,
    height: 90,
    zIndex: 99, // Se asegura de estar encima de todas las cards
    pointerEvents: "none", // Permite hacer clic "a través" de la imagen si se desea
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#1E1A2D",
    padding: 4,
    borderWidth: 1,
    borderColor: "#2A2238",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#E4CBFF",
  },
  tabText: {
    fontWeight: "600",
    color: "#9CA3AF",
  },
  activeTabText: {
    color: "#0F0C1B",
  },

  // Grid Layout (Pendientes)
  rowWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gridCard: {
    flex: 0.48,
    backgroundColor: "#1E1A2D",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2238",
    minHeight: 90,
  },
  pendingReadingText: {
    fontSize: 13,
    color: "#E4CBFF",
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
  pendingTermText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },

  // Tarjeta Completadas
  completedCard: {
    backgroundColor: "#1E1A2D",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2238",
  },
  termHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2238",
    paddingBottom: 10,
    marginBottom: 10,
  },
  termGroup: {
    alignItems: "flex-start",
  },
  termReadingText: {
    fontSize: 13,
    color: "#E4CBFF",
    fontWeight: "600",
    marginBottom: 2,
  },
  completedTermText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  meaningText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#A78BFA",
    maxWidth: "50%",
    textAlign: "right",
  },

  // Seccion Oracion
  sentenceSection: {
    marginTop: 4,
  },
  sentenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    marginRight: 8,
    alignItems: "flex-end",
  },
  furiganaSegmentContainer: {
    alignItems: "center",
    marginRight: 1,
  },
  furiganaReading: {
    fontSize: 10,
    color: "#E4CBFF",
    fontWeight: "600",
    marginBottom: -2,
  },
  sentenceText: {
    fontSize: 16,
    color: "#F3E8FF",
  },

  eyeButton: {
    padding: 4,
    marginBottom: 2,
  },

  // Traducción en español
  spanishSentenceContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2A2238",
    backgroundColor: "#161224",
    padding: 10,
    borderRadius: 8,
  },
  spanishSentenceText: {
    fontSize: 14,
    color: "#D1D5DB",
    fontStyle: "italic",
  },

  // Tags / Etiquetas
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#2A2238",
  },
  tagBadge: {
    backgroundColor: "#251F38",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B2E58",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E4CBFF",
  },

  empty: { textAlign: "center", marginTop: 40, color: "#6B7280" },
  errorText: { color: "#F87171", marginBottom: 10, textAlign: "center" },
  loadingText: { marginTop: 10, color: "#9CA3AF" },
});
