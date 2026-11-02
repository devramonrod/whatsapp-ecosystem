"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, MessageCircle, Bot, Users, Coins, Zap } from "lucide-react"

export default function DashboardPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tenants")
      .then(res => res.json())
      .then(data => {
        setTenants(data);
        if (data.length > 0) setSelectedInstance(data[0].phoneNumberId);
      })
      .catch(err => console.error(err));

    fetch("/api/metrics")
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedInstance) return;
    const fetchMessages = () => {
      fetch(`/api/messages/${selectedInstance}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error(err));
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedInstance]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Global</h2>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 backdrop-blur border-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">Números Ativos</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-950">{tenants.length > 0 ? tenants.length : "..."}</div>
            <p className="text-xs text-indigo-600/80">Instâncias Inteligentes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Total de Mensagens</CardTitle>
            <MessageCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">{metrics ? metrics.totalMessages : "..."}</div>
            <p className="text-xs text-emerald-600/80">Trafegadas pelo ecossistema</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Uso de Tokens (Est.)</CardTitle>
            <Zap className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950">{metrics ? metrics.totalTokens?.toLocaleString('pt-BR') || '0' : "..."}</div>
            <p className="text-xs text-amber-600/80">Tokens consumidos</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur border-rose-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-900">Custo Estimado (GPT-4o)</CardTitle>
            <Coins className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-950">
              {metrics ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metrics.totalCost || 0) : "..."}
            </div>
            <p className="text-xs text-rose-600/80">Gasto aproximado da API</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-slate-200">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>O cérebro da IA operando em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center min-h-[300px] lg:h-[400px] text-muted-foreground border-2 border-dashed border-indigo-100 m-2 lg:m-4 rounded-xl space-y-6 bg-indigo-50/30 p-4">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
               <Bot className="h-20 w-20 text-indigo-600 relative z-10" />
             </div>
             <div className="text-center space-y-2">
               <h3 className="text-2xl font-bold text-slate-800">Sistemas Online</h3>
               <p className="px-2 lg:px-12 text-slate-500 text-sm md:text-base">A escuta ativa de webhooks, roteamento e IA estão 100% integrados. Navegue até "Live Chat Monitor" no menu lateral para visualizar os chats individuais de forma estruturada.</p>
             </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 border-slate-200">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <CardTitle>Feed de Mensagens</CardTitle>
              <select 
                className="text-sm border border-slate-200 rounded p-1.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                value={selectedInstance}
                onChange={(e) => setSelectedInstance(e.target.value)}
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.phoneNumberId}>{t.phoneNumberId}</option>
                ))}
              </select>
            </div>
            <CardDescription>Últimas interações processadas (Visão Global)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] lg:h-[400px] overflow-y-auto p-4 m-2 lg:m-4 bg-slate-50 rounded-xl flex flex-col space-y-4 border border-slate-100">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Nenhuma mensagem recente.
              </div>
            ) : (
              [...messages].reverse().map((msg: any) => (
                <div key={msg.id} className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'} mb-2`}>
                  {!msg.fromMe && <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">{msg.pushName || 'Usuário'}</span>}
                  {msg.fromMe && <span className="text-xs font-semibold text-indigo-400 mb-1 mr-1">IA</span>}
                  
                  <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.fromMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'}`}>
                    <p className="mb-1 whitespace-pre-wrap">{msg.text}</p>
                    <div className={`text-[10px] text-right mt-1 ${msg.fromMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
