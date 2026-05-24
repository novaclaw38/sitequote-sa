import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { getApiBase } from "@/lib/api";

export default function QuoteWebViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const base = getApiBase();
  const uri = `${base}/quotes/${id}`;

  if (!id) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f59e0b" />
      </View>
    );
  }

  return <WebView source={{ uri }} style={styles.web} />;
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: "#09090b" },
  center: { flex: 1, justifyContent: "center", backgroundColor: "#09090b" },
});
