import type { ChatMessage as ChatMessageType } from '../types'

type ChatMessageProps = {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 border-3 border-black ${
          isUser
            ? 'bg-yellow-400 shadow-[4px_4px_0_black]'
            : 'bg-white shadow-[4px_4px_0_black]'
        }`}
      >
        <p className="text-sm font-medium leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}