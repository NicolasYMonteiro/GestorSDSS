import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, FileText, Plus, Trash2 } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { Meeting } from '../../types/kanban';

interface MeetingModalProps {
  meetingId: string | null;
  onClose: () => void;
}

export function MeetingModal({ meetingId, onClose }: MeetingModalProps) {
  const { boards, activeBoardId, addMeeting, updateMeeting } = useBoardStore();
  
  const activeBoard = boards.find(b => b.id === activeBoardId);
  const meeting = meetingId 
    ? activeBoard?.meetings?.find(m => m.id === meetingId)
    : null;
  const authors = activeBoard?.authors || [];
  const [showAuthorSelect, setShowAuthorSelect] = useState(false);

  const [formData, setFormData] = useState<Partial<Meeting>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    agenda: '',
    participants: [],
    notes: ''
  });

  const [newParticipant, setNewParticipant] = useState('');

  useEffect(() => {
    if (meeting) {
      setFormData(meeting);
    }
  }, [meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId) {
      updateMeeting(meetingId, formData);
    } else {
      addMeeting(formData);
    }
    onClose();
  };

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.trim()) return;
    setFormData(prev => ({
      ...prev,
      participants: [...(prev.participants || []), newParticipant.trim()]
    }));
    setNewParticipant('');
  };

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: (prev.participants || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            {meetingId ? 'Editar Reunião' : 'Nova Reunião'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="meeting-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título da Reunião</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                placeholder="Ex: Reunião Semanal de Planejamento"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Horário
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Local / Link
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                placeholder="Sala de Reuniões 1 ou Link do Meet"
              />
            </div>

            {/* Agenda */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Pauta
              </label>
              <textarea
                value={formData.agenda}
                onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-y"
                placeholder="Principais tópicos a serem discutidos..."
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Users className="w-4 h-4" /> Participantes
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.participants?.map((p, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                    {p}
                    <button type="button" onClick={() => removeParticipant(index)} className="text-slate-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newParticipant}
                    onChange={e => setNewParticipant(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm"
                    placeholder="Nome do participante"
                    onKeyDown={e => e.key === 'Enter' && addParticipant(e)}
                    onFocus={() => setShowAuthorSelect(true)}
                  />
                  <button 
                    type="button" 
                    onClick={addParticipant}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showAuthorSelect && authors.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-100 z-20 max-h-40 overflow-y-auto">
                    {authors
                      .filter(a => a.name.toLowerCase().includes(newParticipant.toLowerCase()) && !formData.participants?.includes(a.name))
                      .map(author => (
                        <button
                          key={author.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              participants: [...(prev.participants || []), author.name]
                            }));
                            setNewParticipant('');
                            setShowAuthorSelect(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {author.name.substring(0, 2).toUpperCase()}
                          </div>
                          {author.name}
                        </button>
                      ))}
                  </div>
                )}
                
                {/* Overlay to close dropdown */}
                {showAuthorSelect && (
                  <div className="fixed inset-0 z-10" onClick={() => setShowAuthorSelect(false)} />
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Anotações / Ata
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-y"
                placeholder="Registro de decisões e anotações durante a reunião..."
              />
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="meeting-form"
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            {meetingId ? 'Salvar Alterações' : 'Criar Reunião'}
          </button>
        </div>
      </div>
    </div>
  );
}
