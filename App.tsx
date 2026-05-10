
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, MessageRole, MessagePart } from './types';
import { getGeminiResponseStream } from './services/geminiService';
import { SendIcon, PaperclipIcon, TrashIcon, PlusIcon, DoubleCheck } from './components/Icons';
import Login from './components/Login';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('knchat_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }

    const savedMessages = localStorage.getItem('knchat_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: '1',
          role: MessageRole.ASSISTANT,
          parts: [{ text: "Assalamu Alaikum! I'm KNChat. WhatsApp jese baat karein? Main aapki help karne ke liye taiyar hu! 😊" }],
          timestamp: Date.now()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('knchat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result as string;
        const data = base64.split(',')[1];
        setSelectedImage({ data, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || isTyping) return;

    const userMessageParts: MessagePart[] = [];
    if (selectedImage) {
      userMessageParts.push({ inlineData: selectedImage });
    }
    if (inputValue.trim()) {
      userMessageParts.push({ text: inputValue });
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      parts: userMessageParts,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const assistantMessageId = (Date.now() + 1).toString();
      let currentResponseText = "";

      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: MessageRole.ASSISTANT,
          parts: [{ text: "" }],
          timestamp: Date.now()
        }
      ]);

      await getGeminiResponseStream(updatedMessages, (text) => {
        currentResponseText = text;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, parts: [{ text: currentResponseText }] }
            : msg
        ));
      });

    } catch (error) {
      console.error("Failed to get AI response", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: MessageRole.ASSISTANT,
          parts: [{ text: "Sorry, network error. Please try again." }],
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: MessageRole.ASSISTANT,
      parts: [{ text: "Chat history cleared." }],
      timestamp: Date.now()
    }]);
    localStorage.removeItem('knchat_messages');
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
    localStorage.setItem('knchat_user', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('knchat_user');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-[#262626]">
      {/* Header (Instagram DM Style) */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-[#efefef]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer">
             <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
             <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border border-[#efefef]">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Instagram" alt="AI Avatar" className="w-full h-full object-cover" />
             </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-[15px] leading-tight">Instagram AI</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-[12px] text-[#8e8e8e]">Active now</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={clearChat} title="Clear Chat" className="p-1 hover:bg-gray-50 rounded-full transition-colors">
            <TrashIcon className="w-6 h-6 text-[#262626]" />
          </button>
          <button onClick={handleLogout} title="Logout" className="p-1 hover:bg-gray-50 rounded-full transition-colors text-red-500">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col gap-3"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`relative max-w-[75%] px-4 py-2.5 ${
                msg.role === MessageRole.USER 
                  ? 'bg-[#0095f6] text-white rounded-[22px] rounded-br-[4px]' 
                  : 'bg-[#efefef] text-[#262626] rounded-[22px] rounded-bl-[4px]'
              }`}
            >
              {/* Message Content */}
              {msg.parts.map((part, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  {part.inlineData && (
                    <div className="rounded-xl overflow-hidden my-1">
                      <img 
                        src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                        alt="Image" 
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                  {part.text && (
                    <p className="text-[15px] leading-[1.4] whitespace-pre-wrap">
                      {part.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#efefef] px-4 py-3 rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-duration:0.8s]" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </main>

      {/* Input Area (Instagram Style) */}
      <footer className="relative z-10 px-4 py-4 bg-white border-t border-[#dbdbdb]">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center gap-2 border border-[#dbdbdb] rounded-full px-4 py-2 bg-white focus-within:ring-1 focus-within:ring-gray-200 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-[#262626] hover:bg-gray-100 rounded-full transition-colors"
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Message..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-[15px] py-1 resize-none placeholder:text-[#8e8e8e] max-h-32 text-[#262626]"
            />

            {(inputValue.trim() || selectedImage) ? (
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="text-[#0095f6] font-semibold text-[15px] px-2 hover:opacity-80 transition-opacity"
              >
                Send
              </button>
            ) : (
              <div className="flex items-center gap-3 text-[#262626] px-1">
                <PlusIcon className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity" />
                <SendIcon className="w-6 h-6 rotate-45 cursor-pointer hover:opacity-70 transition-opacity" />
              </div>
            )}
          </div>

          {selectedImage && (
            <div className="absolute bottom-full left-0 mb-4 p-2 bg-white rounded-xl shadow-lg border border-[#dbdbdb] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                <img 
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl-lg hover:bg-black/70"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-[#8e8e8e] pr-2">Image attached</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
