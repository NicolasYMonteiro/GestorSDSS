import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore } from '../../store/useBoardStore';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { FilterBar } from './FilterBar';
import { ListView } from './ListView';
import { Task } from '../../types/kanban';
import { createPortal } from 'react-dom';
import { format, isPast, isToday, isSameWeek } from 'date-fns';

import { Plus } from 'lucide-react';

export function KanbanBoard() {
  const { boards, activeBoardId, moveTask, addTask, addColumn, filters, viewMode } = useBoardStore();
  const activeBoard = boards.find(b => b.id === activeBoardId);
  
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter Logic
  const filteredTasks = useMemo(() => {
    if (!activeBoard) return [];
    return activeBoard.tasks.filter(task => {
      const matchesQuery = filters.query 
        ? task.title.toLowerCase().includes(filters.query.toLowerCase()) 
        : true;
      const matchesPriority = filters.priority 
        ? task.priority === filters.priority 
        : true;
      const matchesDimension = filters.strategicDimension 
        ? task.strategicDimension === filters.strategicDimension 
        : true;
      const matchesAssignee = filters.assignee
        ? task.assignees.includes(filters.assignee)
        : true;
      
      let matchesDate = true;
      if (filters.dateRange && task.dueDate) {
        const date = new Date(task.dueDate);
        if (filters.dateRange === 'overdue') {
          matchesDate = isPast(date) && !isToday(date);
        } else if (filters.dateRange === 'today') {
          matchesDate = isToday(date);
        } else if (filters.dateRange === 'week') {
          matchesDate = isSameWeek(date, new Date());
        }
      } else if (filters.dateRange && !task.dueDate) {
        matchesDate = false;
      }
      
      return matchesQuery && matchesPriority && matchesDimension && matchesAssignee && matchesDate;
    });
  }, [activeBoard, filters]);

  if (!activeBoard) return <div>Board not found</div>;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = activeBoard.tasks.find(t => t.id === active.id);
    if (task) setActiveDragTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback for drop targets
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveDragTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const task = activeBoard.tasks.find(t => t.id === activeId);
    if (!task) return;

    // Check if dropped on a column
    const isOverColumn = activeBoard.columns.some(c => c.id === overId);
    
    if (isOverColumn) {
      if (task.columnId !== overId) {
        moveTask(activeId, overId);
      }
    } else {
      // Dropped on another task?
      const overTask = activeBoard.tasks.find(t => t.id === overId);
      if (overTask && overTask.columnId !== task.columnId) {
        moveTask(activeId, overTask.columnId);
      }
    }

    setActiveDragTask(null);
  };

  return (
    <div className="h-full flex flex-col">
      <FilterBar />
      
      {viewMode === 'list' ? (
        <ListView 
          tasks={filteredTasks} 
          columns={activeBoard.columns} 
          onTaskClick={(task) => setSelectedTaskId(task.id)} 
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="h-full flex gap-6 p-6 min-w-max">
              {activeBoard.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={filteredTasks.filter(t => t.columnId === column.id)}
                  onAddTask={() => addTask(column.id, { title: 'Nova Tarefa' })}
                  onTaskClick={(task) => setSelectedTaskId(task.id)}
                />
              ))}
              
              {/* Add Column Button */}
              <div className="min-w-[320px] max-w-[320px]">
                {isAddingColumn ? (
                  <form onSubmit={handleAddColumn} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <input
                      autoFocus
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Nome da coluna..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 mb-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button 
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Adicionar
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsAddingColumn(false)}
                        className="flex-1 bg-slate-200 text-slate-600 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsAddingColumn(true)}
                    className="w-full h-[60px] flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Coluna
                  </button>
                )}
              </div>
            </div>
          </div>

          {createPortal(
            <DragOverlay>
              {activeDragTask ? (
                <TaskCard task={activeDragTask} onClick={() => {}} />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      )}

      {selectedTaskId && (
        <TaskModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
}
