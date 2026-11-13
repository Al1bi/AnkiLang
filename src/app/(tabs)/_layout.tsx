import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Componente personalizado para el Header centrado
function HeaderTitle({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.headerTitleContainer}>
      <Ionicons
        name={icon}
        size={20}
        color="#E4CBFF"
        style={styles.headerIcon}
      />
      <Text style={styles.headerTitleText}>{title}</Text>
    </View>
  );
}

export default function TabsLayout() {
  // Obtenemos los márgenes seguros del dispositivo (superior, inferior, etc.)
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#161224",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#2A2238",
        },
        tabBarStyle: {
          backgroundColor: "#161224",
          borderTopColor: "#2A2238",
          borderTopWidth: 1,
          // Sumamos dinámicamente el margen seguro inferior a la altura
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#E4CBFF",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Agregar",
          headerTitle: () => (
            <HeaderTitle title="Agregar Palabra" icon="add-circle-outline" />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="list"
        options={{
          title: "Lista",
          headerTitle: () => (
            <HeaderTitle title="Mis Palabras" icon="book-outline" />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transfer"
        options={{
          title: "Transferir",
          headerTitle: () => (
            <HeaderTitle title="Transferencia" icon="swap-horizontal-outline" />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="swap-horizontal-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#251F38",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3B2E58",
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitleText: {
    color: "#F3E8FF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
