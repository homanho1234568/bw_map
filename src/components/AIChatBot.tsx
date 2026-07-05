import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, MapPin, Gift, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatBotProps {
  onFocusBooth: (boothId: string, hallId: string) => void;
  allBooths: Array<{ id: string; name: string; hall: string; code: string }>;
}

export default function AIChatBot({ onFocusBooth, allBooths }: AIChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: '哈囉！我是您的 BW 2026 AI 智能導覽小電視 📺！\n\n我可以幫您快速尋找攤位、查詢熱門無料（免費贈品）的領取條件、或是為您推薦一條超讚的逛展行走路線喔！\n\n您想先查詢哪一種類型的活動？例如：\n* 「我想拿《崩壞：星穹鐵道》的無料，要去哪裡拿？」\n* 「推薦一條適合二次元玩家的集章路線！」\n* 「虛擬樂園跟 V圈都在哪個館？有什麼攤位？」'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setErrorMessage(null);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(1), // omit the initial welcome message from LLM history
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned code ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || '無法連線到 AI 導覽助手，請確認您的 API 金鑰已設定。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: '對話已重設！有任何關於 BW 2026 攤位與無料領取的疑難雜症，隨時考考我吧！🌟'
      }
    ]);
    setErrorMessage(null);
  };

  // Custom rich text / markdown parser
  const renderMessageText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // Check for bullet points
      const isBullet = line.startsWith('* ') || line.startsWith('- ');
      const content = isBullet ? line.substring(2) : line;

      // Parse custom booth links: [Name](booth:id)
      const parts: React.ReactNode[] = [];
      const regex = /\[([^\]]+)\]\(booth:([^)]+)\)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const matchIndex = match.index;
        // Text before match
        if (matchIndex > lastIndex) {
          parts.push(content.substring(lastIndex, matchIndex));
        }

        const boothName = match[1];
        const boothId = match[2];

        // Search for the booth to find its hall
        const booth = allBooths.find(b => b.id === boothId);
        
        parts.push(
          <button
            key={matchIndex}
            onClick={() => {
              if (booth) {
                onFocusBooth(booth.id, booth.hall);
              } else {
                // If ID is not found, try finding by name
                const foundByName = allBooths.find(b => b.name.includes(boothName));
                if (foundByName) {
                  onFocusBooth(foundByName.id, foundByName.hall);
                }
              }
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm my-0.5 mx-0.5 shrink-0 align-middle cursor-pointer font-bold"
            title="在地圖中飛入定位此攤位"
          >
            <MapPin className="w-3 h-3 text-zinc-500" />
            <span>{boothName}</span>
          </button>
        );

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      // Parse inline strong bold **text**
      const processedParts = parts.map((part, pIdx) => {
        if (typeof part !== 'string') return part;

        const strongRegex = /\*\*([^*]+)\*\*/g;
        const subParts: React.ReactNode[] = [];
        let subLastIndex = 0;
        let subMatch;

        while ((subMatch = strongRegex.exec(part)) !== null) {
          if (subMatch.index > subLastIndex) {
            subParts.push(part.substring(subLastIndex, subMatch.index));
          }
          subParts.push(
            <strong key={subMatch.index} className="text-black font-extrabold bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">
              {subMatch[1]}
            </strong>
          );
          subLastIndex = strongRegex.lastIndex;
        }

        if (subLastIndex < part.length) {
          subParts.push(part.substring(subLastIndex));
        }

        return <span key={pIdx}>{subParts}</span>;
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 mb-1 text-zinc-700 leading-relaxed text-xs">
            {processedParts}
          </li>
        );
      }

      return (
        <p key={lineIdx} className={`text-xs leading-relaxed text-zinc-700 ${line.trim() === '' ? 'h-3' : 'mb-2'}`}>
          {processedParts}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full min-h-[450px] max-h-[85vh] lg:max-h-none bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* Bot Header */}
      <div className="px-5 py-4 bg-white border-b border-zinc-200/80 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-black flex items-center gap-1.5 font-display">
              <span>AI 智能導覽助手</span>
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium">BW 2026 專屬小電視導遊</span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 text-zinc-400 hover:text-black hover:bg-zinc-50 transition-all cursor-pointer bg-white"
          title="清除聊天紀錄"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs shadow-none ${
                msg.role === 'user'
                  ? 'bg-zinc-900 text-white rounded-tr-none'
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none'
              }`}
            >
              <div className="prose prose-zinc max-w-none">
                {msg.role === 'assistant' ? (
                  <ul className="space-y-1 list-none p-0 m-0">
                    {renderMessageText(msg.text)}
                  </ul>
                ) : (
                  <p className="m-0 leading-relaxed font-semibold whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 rounded-xl rounded-tl-none p-4 shadow-none max-w-[80%] flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-[bounce_1s_infinite_100ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-[bounce_1s_infinite_250ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-[bounce_1s_infinite_400ms]" />
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">小電視正在翻箱倒櫃查詢無料中...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">連線異常</p>
              <p className="text-[10px] text-red-500 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-zinc-200 flex gap-2 shrink-0">
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="詢問無料或推薦路線... (如: 原神無料)"
          className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-black rounded-lg px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:outline-none transition-colors font-medium focus:ring-1 focus:ring-black"
          disabled={isLoading}
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white font-bold transition-all disabled:opacity-40 disabled:hover:bg-black cursor-pointer flex items-center justify-center shrink-0 border border-black"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
