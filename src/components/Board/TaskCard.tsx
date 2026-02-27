import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types/kanban';
import { PRIORITY_COLORS, PRIORITY_LABELS, TAG_COLORS, TAG_LABELS } from '../../constants/kanban';
import { Calendar, CheckSquare, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isValidDate = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const isOverdue = isValidDate(task.dueDate) && isPast(new Date(task.dueDate!)) && !isToday(new Date(task.dueDate!));
  const completedChecklist = task.checklist.filter(i => i.completed).length;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white p-4 rounded-xl shadow-xl border-2 border-blue-500/50 opacity-80 h-[150px] rotate-2 scale-105 cursor-grabbing"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md hover:border-blue-400/50 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
    >
      {/* Priority Indicator Line */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS['medium']).replace('bg-', 'bg-').replace('text-', 'bg-').split(' ')[0])} />

      <div className="pl-2">
        {/* Header: Tags & Priority */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map(tag => (
              <span key={tag} className={cn("text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-opacity-10 border border-opacity-20", TAG_COLORS[tag] || TAG_COLORS['adm'])}>
                {TAG_LABELS[tag] || tag}
              </span>
            ))}
          </div>
          {/* Priority Badge (Subtle) */}
           <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider opacity-70", PRIORITY_COLORS[task.priority] || PRIORITY_COLORS['medium'])}>
            {PRIORITY_LABELS[task.priority] || 'Média'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug group-hover:text-blue-700 transition-colors">
          {task.title}
        </h3>
        
        {/* Description Preview */}
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-3 text-slate-400">
            {/* Creation Date */}
            {isValidDate(task.createdAt) && (
              <div className="flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md text-slate-400 bg-slate-50" title={`Criado em: ${format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm')}`}>
                 <Calendar className="w-3 h-3" />
                 <span>{format(new Date(task.createdAt), 'dd/MM', { locale: ptBR })}</span>
              </div>
            )}

            {isValidDate(task.dueDate) && (
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-1.5 py-0.5 rounded-md transition-colors", 
                isOverdue ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-50"
              )} title="Prazo de entrega">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(task.dueDate!), 'dd MMM', { locale: ptBR })}</span>
              </div>
            )}
            
            {(task.checklist.length > 0 || task.comments.length > 0) && (
              <div className="flex items-center gap-3">
                {task.checklist.length > 0 && (
                  <div className="flex items-center gap-1 text-xs hover:text-blue-600 transition-colors" title="Checklist">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className="font-medium">{completedChecklist}/{task.checklist.length}</span>
                  </div>
                )}

                {task.comments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs hover:text-blue-600 transition-colors" title="Comentários">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="font-medium">{task.comments.length}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div className="flex -space-x-2 pl-2">
            {task.assignees.map((assignee, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-slate-600 ring-1 ring-slate-100" 
                title={assignee}
              >
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                  {assignee.substring(0, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
