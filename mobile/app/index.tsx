import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>SOUTH AFRICA</Text>
      <Text style={styles.title}>SiteQuote</Text>
      <Text style={styles.subtitle}>
        Record a site voice note. Live supplier prices and a VAT-ready quote —
        same engine as the web app.
      </Text>
      <Link href="/record" style={styles.cta}>
        <Text style={styles.ctaText}>New quote</Text>
      </Link>
      <Text style={styles.hint}>
        Set EXPO_PUBLIC_API_URL to your deployed API in .env
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#09090b",
  },
  badge: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  cta: {
    marginTop: 32,
    backgroundColor: "#f59e0b",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#09090b",
    fontSize: 18,
    fontWeight: "700",
  },
  hint: {
    marginTop: 24,
    color: "#52525b",
    fontSize: 12,
  },
});
