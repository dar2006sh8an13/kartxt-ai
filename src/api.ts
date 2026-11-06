export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ResponseLanguage = 'English' | 'Kannada'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function askAI(feature: string, messages: ChatMessage[], context: Record<string, string>, language: ResponseLanguage) {
  const response = await fetch(`${API_URL}/api/ai/${feature}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context, language }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? 'The AI service is unavailable.')
  }
  return response.json() as Promise<{ message: string; model: string }>
}
