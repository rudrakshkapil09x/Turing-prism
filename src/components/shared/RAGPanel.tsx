import React, { useState, useRef, useEffect } from 'react'
import { askRAG, type RagUnit } from '../../engine/rag'
import { saveToArchive } from '../../engine/archive'
import type { SimulatorId } from '../../App'

interface RAGPanelProps {
  simulatorId: SimulatorId
  unit: RagUnit
  onLoadAutomata: (type: string, payload: any) => void
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  payloadType?: string
  payload?: any
}

export default function RAGPanel({ simulatorId, unit, onLoadAutomata }: RAGPanelProps) {
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "I'm the Prism AI assistant. Describe any automaton or language in natural language and I'll generate it for you. Try: \"Make a DFA that accepts strings ending in abb\"." }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isExpanded) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isExpanded])

  const handleSend = async () => {
    if (!input.trim() || isThinking) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setIsThinking(true)
    
    try {
      const response = await askRAG(unit, userMsg)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: response.message,
        payloadType: response.type,
        payload: response.payload,
      }])
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Error connecting to AI: ${e.message}. Please check your API key.`
      }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="mt-16 fade-up" style={{ animationDelay: '0.45s' }}>
      {/* Section Divider + Toggle */}
      <button
        onClick={() => setIsExpanded(e => !e)}
        className="w-full flex items-center gap-4 mb-0 group cursor-pointer py-2"
      >
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined transition-colors duration-300"
            style={{ fontSize: '18px', color: 'var(--sim-accent, #7b61ff)' }}
          >
            smart_toy
          </span>
          <div className="flex flex-col items-start">
            <span className="font-label text-[10px] uppercase tracking-[0.5em] transition-colors duration-300" style={{ color: 'var(--sim-accent, #7b61ff)' }}>
              Prism AI
            </span>
            <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/30">
              Automata Forge — Natural Language Engine
            </span>
          </div>
        </div>
        <div
          className="flex-1 h-px transition-all duration-500"
          style={{ background: isExpanded ? 'linear-gradient(to right, var(--sim-accent, #7b61ff)30, transparent)' : 'rgba(255,255,255,0.05)' }}
        />
        <span
          className="text-on-surface-variant/30 text-xs transition-all duration-300 group-hover:text-lavender/60"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
        >
          ▾
        </span>
      </button>

      {/* Expandable Chat Interface */}
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight: isExpanded ? '600px' : '0px',
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? 'translateY(0)' : 'translateY(-8px)',
        }}
      >
        <div
          className="mt-4 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(12,12,16,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--sim-accent, #7b61ff)10`,
          }}
        >
          {/* Messages */}
          <div className="p-6 space-y-4 max-h-72 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'assistant' && (
                  <span className="font-label text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/30 ml-1">
                    Prism AI
                  </span>
                )}
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm font-body leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm'
                      : 'bg-white/[0.04] text-cream/90 rounded-tl-sm border border-white/[0.06]'
                  }`}
                  style={msg.role === 'user' ? {
                    background: 'var(--sim-accent, #7b61ff)12',
                    border: '1px solid var(--sim-accent, #7b61ff)25',
                    color: 'var(--sim-accent-light, #c9bfff)',
                  } : undefined}
                >
                  {msg.text}
                </div>
                {msg.payload && msg.payloadType && msg.payloadType !== 'text' && (
                  <button
                    onClick={() => {
                      onLoadAutomata(msg.payloadType!, msg.payload)
                      saveToArchive(simulatorId, msg.text || 'Imported via AI Assistant', msg.payload, msg.payloadType!)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                    style={{
                      background: 'var(--sim-accent, #7b61ff)14',
                      border: '1px solid var(--sim-accent, #7b61ff)35',
                      color: 'var(--sim-accent-light, #c9bfff)',
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Load {msg.payloadType.toUpperCase()} into Engine
                  </button>
                )}
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex items-start gap-2">
                <div className="p-4 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--sim-accent, #7b61ff)', animationDelay: `${delay}ms`, opacity: 0.7 }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Row */}
          <div
            className="px-6 pb-6 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex gap-3 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="e.g. 'DFA accepting even number of zeros' or 'NFA for a*b+'"
                className="flex-1 bg-white/[0.04] rounded-xl py-3 px-5 text-sm text-cream font-body focus:outline-none transition-all placeholder:text-on-surface-variant/25"
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--sim-accent, #7b61ff)50')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 cursor-pointer hover:scale-105"
                style={{
                  background: 'var(--sim-accent, #7b61ff)20',
                  border: '1px solid var(--sim-accent, #7b61ff)40',
                  color: 'var(--sim-accent-light, #c9bfff)',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </div>
            <p className="text-center mt-3 text-[9px] font-label uppercase tracking-[0.25em] text-on-surface-variant/25">
              True RAG AI Engine · Powered by Gemini
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
