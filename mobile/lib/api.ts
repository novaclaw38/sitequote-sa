import Constants from "expo-constants";

export function getApiBase(): string {
  const url =
    process.env.EXPO_PUBLIC_API_URL ??
    Constants.expoConfig?.extra?.apiUrl ??
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export type QuoteResponse = {
  quote: {
    id: string;
    jobTitle: string;
    shareToken?: string;
  };
};

export async function createQuoteFromAudio(
  uri: string,
  labourRateZar: number,
): Promise<QuoteResponse> {
  const formData = new FormData();
  formData.append("audio", {
    uri,
    name: "voice-note.m4a",
    type: "audio/m4a",
  } as unknown as Blob);
  formData.append("labourRateZar", String(labourRateZar));
  formData.append("markupPercent", "15");

  const res = await fetch(`${getApiBase()}/api/quotes`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to create quote");
  }
  return data;
}

export async function createQuoteFromTranscript(
  transcript: string,
  labourRateZar: number,
): Promise<QuoteResponse> {
  const res = await fetch(`${getApiBase()}/api/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transcript,
      labourRateZar,
      markupPercent: 15,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to create quote");
  }
  return data;
}
