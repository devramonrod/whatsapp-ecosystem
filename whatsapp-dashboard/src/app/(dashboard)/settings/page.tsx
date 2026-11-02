"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, ShieldCheck, User, Server, Database, Lock } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("api-keys");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações do Ecossistema</h2>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie suas chaves globais, segurança e infraestrutura.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* Sidebar Menu for Settings */}
        <aside className="w-full md:w-64 flex flex-col space-y-1">
          <button 
            onClick={() => setActiveTab("api-keys")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "api-keys" ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <Key className="h-5 w-5" /> Chaves de API
          </button>
          <button 
            onClick={() => setActiveTab("auth")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "auth" ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <ShieldCheck className="h-5 w-5" /> Autenticação (Supabase)
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "profile" ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <User className="h-5 w-5" /> Meu Perfil
          </button>
          <button 
            onClick={() => setActiveTab("servers")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "servers" ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <Server className="h-5 w-5" /> Evolution API & Infra
          </button>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "api-keys" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credenciais Globais de IA</CardTitle>
                  <CardDescription>Configure suas chaves aqui. Ao criar um Agente, você só precisará selecionar o provedor, sem ter que digitar a chave novamente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex justify-between">
                      <span>OpenAI API Key</span>
                      <span className="text-xs text-green-600 font-semibold">Configurado</span>
                    </label>
                    <Input type="password" placeholder="sk-..." defaultValue="sk-dummy-key-already-set-in-backend" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex justify-between">
                      <span>Google Gemini API Key</span>
                      <span className="text-xs text-slate-400">Não configurado</span>
                    </label>
                    <Input type="password" placeholder="AIza..." />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-slate-50 rounded-b-xl">
                  <Button className="ml-auto bg-indigo-600 hover:bg-indigo-700">Salvar Chaves Globais</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "auth" && (
            <div className="space-y-6">
              <Card className="border-indigo-100">
                <CardHeader className="bg-indigo-50/50 rounded-t-xl pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-6 w-6 text-indigo-600" />
                    <CardTitle className="text-indigo-900">Integração Supabase (Preparação)</CardTitle>
                  </div>
                  <CardDescription>
                    Arquitetura pronta para plugar o Supabase Auth. Garantia de segurança via Cookies HttpOnly (evitando XSS). Nenhum token trafega exposto no navegador.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm mb-4">
                    <strong>Modo Atual:</strong> Local / Desenvolvimento. O banco em uso é o PostgreSQL local do Docker. Forneça as credenciais abaixo quando criar seu projeto no Supabase.
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supabase Project URL</label>
                    <Input placeholder="https://xyzcompany.supabase.co" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supabase Anon Key</label>
                    <Input type="password" placeholder="eyJh..." />
                  </div>
                  <div className="space-y-2 pt-4">
                    <label className="text-sm font-medium">JWT Secret (Backend Validation)</label>
                    <Input type="password" placeholder="Para validar os tokens no Quarkus (Microserviço)" />
                    <p className="text-xs text-muted-foreground pt-1">O Quarkus e o Next.js compartilharão a validação do token gerado pelo Supabase.</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-slate-50 rounded-b-xl flex justify-between items-center">
                  <span className="text-xs flex items-center gap-1 text-slate-500"><Lock className="h-3 w-3"/> Arquitetura HttpOnly Server-Side</span>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Ativar Supabase</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meu Perfil</CardTitle>
                  <CardDescription>Informações da sua conta de administrador.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome</label>
                    <Input defaultValue="Admin do Sistema" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail de Acesso</label>
                    <Input type="email" defaultValue="admin@whatsapp-ai.local" disabled />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-slate-50 rounded-b-xl">
                  <Button className="ml-auto bg-indigo-600 hover:bg-indigo-700">Atualizar Perfil</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "servers" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolution API & Serviços</CardTitle>
                  <CardDescription>Ponto de conexão entre o orquestrador e a API do WhatsApp.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL da Evolution API</label>
                    <Input defaultValue="http://evolution_api:8080" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Global Webhook (URL de Retorno)</label>
                    <Input defaultValue="http://whatsapp_gateway:8081/api/webhook" />
                    <p className="text-xs text-muted-foreground pt-1">Este é o endereço onde a Evolution API notifica o nosso ecossistema de novas mensagens.</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-slate-50 rounded-b-xl">
                  <Button className="ml-auto bg-indigo-600 hover:bg-indigo-700">Testar Conexão</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
