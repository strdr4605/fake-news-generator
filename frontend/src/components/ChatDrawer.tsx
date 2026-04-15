import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchChat, sendChatMessage } from '../api/client'
import { ChatMessage } from './ChatMessage'
import type { ChatMessage as ChatMessageType } from '../types'

interface ChatDrawerProps {
  articleId: string
  isOpen: boolean
  onToggle: () => void
}

export function ChatDrawer({ articleId, isOpen, onToggle }: ChatDrawerProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: response, isLoading } = useQuery<{ messages: ChatMessageType[] }>({
    queryKey: ['chat', articleId],
    queryFn: () => fetchChat(articleId),
    enabled: isOpen,
  })

  const messages = response?.messages || []

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendChatMessage(articleId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', articleId] })
      setInput('')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !sendMutation.isPending) {
      sendMutation.mutate(input.trim())
    }
  }

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-24 right-4 bg-black text-white border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-black uppercase text-sm z-40 hover:bg-gray-800"
      >
        {isOpen ? 'Close Chat' : 'Chat'}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l-3 border-black transform transition-transform duration-300 z-30 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="border-b-3 border-black p-4">
          <h3 className="font-black uppercase text-lg">Chat</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500 font-bold">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 font-bold">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t-3 border-black p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this article..."
              className="flex-1 border-3 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              disabled={sendMutation.isPending}
            />
            <button
              type="submit"
              disabled={sendMutation.isPending || !input.trim()}
              className="bg-yellow-400 border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-black uppercase text-sm disabled:opacity-50 hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px]"
            >
              {sendMutation.isPending ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
