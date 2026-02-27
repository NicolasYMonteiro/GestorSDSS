import React from 'react';
import { Task, Column } from '../../types/kanban';
import { PRIORITY_COLORS, PRIORITY_LABELS, TAG_COLORS, TAG_LABELS } from '../../constants/kanban';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Calendar, AlertCircle } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  columns: Column[];
  onTaskClick: (task: Task) => void;
}

export function ListView({ tasks, columns, onTaskClick }: ListViewProps) {
  const getColumnTitle = (columnId: string) => columns.find(c => c.id === columnId)?.title || 'Desconhecido';

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-600">Tarefa</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Prioridade</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Etiquetas</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Responsáveis</th>
              <th className="px-6 py-3 font-semibold text-slate-600">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map(task => {
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
              
              return (
                <tr 
                  key={task.id} 
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-800">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-slate-400 truncate max-w-[300px]">{task.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {getColumnTitle(task.columnId)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={cn("inline-flex items-center px-2 py-1 rounded border text-xs font-medium uppercase", PRIORITY_COLORS[task.priority])}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map(tag => (
                        <span key={tag} className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider", TAG_COLORS[tag])}>
                          {TAG_LABELS[tag]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex -space-x-1.5">
                      {task.assignees.map((assignee, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={assignee}>
                          {assignee.substring(0, 2)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {task.dueDate ? (
                      <div className={cn("flex items-center gap-1.5 text-xs", isOverdue ? "text-red-600 font-medium" : "text-slate-500")}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            Nenhuma tarefa encontrada com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}
