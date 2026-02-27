import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, Bell, Search, Menu, Activity, FileText, HelpCircle, X, Database, Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { currentModule, setCurrentModule } = useBoardStore();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-900/20">
          A
        </div>
        <span className="font-bold text-lg tracking-tight">SDSS Control</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <button 
          onClick={() => setCurrentModule('kanban')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-all text-sm font-medium",
            currentModule === 'kanban' 
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
              : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Monitoramento
        </button>
        
        <button 
          onClick={() => setCurrentModule('meetings')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-all text-sm font-medium",
            currentModule === 'meetings' 
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
              : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <Calendar className="w-4 h-4" />
          Gestão de Reuniões
        </button>

        <button 
          onClick={() => setCurrentModule('team')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-all text-sm font-medium",
            currentModule === 'team' 
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
              : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          Equipe
        </button>
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
          <Activity className="w-4 h-4" />
          Relatórios
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm">
          <Settings className="w-4 h-4" />
          Configurações
        </button>
      </div>
    </aside>
  );
}

import { useBoardStore } from '../../store/useBoardStore';

export function Header() {
  const [showDocs, setShowDocs] = useState(false);
  const { isSyncing, lastSync } = useBoardStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button className="text-slate-500 hover:text-slate-700 lg:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">SDSS Control</h2>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
            Online
          </span>
          {isSyncing ? (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 animate-spin" /> Sincronizando...
            </span>
          ) : lastSync ? (
            <span className="text-[10px] text-slate-400">
              Salvo às {lastSync.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar cards..." 
            className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-64 transition-all outline-none"
          />
        </div>
        
        <button 
          onClick={() => setShowDocs(true)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          title="Documentação do Sistema"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          AD
        </div>
      </div>

      {showDocs && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Especificação do Sistema</h3>
              <button onClick={() => setShowDocs(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto prose prose-sm max-w-none">
              <h4>1. Visão Geral</h4>
              <p>O sistema SDSS-Gestão é uma plataforma web para orquestração de tarefas e fluxo de trabalho da Sala de Situação em Saúde de Salvador.</p>
              
              <h4>2. Arquitetura Proposta</h4>
              <ul>
                <li><strong>Frontend:</strong> React 19 + Vite + Tailwind CSS</li>
                <li><strong>Backend:</strong> Node.js (Express) ou Python (FastAPI)</li>
                <li><strong>Banco de Dados:</strong> PostgreSQL</li>
                <li><strong>Auth:</strong> OAuth2 / OIDC</li>
              </ul>

              <h4>3. Funcionalidades do MVP</h4>
              <ul>
                <li>Gestão Visual (Kanban)</li>
                <li>Detalhamento de Tarefas (Checklist, Comentários)</li>
                <li>Filtros e Busca</li>
                <li>Design System Governamental</li>
              </ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
