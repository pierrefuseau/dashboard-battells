import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User } from 'lucide-react'
import { initialMessages, mockResponses, questionPills } from '../mockData'
import type { ChatMessage } from '../mockData'

let responseIndex = 0

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  function addUserMessage(text: string) {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = mockResponses[responseIndex % mockResponses.length]
      responseIndex++
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, aiMsg])
    }, 1500)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    addUserMessage(input.trim())
  }

  function handlePillClick(question: string) {
    addUserMessage(question)
  }

  return (
    <div className="card flex flex-col h-[calc(100vh-180px)]">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-[var(--radius-card)] px-4 py-3 ${
                  msg.role === 'assistant'
                    ? 'bg-white border border-border border-l-[3px] border-l-primary'
                    : 'bg-primary-50'
                }`}
              >
                <p className="font-[var(--font-satoshi)] text-sm text-text-primary leading-relaxed">
                  {msg.content}
                </p>
                <span className="font-[var(--font-satoshi)] text-[11px] text-text-tertiary mt-1.5 block">
                  {msg.timestamp}
                </span>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mt-1">
                  <User size={16} className="text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-border border-l-[3px] border-l-primary rounded-[var(--radius-card)] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Question pills */}
      <div className="px-6 pb-2 flex gap-2 flex-wrap">
        {questionPills.map((pill) => (
          <button
            key={pill.label}
            type="button"
            onClick={() => handlePillClick(pill.question)}
            disabled={isTyping}
            className="px-3 py-1.5 rounded-full bg-primary-50 text-primary text-xs font-[var(--font-satoshi)] font-medium
                       transition-all duration-200 hover:bg-primary-100 hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose une question sur tes stats..."
          disabled={isTyping}
          className="flex-1 h-11 px-4 rounded-[var(--radius-input)] border border-border bg-white
                     font-[var(--font-satoshi)] text-sm text-text-primary placeholder:text-text-tertiary
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-11 h-11 rounded-[var(--radius-button)] bg-primary text-white flex items-center justify-center
                     transition-all duration-200 hover:bg-primary-light hover:shadow-[var(--shadow-button-primary-hover)]
                     active:scale-[0.95] disabled:bg-primary-100 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
