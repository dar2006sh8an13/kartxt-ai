import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, ChevronRight, Copy, Menu, Mic, Moon, PanelLeftClose, Plus, Search, Sparkles, Square, Sun, Volume2, X } from 'lucide-react'
import { askAI, type ChatMessage, type ResponseLanguage } from './api'
import { features } from './features'

type SpeechRecognitionResultEvent = Event & {
  resultIndex: number
  results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } }
}

type SpeechRecognitionErrorEvent = Event & {
  error?: string
}

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

function App() {
  const [activeId, setActiveId] = useState('teacher')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState<ResponseLanguage>('English')
  const [dark, setDark] = useState(false)
  const [sidebar, setSidebar] = useState(true)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [listening, setListening] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [speechRate, setSpeechRate] = useState(1)
  const [speaking, setSpeaking] = useState(false)
  const recognition = useRef<SpeechRecognitionInstance | null>(null)
  const voiceTranscript = useRef('')
  const keepListening = useRef(false)
  const active = useMemo(() => features.find((feature) => feature.id === activeId) ?? features[0], [activeId])

  useEffect(() => {
    return () => {
      keepListening.current = false
      recognition.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  function selectFeature(id: string) {
    keepListening.current = false
    recognition.current?.stop()
    window.speechSynthesis?.cancel()
    setListening(false)
    setSpeaking(false)
    setActiveId(id)
    setMessages([])
    setInput('')
    setNotice('')
  }

  function speakMessage(message: string) {
    if (!('speechSynthesis' in window)) {
      setNotice('Spoken replies are not supported in this browser.')
      return
    }
    window.speechSynthesis.cancel()
    const speech = new SpeechSynthesisUtterance(message)
    speech.lang = language === 'Kannada' ? 'kn-IN' : 'en-IN'
    speech.rate = speechRate
    speech.onstart = () => setSpeaking(true)
    speech.onend = () => setSpeaking(false)
    speech.onerror = () => {
      setSpeaking(false)
      setNotice('The spoken reply could not be played. Check your device volume and browser audio settings.')
    }
    window.speechSynthesis.speak(speech)
  }

  function stopVoice() {
    keepListening.current = false
    recognition.current?.stop()
    window.speechSynthesis?.cancel()
    setListening(false)
    setSpeaking(false)
  }

  async function submit() {
    const content = input.trim()
    if (!content || loading) return
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    setNotice('')
    try {
      const result = await askAI(active.id, next, { instruction: active.prompt }, language)
      setMessages([...next, { role: 'assistant', content: result.message }])
      if (active.id === 'voice-teacher' && autoSpeak) {
        speakMessage(result.message)
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleListening() {
    if (listening) {
      keepListening.current = false
      recognition.current?.stop()
      return
    }
    const speechWindow = window as SpeechWindow
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setNotice('Voice input is not supported in this browser. Use Chrome or Edge, or type your question.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice('Microphone access is unavailable here. Open the app at http://localhost:5173 in Chrome or Edge.')
      return
    }
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true })
      microphone.getTracks().forEach((track) => track.stop())
    } catch (error) {
      const reason = error instanceof DOMException ? error.name : ''
      if (reason === 'NotAllowedError' || reason === 'PermissionDeniedError') {
        setNotice('Microphone permission is blocked. Click the lock icon beside the address, set Microphone to Allow, then reload the page.')
      } else if (reason === 'NotFoundError' || reason === 'DevicesNotFoundError') {
        setNotice('No microphone was found. Connect a microphone and select it in Windows sound settings.')
      } else {
        setNotice('The microphone could not be opened. Close other apps using it and try again.')
      }
      return
    }
    const instance = new SpeechRecognition()
    instance.lang = language === 'Kannada' ? 'kn-IN' : 'en-IN'
    instance.continuous = true
    instance.interimResults = true
    instance.onresult = (event) => {
      let transcript = ''
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index]?.[0]?.transcript ?? ''
      }
      if (transcript.trim()) {
        voiceTranscript.current = transcript.trim()
        setInput(voiceTranscript.current)
        setNotice('')
      }
    }
    instance.onerror = (event) => {
      if (event.error === 'no-speech' && keepListening.current) return
      setListening(false)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setNotice('Microphone permission was denied. Allow microphone access for this site in your browser settings, then try again.')
      } else if (event.error === 'no-speech') {
        setNotice('No speech was detected. Check your microphone and try again.')
      } else if (event.error === 'audio-capture') {
        setNotice('No microphone was found. Connect a microphone and check that it is not being used by another app.')
      } else {
        setNotice('Voice input could not start. Use Chrome or Edge on localhost, check microphone permissions, and try again.')
      }
    }
    instance.onend = () => {
      if (!keepListening.current) {
        setListening(false)
        return
      }
      window.setTimeout(() => {
        if (keepListening.current) {
          try {
            instance.start()
          } catch {
            setListening(false)
            setNotice('Voice input could not restart. Click the microphone and try again.')
          }
        }
      }, 250)
    }
    recognition.current = instance
    voiceTranscript.current = ''
    setNotice('')
    keepListening.current = true
    setListening(true)
    try {
      instance.start()
    } catch {
      keepListening.current = false
      setListening(false)
      setNotice('Voice input could not start. Check microphone permissions and try again.')
    }
  }

  return <div className={dark ? 'app dark' : 'app'}>
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><div><strong>KarTxt <span>AI</span></strong><small>Your Intelligent Karnataka Learning Assistant</small></div></div>
      <div className="top-actions"><div className="search"><Search size={16} /><input placeholder="Search features..." /></div><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><div className="avatar">DP</div></div>
    </header>
    <div className="shell">
      {sidebar && <aside className="sidebar"><div className="sidebar-head"><span>LEARNING SPACE</span><button className="icon-btn" onClick={() => setSidebar(false)} aria-label="Collapse navigation"><PanelLeftClose size={17} /></button></div><button className="new-chat" onClick={() => setMessages([])}><Plus size={17} /> New conversation</button><nav>{features.map((feature) => { const Icon = feature.icon; return <button key={feature.id} className={feature.id === active.id ? 'nav-item active' : 'nav-item'} onClick={() => selectFeature(feature.id)}><Icon size={18} /><span>{feature.title}</span><ChevronRight className="nav-chevron" size={15} /></button> })}</nav><div className="sidebar-footer"><div className="support-card"><span className="support-icon"><Sparkles size={17} /></span><div><strong>Need help?</strong><small>Ask KarTxt anything</small></div></div></div></aside>}
      {!sidebar && <button className="open-sidebar icon-btn" onClick={() => setSidebar(true)} aria-label="Open navigation"><Menu size={20} /></button>}
      <main className="main"><div className="breadcrumb">Learning space <ChevronRight size={14} /> <span>{active.title}</span></div><section className="hero"><div className="feature-icon" style={{ background: `${active.accent}18`, color: active.accent }}><active.icon size={25} /></div><div><h1>{active.title}</h1><p>{active.description}</p></div><div className="hero-controls"><label>Response language<select value={language} onChange={(event) => setLanguage(event.target.value as ResponseLanguage)}><option value="English">English</option><option value="Kannada">ಕನ್ನಡ (Kannada)</option></select></label></div></section><div className="workspace"><section className="chat-card"><div className="chat-head"><div><strong>Let’s learn together</strong><small>{active.id === 'voice-teacher' ? 'Speak or type a question to get started' : 'Ask a question to get started'}</small></div><button className="clear-btn" onClick={() => setMessages([])}><X size={15} /> Clear</button></div><div className="chat-body">{messages.length === 0 && <div className="empty"><div className="empty-orb"><Sparkles size={28} /></div><h2>What would you like to learn?</h2><p>{active.prompt} Ask in English or Kannada.</p><div className="suggestions"><button onClick={() => setInput('Explain this topic with a simple example')}>Explain a topic <ArrowUp size={14} /></button><button onClick={() => setInput('Give me a practice question')}>Practice with me <ArrowUp size={14} /></button></div></div>}{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><div className="message-label">{message.role === 'user' ? 'You' : 'KarTxt AI'}</div><div className="message-content">{message.content}</div>{message.role === 'assistant' && <><button className="copy-btn" onClick={() => navigator.clipboard?.writeText(message.content)}><Copy size={13} /> Copy</button>{active.id === 'voice-teacher' && <button className="copy-btn" onClick={() => speakMessage(message.content)}><Volume2 size={13} /> Speak</button>}</>}</div>)}{loading && <div className="message assistant"><div className="message-label">KarTxt AI</div><div className="typing"><i /><i /><i /></div></div>}{notice && <div className="error">{notice}</div>}</div><div className="composer"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }} placeholder={`Ask ${active.title} anything...`} rows={1} />{active.id === 'voice-teacher' && <button className={listening ? 'voice-btn listening' : 'voice-btn'} onClick={toggleListening} aria-label={listening ? 'Stop listening' : 'Start voice input'}>{listening ? <Square size={16} /> : <Mic size={17} />}</button>}<button className="send" onClick={() => void submit()} disabled={!input.trim() || loading} aria-label="Send"><ArrowUp size={18} /></button><small>{active.id === 'voice-teacher' ? 'Click the microphone, speak, then send your question' : 'Enter to send · Shift + Enter for a new line'}</small></div></section><aside className="context-card"><div className="context-title"><span>QUICK CONTEXT</span><span className="status"><i /> {active.id === 'voice-teacher' && listening ? 'Listening' : speaking ? 'Speaking' : 'Ready'}</span></div><div className="context-item"><span>Current mode</span><strong>{active.title}</strong></div><div className="context-item"><span>Response language</span><strong>{language === 'Kannada' ? 'ಕನ್ನಡ (Kannada)' : language}</strong></div>{active.id === 'voice-teacher' && <div className="voice-controls"><div className="voice-controls-head"><span>VOICE CONTROLS</span>{(speaking || listening) && <button className="stop-speaking" onClick={stopVoice}>Stop voice</button>}</div><label className="toggle-row"><input type="checkbox" checked={autoSpeak} onChange={(event) => setAutoSpeak(event.target.checked)} /><span>Speak replies automatically</span></label><label className="rate-control">Speech speed <strong>{speechRate.toFixed(1)}x</strong><input type="range" min="0.6" max="1.5" step="0.1" value={speechRate} onChange={(event) => setSpeechRate(Number(event.target.value))} /></label></div>}<div className="context-item"><span>Learning streak</span><strong>3 days <span className="streak">+1</span></strong></div><div className="tip"><Sparkles size={16} /><div><strong>Learning tip</strong><p>Ask follow-up questions whenever something is unclear. That’s how real learning happens.</p></div></div></aside></div><footer>KarTxt AI can make mistakes. Check important information with your teacher or trusted sources.</footer></main>
    </div>
  </div>
}

export default App
