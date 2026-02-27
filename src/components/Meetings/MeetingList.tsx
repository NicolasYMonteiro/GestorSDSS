import React, { useState } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { Calendar, Clock, MapPin, Users, FileText, Plus, Search, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MeetingModal } from './MeetingModal';

export function MeetingList() {
  const { boards, activeBoardId, deleteMeeting } = useBoardStore();
  const activeBoard = boards.find(b => b.id === activeBoardId);
  const meetings = activeBoard?.meetings || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.agenda.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta reunião?')) {
      deleteMeeting(id);
    }
  };

  const handleEdit = (id: string) => {
    setEditingMeetingId(id);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingMeetingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">Reuniões</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar reuniões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 w-64"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Reunião
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map(meeting => (
            <div key={meeting.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{meeting.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(meeting.date), "dd 'de' MMMM", { locale: ptBR })}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <Clock className="w-4 h-4" />
                    <span>{meeting.time}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(meeting.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(meeting.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <span>{meeting.location || 'Local não definido'}</span>
                </div>
                
                {meeting.agenda && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Pauta
                    </div>
                    <p className="line-clamp-3">{meeting.agenda}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>{meeting.participants.length} participantes</span>
                </div>
                <div className="flex -space-x-2">
                  {meeting.participants.slice(0, 4).map((p, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={p}>
                      {p.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {meeting.participants.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                      +{meeting.participants.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredMeetings.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhuma reunião encontrada.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <MeetingModal 
          meetingId={editingMeetingId} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
