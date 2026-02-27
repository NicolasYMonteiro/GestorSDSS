import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '../../types/kanban';
import { TaskCard } from './TaskCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Plus, Trash2, Edit2, Palette, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBoardStore } from '../../store/useBoardStore';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

const COLUMN_COLORS = [
  { name: 'Padrão', value: 'bg-slate-100/50', border: 'border-slate-200/60' },
  { name: 'Azul', value: 'bg-blue-50/80', border: 'border-blue-200/60' },
  { name: 'Verde', value: 'bg-emerald-50/80', border: 'border-emerald-200/60' },
  { name: 'Amarelo', value: 'bg-amber-50/80', border: 'border-amber-200/60' },
  { name: 'Vermelho', value: 'bg-rose-50/80', border: 'border-rose-200/60' },
  { name: 'Roxo', value: 'bg-purple-50/80', border: 'border-purple-200/60' },
];

export function KanbanColumn({ column, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
  const { boards, activeBoardId, updateColumn, deleteColumn } = useBoardStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [title, setTitle] = useState(column.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const totalTasksInColumn = activeBoard?.tasks.filter(t => t.columnId === column.id).length || 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
    disabled: true, 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    if (title.trim() !== column.title) {
      updateColumn(column.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSubmit();
    if (e.key === 'Escape') {
      setTitle(column.title);
      setIsEditingTitle(false);
    }
  };

  const handleDeleteClick = () => {
    if (totalTasksInColumn > 0) {
      alert(`Não é possível excluir esta coluna pois ela contém ${totalTasksInColumn} tarefa(s). Por favor, mova ou exclua as tarefas antes de excluir a coluna.`);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const currentColor = COLUMN_COLORS.find(c => c.value === column.color) || COLUMN_COLORS[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col w-80 min-w-[320px] max-w-[320px] rounded-2xl border h-full max-h-full shadow-sm backdrop-blur-sm transition-colors",
        column.color || 'bg-slate-100/50',
        currentColor.border || 'border-slate-200/60'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-black/5 rounded-t-2xl" {...attributes} {...listeners}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn("w-2 h-2 rounded-full shrink-0", 
            column.title.includes('Backlog') ? "bg-slate-400" :
            column.title.includes('Análise') ? "bg-blue-500" :
            column.title.includes('Validação') ? "bg-orange-500" :
            "bg-emerald-500"
          )} />
          
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="bg-white/50 px-2 py-1 rounded border border-blue-300 text-sm font-bold text-slate-700 w-full outline-none focus:ring-2 focus:ring-blue-200"
            />
          ) : (
            <h2 
              className="font-bold text-slate-700 text-sm tracking-tight uppercase truncate cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditingTitle(true)}
              title="Clique para editar"
            >
              {column.title}
            </h2>
          )}
          
          {!isEditingTitle && (
            <span className="bg-white/50 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-black/5">
              {tasks.length}
            </span>
          )}
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { setIsEditingTitle(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <Edit2 className="w-4 h-4" /> Renomear
                </button>
                
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Cor do Bloco
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {COLUMN_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => updateColumn(column.id, { color: color.value })}
                        className={cn(
                          "w-full h-8 rounded-md border transition-all flex items-center justify-center",
                          color.value,
                          column.color === color.value ? "ring-2 ring-blue-500 ring-offset-1 border-transparent" : "border-black/5 hover:scale-105"
                        )}
                        title={color.name}
                      >
                        {column.color === color.value && <Check className="w-3 h-3 text-slate-700/50" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-1" />
                
                {!showDeleteConfirm ? (
                  <button 
                    onClick={handleDeleteClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir Coluna
                  </button>
                ) : (
                  <div className="px-3 py-2 bg-red-50 rounded-lg animate-in fade-in">
                    <p className="text-xs text-red-800 mb-2 font-semibold">Excluir permanentemente?</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteColumn(column.id)}
                        className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded font-medium hover:bg-red-700 transition-colors"
                      >
                        Sim
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 bg-white text-slate-700 text-xs py-1.5 rounded border border-slate-200 font-medium hover:bg-slate-50 transition-colors"
                      >
                        Não
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Area */}
      <div className="flex-1 p-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 min-h-[100px]">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Footer Action */}
      <div className="p-3 border-t border-black/5 bg-white/30 rounded-b-2xl">
        <button 
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 p-2.5 rounded-xl text-sm transition-all font-semibold border border-transparent hover:border-blue-100 group"
        >
          <div className="w-5 h-5 rounded-full bg-slate-200 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
            <Plus className="w-3 h-3 text-slate-600 group-hover:text-blue-700" />
          </div>
          Adicionar Tarefa
        </button>
      </div>
    </div>
  );
}
