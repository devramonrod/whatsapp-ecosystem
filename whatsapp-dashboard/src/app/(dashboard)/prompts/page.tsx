"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2, Save, X, QrCode } from "lucide-react";

interface TenantConfig {
  id?: number;
  phoneNumberId: string;
  businessType: string;
  systemPrompt: string;
  aiProvider?: string;
  aiModel?: string;
  notificationNumbers?: string;
  aiApiKey?: string;
}

export default function PromptsPage() {
  const [tenants, setTenants] = useState<TenantConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [formData, setFormData] = useState<TenantConfig>({ phoneNumberId: "", businessType: "", systemPrompt: "", aiProvider: "OPENAI", aiModel: "gpt-4o", notificationNumbers: "", aiApiKey: "" });

  const API_URL = "/api/tenants";

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (error) {
      console.error("Erro ao buscar tenants:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `${API_URL}/${formData.id}` : API_URL;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchTenants();
        setIsFormOpen(false);
        setFormData({ phoneNumberId: "", businessType: "", systemPrompt: "", aiProvider: "OPENAI", aiModel: "gpt-4o", notificationNumbers: "", aiApiKey: "" });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleConnectNewWhatsApp = async () => {
    if (!newInstanceName) return alert("Digite o nome da instância!");
    setIsCreatingInstance(true);
    try {
      const res = await fetch('/api/evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: newInstanceName })
      });
      const data = await res.json();
      if (data.qrcode && data.qrcode.base64) {
        setQrCodeBase64(data.qrcode.base64);
        fetchTenants(); 
      } else {
        alert("Instância criada, mas nenhum QR Code foi retornado. Talvez já esteja conectada?");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar na Evolution API");
    }
    setIsCreatingInstance(false);
  };

  const handleDelete = async (tenant: TenantConfig) => {
    if (!confirm("Tem certeza que deseja excluir este Agente e APAGAR a conexão do WhatsApp na Evolution API? (Isso é irreversível)")) return;
    try {
      const res = await fetch(`${API_URL}/${tenant.id}?instanceName=${tenant.phoneNumberId}`, { method: "DELETE" });
      if (res.ok) fetchTenants();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const editTenant = (tenant: TenantConfig) => {
    setFormData(tenant);
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Gerenciar Agentes (WhatsApp)</h2>
          <p className="text-sm md:text-base text-muted-foreground">Conecte seus números e configure a IA de cada um.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {!isFormOpen && !isQrModalOpen && (
            <Button onClick={() => setIsFormOpen(true)} variant="outline" className="h-12 px-6 rounded-xl border-blue-500 border-2 text-blue-600 hover:bg-blue-50 w-full sm:w-auto text-base font-medium transition-all shadow-sm">
              <PlusCircle className="mr-2 h-5 w-5" />
              Configurar Instância Existente
            </Button>
          )}
          {!isQrModalOpen && !isFormOpen && (
            <Button onClick={() => setIsQrModalOpen(true)} className="h-12 px-6 rounded-xl bg-green-600 hover:bg-green-700 w-full sm:w-auto text-base font-medium transition-all shadow-sm text-white border-2 border-transparent">
              <QrCode className="mr-2 h-5 w-5" />
              Conectar Novo Aparelho
            </Button>
          )}
        </div>
      </div>

      {isQrModalOpen && (
        <Card className="border-green-500/50 shadow-md">
          <CardHeader>
            <CardTitle>Conectar Novo WhatsApp</CardTitle>
            <CardDescription>Crie uma nova instância na Evolution API e leia o QR Code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!qrCodeBase64 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Instância (sem espaços)</label>
                  <Input 
                    placeholder="Ex: atendimento-filial-1" 
                    value={newInstanceName}
                    onChange={e => setNewInstanceName(e.target.value.replace(/\s+/g, '-'))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsQrModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleConnectNewWhatsApp} disabled={isCreatingInstance}>
                    {isCreatingInstance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                    Gerar QR Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-muted-foreground">Abra o WhatsApp no seu celular e escaneie o código abaixo:</p>
                <div className="bg-white p-4 rounded-xl shadow-inner">
                  <img src={qrCodeBase64} alt="QR Code" className="w-64 h-64 object-contain" />
                </div>
                <Button onClick={() => { setQrCodeBase64(null); setIsQrModalOpen(false); }}>
                  Fechar (Já Conectei)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isFormOpen && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle>Configurar Inteligência Artificial</CardTitle>
            <CardDescription>Defina as regras e a API Key para esta instância.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instância (Telefone)</label>
                <Input 
                  placeholder="Instância já conectada..." 
                  value={formData.phoneNumberId}
                  onChange={e => setFormData({...formData, phoneNumberId: e.target.value.replace(/\s+/g, '-')})}
                  disabled={!!formData.id}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nicho / Tipo de Negócio</label>
                <Input 
                  placeholder="Ex: Advocacia, Venda de Carros..." 
                  value={formData.businessType}
                  onChange={e => setFormData({...formData, businessType: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Provedor IA</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.aiProvider || "OPENAI"}
                  onChange={e => setFormData({...formData, aiProvider: e.target.value})}
                >
                  <option value="OPENAI">OpenAI (ChatGPT)</option>
                  <option value="GEMINI">Google Gemini</option>
                  <option value="OPENROUTER">OpenRouter</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo</label>
                {formData.aiProvider === "OPENROUTER" ? (
                  <Input 
                    placeholder="Ex: anthropic/claude-3-haiku" 
                    value={formData.aiModel || ""}
                    onChange={e => setFormData({...formData, aiModel: e.target.value})}
                  />
                ) : formData.aiProvider === "GEMINI" ? (
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.aiModel || "gemini-1.5-flash"}
                    onChange={e => setFormData({...formData, aiModel: e.target.value})}
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </select>
                ) : (
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.aiModel || "gpt-4o"}
                    onChange={e => setFormData({...formData, aiModel: e.target.value})}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-5">GPT-5 (Future)</option>
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chave da API (API Key)</label>
                <Input 
                  type="password"
                  placeholder="sk-..." 
                  value={formData.aiApiKey || ""}
                  onChange={e => setFormData({...formData, aiApiKey: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Números para Notificação (separados por vírgula)</label>
              <Input 
                placeholder="Ex: 5521999999999, 5511988888888" 
                value={formData.notificationNumbers || ""}
                onChange={e => setFormData({...formData, notificationNumbers: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt (Personalidade)</label>
              <textarea 
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]"
                placeholder="Você é um assistente virtual..."
                value={formData.systemPrompt || ""}
                onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Salvar Configuração
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Agentes Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Instância</TableHead>
                    <TableHead>Nicho</TableHead>
                    <TableHead>Motor IA</TableHead>
                    <TableHead className="w-[300px]">Prompt</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map(tenant => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.phoneNumberId}</TableCell>
                      <TableCell><Badge variant="secondary">{tenant.businessType}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tenant.aiProvider === 'GEMINI' ? 'text-blue-500 border-blue-500' : tenant.aiProvider === 'OPENROUTER' ? 'text-purple-500 border-purple-500' : 'text-green-500 border-green-500'}>
                          {tenant.aiProvider || 'OPENAI'} - {tenant.aiModel || 'gpt-4o'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[300px]">
                        {tenant.systemPrompt?.substring(0, 80)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => editTenant(tenant)} className="cursor-pointer hover:bg-slate-100">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tenant)} className="cursor-pointer hover:bg-red-50">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
