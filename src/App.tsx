import React, { useEffect } from 'react';
import { Sidebar, Header } from './components/Layout/Layout';
import { KanbanBoard } from './components/Board/KanbanBoard';
import { MeetingList } from './components/Meetings/MeetingList';
import { TeamList } from './components/Team/TeamList';
import { useBoardStore } from './store/useBoardStore';

export default function App() {
  const { loadData, currentModule } = useBoardStore();

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          {currentModule === 'kanban' && <KanbanBoard />}
          {currentModule === 'meetings' && <MeetingList />}
          {currentModule === 'team' && <TeamList />}
        </main>
      </div>
    </div>
  );
}
