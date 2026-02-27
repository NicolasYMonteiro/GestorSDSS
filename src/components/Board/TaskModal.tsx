import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, CheckSquare, MessageSquare, Tag as TagIcon, Clock, Trash2, Plus, User, Check, ChevronDown, ChevronUp, Target, Layers } from 'lucide-react';
import { Task, Priority, Tag, ChecklistItem, StrategicDimension } from '../../types/kanban';
import { PRIORITY_COLORS, PRIORITY_LABELS, TAG_COLORS, TAG_LABELS } from '../../constants/kanban';
import { useBoardStore } from '../../store/useBoardStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

const STRATEGIC_DIMENSIONS: StrategicDimension[] = [
  'Produção', 'Acesso', 'Capacitação', 'Difusão', 'Monitoramento'
];

const STRATEGIC_OBJECTIVES = [
  '1.1 Articular a validação e o homologação indicadores.',
  '1.2 Favorecer a avaliação da qualidade dos dados.',
  '1.3 Desenvolver novos painéis',
  '2.1 Potencializar o acesso de utilização dos painéis de BI.',
  '2.2 Otimizar o engajamento dos painéis de BI (reduzir o tempo de inatividade).',
  '2.3 Prestar suporte ágil e resolutivo aos usuários.',
  '3.1 Executar a capacitação contínua no uso de painéis de BI.',
  '3.2 Promover a cultura informacional na SMS.',
  '3.3 Fomentar a qualidade e satisfação dos treinamentos.',
  '4.1 Gestão e atuação no projeto sobre a descentralização da SDSS.',
  '4.2 Disseminar ativamente o conhecimento (Boletins, Trabalhos).',
  '4.3 Ampliar a articulação com as áreas técnicas e acadêmicas.',
  '5.1 Monitorar Emissão de alertas para monitoramento dos indicadores.',
  '5.2 Monitorar e analisar os acessos e utilizações dos painéis.',
  '5.3 Monitorar a tomada de decisão de todos os níveis de atenção à saúde'
];

