# ?? Ecosystem AI - Documentação e Storytelling de Arquitetura

Bem-vindo à documentação oficial do desenvolvimento do **Ecosystem AI**, um SaaS (Software as a Service) Multi-Tenant para gerenciamento de frotas de agentes de WhatsApp usando N8N, Evolution API e Supabase.

---

## ??? 1. O Desafio e a Visão
O objetivo foi transformar um painel simples em um sistema robusto de ponta a ponta, onde múltiplos clientes (empresas) pudessem ter seu próprio espaço isolado, gerenciar seus próprios atendentes e conectar instâncias do WhatsApp, com o criador do sistema tendo controle absoluto (Modo Deus). Tudo isso garantindo extrema segurança.

---

## ??? 2. Regras de Negócio e Permissões (RBAC)
Desenhamos uma estrutura de controle de acesso rigorosa:

1. **?? SUPER_ADMIN (Dono do Sistema / Você):**
   - Tem acesso a tudo.
   - Sua interface exibe a aba especial "Gerenciar Tenants", onde pode cadastrar novos donos de negócios (Sócios) de forma silenciosa e criar o espaço da empresa deles.

2. **?? SOCIO (Dono da Empresa Cliente):**
   - Vê apenas o contexto da própria empresa.
   - Pode visualizar as chaves de API (Prompts) e gerenciar os agentes.
   - Sua aba "Gerenciar Equipe" permite convidar novos MEMBROS (funcionários) vinculando-os automaticamente à sua empresa.

3. **?? MEMBRO (Atendente / Funcionário):**
   - Pode visualizar chats e mensagens da empresa.
   - **Restrição Crítica:** O menu de "Agentes & WhatsApp" (/prompts) é bloqueado visualmente e fisicamente, impedindo que vejam ou roubem os Prompts de IA e as API Keys da empresa.

---

## ??? 3. Backend e Banco de Dados (Supabase + Quarkus)
Migramos do banco de dados local para a nuvem da AWS via Supabase.

* **O Bloqueio do IPv6 (WSL Docker):** O Docker no Windows falhou ao conectar na URL direta do Supabase (db.ffkmltx...) pois a AWS forçou essas rotas para IPv6. A solução arquitetural foi usar a URL de **Connection Pooler (IPv4)** na porta 6543, mapeando especificamente a região de Oregon (ws-0-us-west-2).
* **Hibernate em Ação:** O backend Java assumiu o controle. Assim que conectou, o Hibernate rodou os scripts e estruturou de forma autônoma as tabelas fundamentais: userprofile (onde guardamos o Role e Empresa), 	enantconfig e messagelog.

---

## ?? 4. Frontend e Segurança Absoluta (Next.js 15)
Construímos a segurança em cima da arquitetura moderna do Next.js (App Router).

* **Cookies HttpOnly:** Removemos qualquer sufixo NEXT_PUBLIC_ de chaves críticas. O token JWT do Supabase não fica acessível no navegador. Ele trafega 100% via Server-Side, blindando contra roubo de tokens via XSS.
* **O Bug do Node.js 20:** O frontend deu "crash" silencioso no login pois a nova biblioteca do Supabase exige WebSockets nativos (presentes apenas no Node 22). Atualizamos o Dockerfile do whatsapp-dashboard de 
ode:20-alpine para 
ode:22-alpine, solucionando o problema.
* **Botão de Sair Seguro:** O botão de Sair da Conta (Logout) foi adicionado no rodapé da Sidebar, acionando uma Server Action que destrói a sessão no backend e redireciona de imediato para /login.

---

## ?? 5. Criação de Equipes Silenciosa (Service Role Key)
Para que você (SUPER_ADMIN) ou um SOCIO possam criar usuários por dentro do painel, não podemos usar a API comum (ANON_KEY), senão o Supabase entende que é um novo registro e desloga você para logar o novato.

* **A Solução:** Adicionamos a SUPABASE_SERVICE_ROLE_KEY. No backend (Next.js Server Actions), usamos essa chave mestra para instanciar o Supabase no "Modo Admin". Isso nos permite criar o usuário silenciosamente, autoconfirmar o e-mail (email_confirm: true) e injetar o perfil dele (com o Cargo e Empresa) direto na tabela userprofile, tudo em um único clique sem afetar a sessão atual.

---

## ?? 6. O Arquivo .env Definitivo
Para que tudo isso funcione, o seu .env do frontend ficou assim (NUNCA mostre essas chaves no frontend com NEXT_PUBLIC a não ser a URL e a Publishable):

\\\env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave_aqui

# Chave secreta de Admin (Service Role) - Cria usuários sem deslogar o admin atual
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
\\\

---

## ?? Prompt Base Para o Futuro
Se você precisar pedir novas telas ou modificações para mim (ou outra IA) no futuro, copie e cole o bloco abaixo para me dar contexto:

> **[CONTEXTO DO SISTEMA]**
> Atue como desenvolvedor Fullstack Avançado. Temos um SaaS Multi-Tenant (Next.js 15, Tailwind, Supabase SSR e Quarkus Java backend). O sistema usa Cookies HttpOnly para autenticação. Os usuários estão na tabela Supabase 'auth.users' e possuem metadados estendidos na nossa tabela 'public.userprofile' (com colunas: userid, name, companyname, role).
> Regras de RBAC: 'SUPER_ADMIN' gerencia tudo; 'SOCIO' gerencia apenas membros da mesma 'companyname'; 'MEMBRO' não tem acesso à tela de Prompts nem chaves de API. Criação de usuários é feita via Server Actions no Next.js usando o 'supabase.auth.admin.createUser' com a SUPABASE_SERVICE_ROLE_KEY para evitar o deslogue do admin atual. A versão do Node do Frontend no Docker é 22-alpine (para suporte a WebSockets nativos).

