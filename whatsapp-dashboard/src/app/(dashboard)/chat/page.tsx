"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Search, User, ArrowLeft, Bot, Power, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [aiActive, setAiActive] = useState<boolean>(true);
  const [isTogglingAi, setIsTogglingAi] = useState<boolean>(false);
  
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch("/api/tenants")
      .then(res => res.json())
      .then(data => {
        setTenants(data);
        if (data.length > 0) setSelectedInstance(data[0].phoneNumberId);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedChat || !selectedInstance) return;
    fetch(`/api/leads/${selectedInstance}/${selectedChat}`)
      .then(res => res.json())
      .then(data => setAiActive(data.aiActive !== false))
      .catch(err => console.error(err));
  }, [selectedChat, selectedInstance]);

  const toggleAi = async () => {
    if (!selectedChat || !selectedInstance) return;
    setIsTogglingAi(true);
    try {
      const res = await fetch(`/api/leads/${selectedInstance}/${selectedChat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiActive: !aiActive })
      });
      if (res.ok) {
        const data = await res.json();
        setAiActive(data.aiActive);
      }
    } catch (e) {
      console.error("Failed to toggle AI", e);
    } finally {
      setIsTogglingAi(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !selectedInstance) return;
    
    setIsSending(true);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: selectedInstance,
          remoteJid: selectedChat,
          text: newMessage
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewMessage("");
        if (data.aiPaused) setAiActive(false);
      } else {
        console.error("Falha ao enviar mensagem");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedInstance) return;
    const fetchMessages = () => {
      fetch(`/api/messages/${selectedInstance}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          setMessages(data);
          setFetchError(null);
        })
        .catch(err => {
          console.error("Polling error:", err);
          setFetchError("Erro ao atualizar mensagens. Tentando novamente...");
        });
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [selectedInstance]);

  // Group messages by remoteJid
  const chatsMap = new Map<string, { pushName: string, lastMessage: any, allMessages: any[] }>();
  messages.forEach(msg => {
    const id = msg.remoteJid;
    if (!chatsMap.has(id)) {
      chatsMap.set(id, { pushName: id.split('@')[0], lastMessage: msg, allMessages: [] });
    }
    
    // Update pushName if it's from the user and not "IA"
    const chat = chatsMap.get(id)!;
    if (!msg.fromMe && msg.pushName && msg.pushName !== "IA") {
        chat.pushName = msg.pushName;
    }
    
    chat.allMessages.push(msg);
  });
  
  // Convert to array and sort by last message time descending
  const chatsList = Array.from(chatsMap.entries()).map(([id, data]) => ({ id, ...data }));
  chatsList.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

  const activeChat = selectedChat ? chatsList.find(c => c.id === selectedChat) : null;

  return (
    <div className="flex flex-col flex-1">
      {fetchError && (
        <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-xs px-4 py-2 flex items-center gap-2">
          <span className="animate-pulse">⚠️</span> {fetchError}
        </div>
      )}
    <div className="flex-1 flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-white overflow-hidden m-0 md:m-4 md:rounded-xl border shadow-sm">
      
      {/* Sidebar - Oculta no mobile se tiver chat selecionado */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r flex-col bg-slate-50 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-600" /> Chats
          </h2>
          <select 
            className="text-sm border rounded p-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto"
            value={selectedInstance}
            onChange={(e) => {
              setSelectedInstance(e.target.value);
              setSelectedChat(null);
            }}
          >
            {tenants.map(t => (
              <option key={t.id} value={t.phoneNumberId}>{t.phoneNumberId}</option>
            ))}
          </select>
        </div>
        
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder="Buscar conversa..." className="pl-9 border p-2 text-sm rounded-md w-full focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatsList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma conversa encontrada nesta instância.</div>
          ) : (
            chatsList.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 border-b cursor-pointer transition-colors flex gap-3 ${selectedChat === chat.id ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}
              >
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate text-slate-800">{chat.pushName}</h3>
                    <span className="text-[10px] text-slate-500">
                      {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area - Oculta no mobile se NÃO tiver chat selecionado */}
      <div className={`flex-1 flex-col bg-[#efeae2] relative ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-white border-b flex items-center gap-3 shadow-sm z-10 sticky top-0">
              <button 
                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate text-slate-800">{activeChat.pushName}</h3>
                <p className="text-xs text-slate-500 truncate">{activeChat.id}</p>
              </div>
              <button 
                onClick={toggleAi}
                disabled={isTogglingAi}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer ${aiActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                title={aiActive ? "Clique para pausar a IA (assumir controle manual)" : "Clique para reativar a IA"}
              >
                <Bot className="h-3.5 w-3.5" />
                {aiActive ? "IA Ativa" : "IA Pausada"}
                <Power className="h-3.5 w-3.5 ml-1 opacity-70" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 pb-20">
              {[...activeChat.allMessages].reverse().map((msg: any) => (
                <div key={msg.id} className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                  {!msg.fromMe && <span className="text-[10px] font-semibold text-slate-500 mb-0.5 ml-1">{activeChat.pushName}</span>}
                  
                  <div className={`max-w-[85%] md:max-w-[70%] rounded-lg p-2.5 md:p-3 text-sm shadow-sm relative pb-6 ${msg.fromMe ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[10px] text-gray-500 absolute bottom-1 right-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Real input area for manual replies */}
            <div className="p-3 bg-[#f0f2f5] flex gap-2 items-center absolute bottom-0 left-0 right-0">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSending) {
                    handleSendMessage();
                  }
                }}
                placeholder="Digite sua mensagem (isso pausará a IA para este cliente)..." 
                className="flex-1 rounded-lg border-none p-2.5 md:p-3 shadow-sm bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                disabled={isSending}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || isSending}
                className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 p-0 rounded-full flex-shrink-0"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <svg viewBox="0 0 24 24" height="20" width="20" preserveAspectRatio="xMidYMid meet" className="" fill="white"><path d="M1.101,21.757L23.8,12.028,1.101,2.3l0.011,7.912,13.623,1.816L1.112,13.845z"></path></svg>}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 p-6 text-center">
            <div className="h-20 w-20 bg-indigo-100/50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-medium text-slate-700 mb-2">WhatsApp AI Live Monitor</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              Selecione uma conversa no painel lateral para visualizar o histórico de mensagens em tempo real.
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
