import { create } from 'zustand';
import { Board, Task, Column, Priority, Tag, Meeting, Author } from '../types/kanban';
import { v4 as uuidv4 } from 'uuid';
import { fetchBoardFromApi, saveBoardToApi } from '../services/googleSheets';

interface BoardState {
  activeBoardId: string;
  viewMode: 'board' | 'list';
  currentModule: 'kanban' | 'meetings' | 'team';
  boards: Board[];
  
  isSyncing: boolean;
  lastSync: Date | null;

  filters: {
    query: string;
    priority: Priority | null;
    strategicDimension: string | null;
    assignee: string | null;
    dateRange: 'overdue' | 'today' | 'week' | null;
  };
  
  // Actions
  loadData: () => Promise<void>;
  syncData: () => Promise<void>;

  setViewMode: (mode: 'board' | 'list') => void;
  setCurrentModule: (module: 'kanban' | 'meetings' | 'team') => void;
  setFilter: (key: keyof BoardState['filters'], value: string | null) => void;
  
  // Task Actions
  addTask: (columnId: string, task: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveTask: (taskId: string, targetColumnId: string, newIndex?: number) => void;
  deleteTask: (taskId: string) => void;
  
  // Column Actions
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;
  
  // Meeting Actions
  addMeeting: (meeting: Partial<Meeting>) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (meetingId: string) => void;

  // Author Actions
  addAuthor: (author: Partial<Author>) => void;
  updateAuthor: (authorId: string, updates: Partial<Author>) => void;
  deleteAuthor: (authorId: string) => void;

  setActiveBoard: (boardId: string) => void;
}

const INITIAL_DATA: Board[] = [
  {
    id: 'board-1',
    title: 'SDSS Control',
    columns: [
      { id: 'col-1', title: 'Backlog / Triagem', order: 0 },
      { id: 'col-2', title: 'Em Análise', order: 1 },
      { id: 'col-3', title: 'Aguardando Validação', order: 2 },
      { id: 'col-4', title: 'Concluído', order: 3 },
    ],
    tasks: [],
    meetings: [],
  }
];

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: INITIAL_DATA,
  activeBoardId: 'board-1',
  viewMode: 'board',
  currentModule: 'kanban',
  
  isSyncing: false,
  lastSync: null,

  filters: {
    query: '',
    priority: null,
    strategicDimension: null,
    assignee: null,
    dateRange: null,
  },

