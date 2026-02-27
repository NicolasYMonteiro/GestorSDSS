import React from 'react';
import { Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { PRIORITY_LABELS, TAG_LABELS } from '../../constants/kanban';
import { Priority, Tag } from '../../types/kanban';
import { cn } from '../../lib/utils';

export function FilterBar() {
  const { filters, setFilter, viewMode, setViewMode, boards, activeBoardId } = useBoardStore();
  
  const activeBoard = boards.find(b => b.id === activeBoardId);
  const authors = activeBoard?.authors || [];

  const hasActiveFilters = filters.query || filters.priority || filters.strategicDimension || filters.assignee || filters.dateRange;

  return (
    <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center gap-4 overflow-x-auto shrink-0">
      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          onClick={() => setViewMode('board')}
          className={cn(
            "p-1.5 rounded-md transition-all",
            viewMode === 'board' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          )}
          title="Visão Quadro"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            "p-1.5 rounded-md transition-all",
            viewMode === 'list' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          )}
          title="Visão Lista"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-2" />

      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
        <Filter className="w-4 h-4" />
        Filtros:
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
        <input 
          type="text" 
          value={filters.query}
          onChange={(e) => setFilter('query', e.target.value)}
          placeholder="Buscar por título..." 
          className="pl-9 pr-3 py-1.5 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-md text-sm w-48 transition-all outline-none border"
        />
      </div>

      {/* Priority Filter */}
      <select
        value={filters.priority || ''}
        onChange={(e) => setFilter('priority', e.target.value as Priority || null)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm border outline-none transition-all cursor-pointer",
          filters.priority 
            ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" 
            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        )}
      >
        <option value="">Todas Prioridades</option>
        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      {/* Strategic Dimension Filter */}
      <select
        value={filters.strategicDimension || ''}
        onChange={(e) => setFilter('strategicDimension', e.target.value || null)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm border outline-none transition-all cursor-pointer",
          filters.strategicDimension 
            ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" 
            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        )}
      >
        <option value="">Todas Dimensões</option>
        <option value="Produção">Produção</option>
        <option value="Acesso">Acesso</option>
        <option value="Capacitação">Capacitação</option>
        <option value="Difusão">Difusão</option>
        <option value="Monitoramento">Monitoramento</option>
      </select>

      {/* Assignee Filter */}
      <select
        value={filters.assignee || ''}
        onChange={(e) => setFilter('assignee', e.target.value || null)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm border outline-none transition-all cursor-pointer",
          filters.assignee 
            ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" 
            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        )}
      >
        <option value="">Todos Responsáveis</option>
        {authors.map((author) => (
          <option key={author.id} value={author.name}>
            {author.name}
          </option>
        ))}
      </select>

      {/* Date Filter */}
      <select
        value={filters.dateRange || ''}
        onChange={(e) => setFilter('dateRange', e.target.value as any || null)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm border outline-none transition-all cursor-pointer",
          filters.dateRange 
            ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" 
            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        )}
      >
        <option value="">Qualquer Data</option>
        <option value="overdue">Atrasadas</option>
        <option value="today">Para Hoje</option>
        <option value="week">Esta Semana</option>
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setFilter('query', '');
            setFilter('priority', null);
            setFilter('strategicDimension', null);
            setFilter('assignee', null);
            setFilter('dateRange', null);
          }}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors ml-auto"
        >
          <X className="w-3 h-3" />
          Limpar filtros
        </button>
      )}
    </div>
  );
}