export function TaskModal({ taskId, onClose }: TaskModalProps) {
  const { boards, activeBoardId, updateTask, deleteTask } = useBoardStore();
  
  // Select task directly from store to ensure reactivity
  const activeBoard = boards.find(b => b.id === activeBoardId);
  const task = activeBoard?.tasks.find(t => t.id === taskId);
  const authors = activeBoard?.authors || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isObjectiveOpen, setIsObjectiveOpen] = useState(false);
  const [isDimensionOpen, setIsDimensionOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);

  // Sync local state when task changes (only if not editing, ideally, but for MVP sync on mount/change is safer)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate || '');
    }
  }, [task]);

  // Close assignee dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setIsAssigneeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title !== task.title) updateTask(task.id, { title });
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) updateTask(task.id, { description });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    updateTask(task.id, { dueDate: newDate });
  };

  const toggleChecklistItem = (itemId: string) => {
    const newChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateTask(task.id, { checklist: newChecklist });
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: newChecklistItem,
      completed: false
    };
    updateTask(task.id, { checklist: [...task.checklist, newItem] });
    setNewChecklistItem('');
  };

  const deleteChecklistItem = (itemId: string) => {
    const newChecklist = task.checklist.filter(item => item.id !== itemId);
    updateTask(task.id, { checklist: newChecklist });
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = {
      id: uuidv4(),
      author: 'Eu', // Mock user
      content: newComment,
      createdAt: new Date().toISOString()
    };
    updateTask(task.id, { comments: [...task.comments, comment] });
    setNewComment('');
  };

  const handleDelete = () => {
    // Direct delete without confirm for debugging
    console.log('Direct delete triggered');
    deleteTask(task.id);
    onClose();
  };

  const toggleAssignee = (user: string) => {
    const newAssignees = task.assignees.includes(user)
      ? task.assignees.filter(a => a !== user)
      : [...task.assignees, user];
    updateTask(task.id, { assignees: newAssignees });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex-1 mr-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-full bg-transparent text-xl font-bold text-slate-800 border-none focus:ring-0 p-0 placeholder-slate-400"
              placeholder="Título da tarefa"
            />
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Na coluna <span className="font-medium text-slate-700">Fluxo</span></span>
              <span>•</span>
              <span>Criado em {format(new Date(task.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FileTextIcon className="w-4 h-4" />
                Descrição
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Adicione uma descrição detalhada..."
                className="w-full min-h-[100px] p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-y"
              />
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Calendar className="w-4 h-4" />
                Prazo de Entrega
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                className="px-3 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
              />
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckSquare className="w-4 h-4" />
                  Checklist
                </div>
                {task.checklist.length > 0 && (
                  <span className="text-xs text-slate-500">
                    {Math.round((task.checklist.filter(i => i.completed).length / task.checklist.length) * 100)}% concluído
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mb-3">
                {task.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={cn("flex-1 text-sm transition-all", item.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                      {item.text}
                    </span>
                    <button 
                      onClick={() => deleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={addChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Adicionar item..."
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                />
                <button type="submit" className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                  Adicionar
                </button>
              </form>
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                <MessageSquare className="w-4 h-4" />
                Comentários
              </div>
              
              <div className="space-y-4 mb-4">
                {task.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      {comment.author.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">{comment.author}</span>
                        <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                      </div>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={addComment} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  EU
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            {/* Metadata Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Prioridade</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => updateTask(task.id, { priority: p })}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium border transition-all",
                        task.priority === p 
                          ? PRIORITY_COLORS[p] + " ring-2 ring-offset-1 ring-slate-300" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Etiquetas</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(TAG_LABELS) as Tag[]).map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        const newTags = task.tags.includes(t) 
                          ? task.tags.filter(tag => tag !== t)
                          : [...task.tags, t];
                        updateTask(task.id, { tags: newTags });
                      }}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border transition-all",
                        task.tags.includes(t)
                          ? TAG_COLORS[t] + " ring-1 ring-offset-1 ring-slate-200"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 opacity-60 hover:opacity-100"
                      )}
                    >
                      {TAG_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategic Dimension */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Dimensão Estratégica
                </label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setIsDimensionOpen(!isDimensionOpen)}
                    className="w-full px-3 py-2 bg-slate-50 text-left text-xs font-medium text-slate-700 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <span className="truncate pr-2">
                      {task.strategicDimension || 'Selecione uma dimensão...'}
                    </span>
                    {isDimensionOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  
                  {isDimensionOpen && (
                    <div className="max-h-60 overflow-y-auto bg-white border-t border-slate-200">
                      {STRATEGIC_DIMENSIONS.map((dim, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            updateTask(task.id, { strategicDimension: dim });
                            setIsDimensionOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-50 last:border-0 transition-colors",
                            task.strategicDimension === dim && "bg-blue-50 text-blue-700 font-medium"
                          )}
                        >
                          {dim}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Strategic Objective */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Objetivo Estratégico
                </label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setIsObjectiveOpen(!isObjectiveOpen)}
                    className="w-full px-3 py-2 bg-slate-50 text-left text-xs font-medium text-slate-700 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <span className="truncate pr-2">
                      {task.strategicObjective || 'Selecione um objetivo...'}
                    </span>
                    {isObjectiveOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  
                  {isObjectiveOpen && (
                    <div className="max-h-60 overflow-y-auto bg-white border-t border-slate-200">
                      {STRATEGIC_OBJECTIVES.map((obj, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            updateTask(task.id, { strategicObjective: obj });
                            setIsObjectiveOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-50 last:border-0 transition-colors",
                            task.strategicObjective === obj && "bg-blue-50 text-blue-700 font-medium"
                          )}
                        >
                          {obj}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div ref={assigneeRef} className="relative">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Responsáveis</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {task.assignees.map((a, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-white shadow-sm">
                      {a.substring(0, 2)}
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                    className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {isAssigneeOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-10 overflow-hidden">
                    <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-500">
                      Adicionar membro
                    </div>
                    <div className="p-1 max-h-48 overflow-y-auto">
                      {authors.length > 0 ? (
                        authors.map(author => (
                          <button
                            key={author.id}
                            onClick={() => toggleAssignee(author.name)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {author.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span>{author.name}</span>
                            </div>
                            {task.assignees.includes(author.name) && <Check className="w-4 h-4 text-blue-600" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-slate-400 text-center">Nenhum autor cadastrado</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Ações</label>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Tarefa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
