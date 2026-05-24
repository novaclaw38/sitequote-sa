import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createQuoteFromAudio,
  createQuoteFromTranscript,
  getApiBase,
} from "@/lib/api";

const LABOUR_DEFAULT = 350;

export default function RecordScreen() {
  const router = useRouter();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [recording, setRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [labourRate, setLabourRate] = useState(String(LABOUR_DEFAULT));
  const [transcript, setTranscript] = useState("");

  const start = async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Microphone permission required");
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    recordingRef.current = rec;
    setRecording(true);
    setUri(null);
  };

  const stop = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    await rec.stopAndUnloadAsync();
    setUri(rec.getURI());
    setRecording(false);
    recordingRef.current = null;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const rate = parseFloat(labourRate) || LABOUR_DEFAULT;
      let result;
      if (transcript.trim()) {
        result = await createQuoteFromTranscript(transcript.trim(), rate);
      } else if (uri) {
        result = await createQuoteFromAudio(uri, rate);
      } else {
        Alert.alert("Record audio or enter demo text");
        setLoading(false);
        return;
      }
      const base = getApiBase();
      const quoteUrl = `${base}/quotes/${result.quote.id}`;
      Alert.alert("Quote ready", result.quote.jobTitle, [
        {
          text: "View quote",
          onPress: () => {
            router.push(`/quote/${result.quote.id}`);
          },
        },
        {
          text: "Open browser",
          onPress: () => Linking.openURL(quoteUrl),
        },
        { text: "OK" },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to generate quote",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Site voice note</Text>
      <Text style={styles.sub}>
        Describe materials, m², labour days, and access issues.
      </Text>

      <Pressable
        style={[styles.recordBtn, recording && styles.recordBtnActive]}
        onPress={recording ? stop : start}
        disabled={loading}
      >
        <Text style={styles.recordBtnText}>
          {recording ? "Stop" : "Record"}
        </Text>
      </Pressable>

      {uri && <Text style={styles.saved}>Recording saved ✓</Text>}

      <Text style={styles.label}>Labour rate (R/hour)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={labourRate}
        onChangeText={setLabourRate}
      />

      <Text style={styles.label}>Or demo transcript</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        multiline
        placeholder="Bathroom reno, 8m² tiles..."
        placeholderTextColor="#52525b"
        value={transcript}
        onChangeText={setTranscript}
      />

      <Pressable
        style={styles.submit}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#09090b" />
        ) : (
          <Text style={styles.submitText}>Generate quote</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#09090b" },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  sub: { color: "#a1a1aa", marginTop: 8, marginBottom: 24 },
  recordBtn: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
  },
  recordBtnActive: { backgroundColor: "#dc2626" },
  recordBtnText: { fontWeight: "700", color: "#09090b" },
  saved: { textAlign: "center", color: "#22c55e", marginTop: 12 },
  label: { color: "#71717a", marginTop: 20, marginBottom: 6 },
  input: {
    backgroundColor: "#18181b",
    color: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  submit: {
    marginTop: 24,
    backgroundColor: "#f59e0b",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: { fontWeight: "700", color: "#09090b", fontSize: 16 },
});
