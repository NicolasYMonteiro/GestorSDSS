# Especificação Arquitetural e Funcional - SDSS Salvador

## 1. Visão Geral
O sistema **SDSS-Gestão** é uma plataforma web para orquestração de tarefas e fluxo de trabalho da Sala de Situação em Saúde de Salvador. O foco é a eficiência operacional, segurança de dados e usabilidade.

## 2. Arquitetura Proposta (Full Implementation)

### 2.1. Frontend
- **Framework:** React 19 (Vite)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (Design System governamental limpo e acessível)
- **Gerenciamento de Estado:** Zustand (Client) + React Query (Server State)
- **Comunicação Real-time:** WebSockets (para atualizações do Kanban em tempo real)

### 2.2. Backend (Sugestão)
- **Runtime:** Node.js (Express ou NestJS) ou Python (FastAPI - caso haja integração forte com Ciência de Dados)
- **Banco de Dados:** PostgreSQL (Relacional, robusto para transações e integridade)
- **Cache:** Redis (para sessões e cache de queries frequentes)
- **Armazenamento de Arquivos:** S3 Compatible Object Storage (MinIO ou AWS S3) para anexos dos cards.

### 2.3. Segurança
- **Autenticação:** OAuth2 / OIDC (Integração com base corporativa da Prefeitura)
- **Controle de Acesso:** RBAC (Role-Based Access Control) granular (Admin, Coordenador, Analista, Visualizador).
- **Audit Log:** Registro imutável de todas as ações nos cards (quem moveu, quem editou, quando).
- **Criptografia:** TLS 1.3 em trânsito, AES-256 em repouso.

## 3. Especificação Funcional - Módulo Kanban (MVP Implementado)

### 3.1. Estrutura de Dados
- **Board:** Container principal (ex: "Monitoramento Dengue", "Regulação Leitos").
- **Column:** Estágios do fluxo (ex: "A Fazer", "Em Análise", "Concluído").
- **Card:** Unidade de trabalho.
  - *Prioridade:* Baixa (Azul), Média (Amarelo), Alta (Laranja), Urgente (Vermelho).
  - *Tags:* Categorização transversal (Vigilância, TI, Adm).
  - *Prazo:* Data limite com indicador visual de atraso.

### 3.2. Funcionalidades do MVP
1.  **Gestão Visual:** Quadro interativo com Drag & Drop.
2.  **Filtragem:** Capacidade de filtrar por prioridade e busca textual.
3.  **Detalhamento:** Modal de edição com checklist e comentários (simulado).
4.  **Responsividade:** Layout adaptável para monitores grandes (Video Wall da sala) e desktops.

---
*Este protótipo implementa a interface frontend e a lógica de estado local para demonstração imediata.*