  loadData: async () => {
    set({ isSyncing: true });
    try {
      const boards = await fetchBoardFromApi();
      if (boards && boards.length > 0) {
        set({ boards, isSyncing: false, lastSync: new Date() });
      } else {
        set({ isSyncing: false }); // Keep initial data if empty
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isSyncing: false });
    }
  },

  syncData: async () => {
    const { boards } = get();
    set({ isSyncing: true });
    try {
      console.log('[Store] Syncing data to server...');
      // Assuming single board for now
      await saveBoardToApi(boards[0]);
      console.log('[Store] Sync success');
      set({ isSyncing: false, lastSync: new Date() });
    } catch (error) {
      console.error('[Store] Failed to sync data:', error);
      set({ isSyncing: false });
      alert('Erro ao salvar dados no servidor. Verifique o console.');
    }
  },

  setViewMode: (mode: 'board' | 'list') => set({ viewMode: mode }),
  setCurrentModule: (module: 'kanban' | 'meetings' | 'team') => set({ currentModule: module }),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),

  setActiveBoard: (boardId) => set({ activeBoardId: boardId }),

  addAuthor: (author) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        
        const newAuthor: Author = {
          id: uuidv4(),
          name: author.name || 'Novo Membro',
          email: author.email || '',
          role: author.role || '',
          avatar: author.avatar || '',
          ...author
        };
        
        return { ...board, authors: [...(board.authors || []), newAuthor] };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  updateAuthor: (authorId, updates) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        return {
          ...board,
          authors: (board.authors || []).map((a) => a.id === authorId ? { ...a, ...updates } : a)
        };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  deleteAuthor: (authorId) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        return {
          ...board,
          authors: (board.authors || []).filter((a) => a.id !== authorId)
        };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  addTask: (columnId, task) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        
        const newTask: Task = {
          id: uuidv4(),
          columnId,
          title: task.title || 'Nova Tarefa',
          description: task.description || '',
          priority: task.priority || 'medium',
          tags: task.tags || [],
          assignees: task.assignees || [],
          dueDate: task.dueDate,
          checklist: [],
          comments: [],
          createdAt: new Date().toISOString(),
          strategicDimension: task.strategicDimension,
          strategicObjective: task.strategicObjective,
          ...task
        };
        
        return { ...board, tasks: [...board.tasks, newTask] };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        return {
          ...board,
          tasks: board.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
        };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  moveTask: (taskId, targetColumnId) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        return {
          ...board,
          tasks: board.tasks.map((t) => t.id === taskId ? { ...t, columnId: targetColumnId } : t)
        };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  deleteTask: (taskId) => {
    console.log('[deleteTask] Attempting to delete task:', taskId);
    set((state) => {
      // Find the board to update (active or first)
      const boardIndex = state.boards.findIndex(b => b.id === state.activeBoardId);
      const targetIndex = boardIndex >= 0 ? boardIndex : 0;
      const targetBoard = state.boards[targetIndex];

      if (!targetBoard) {
        console.error('[deleteTask] No board found');
        return state;
      }

      console.log('[deleteTask] Target board:', targetBoard.id);
      console.log('[deleteTask] Task count before:', targetBoard.tasks.length);

      const updatedTasks = targetBoard.tasks.filter((t) => t.id !== taskId);
      
      console.log('[deleteTask] Task count after:', updatedTasks.length);

      if (updatedTasks.length === targetBoard.tasks.length) {
        console.warn('[deleteTask] Task not found in board');
      }

      const newBoards = [...state.boards];
      newBoards[targetIndex] = {
        ...targetBoard,
        tasks: updatedTasks
      };

      return { boards: newBoards };
    });
    
    // Trigger sync
    get().syncData().then(() => {
        console.log('[deleteTask] Sync completed');
    }).catch(err => {
        console.error('[deleteTask] Sync failed:', err);
    });
  },

  addColumn: (title) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        const newColumn: Column = {
          id: uuidv4(),
          title,
          order: board.columns.length,
          color: 'bg-slate-100/50' // Default color
        };
        return { ...board, columns: [...board.columns, newColumn] };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  updateColumn: (columnId, updates) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        return {
          ...board,
          columns: board.columns.map((c) => c.id === columnId ? { ...c, ...updates } : c)
        };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  deleteColumn: (columnId) => {
    console.log('[Store] deleteColumn called for:', columnId);
    set((state) => {
      const newBoards = state.boards.map(board => {
        // Check if this board has the column
        if (!board.columns.some(c => c.id === columnId)) return board;

        console.log(`[Store] Found column in board ${board.id}. Removing...`);
        
        return {
          ...board,
          columns: board.columns.filter(c => c.id !== columnId),
          tasks: board.tasks.filter(t => t.columnId !== columnId)
        };
      });
      
      return { boards: newBoards };
    });
    
    // Sync immediately
    get().syncData();
  },

  addMeeting: (meeting) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        
        const newMeeting: Meeting = {
          id: uuidv4(),
          title: meeting.title || 'Nova Reunião',
          date: meeting.date || new Date().toISOString().split('T')[0],
          time: meeting.time || '09:00',
          location: meeting.location || '',
          agenda: meeting.agenda || '',
          participants: meeting.participants || [],
          notes: meeting.notes || '',
          createdAt: new Date().toISOString(),
          ...meeting
        };
        
        return { ...board, meetings: [...(board.meetings || []), newMeeting] };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  updateMeeting: (meetingId, updates) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        return {
          ...board,
          meetings: (board.meetings || []).map((m) => m.id === meetingId ? { ...m, ...updates } : m)
        };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },

  deleteMeeting: (meetingId) => {
    set((state) => {
      const newBoards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board;
        return {
          ...board,
          meetings: (board.meetings || []).filter((m) => m.id !== meetingId)
        };
      });
      return { boards: newBoards };
    });
    get().syncData();
  },
}));
