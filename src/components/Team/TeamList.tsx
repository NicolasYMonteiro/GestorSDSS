import React, { useState } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { Author } from '../../types/kanban';
import { Plus, Search, Mail, Briefcase, Trash2, Edit2, User, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TeamList() {
  const { boards, activeBoardId, addAuthor, updateAuthor, deleteAuthor } = useBoardStore();
  const activeBoard = boards.find(b => b.id === activeBoardId);
  const authors = activeBoard?.authors || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
      deleteAuthor(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipe</h1>
          <p className="text-slate-500 text-sm">Gerencie os membros e colaboradores do projeto</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar membro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-64"
            />
          </div>
          
          <button 
            onClick={() => { setEditingAuthor(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Membro
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredAuthors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAuthors.map(author => (
              <div key={author.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 group relative">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={() => handleEdit(author)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(author.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 mb-4 border-4 border-slate-50 shadow-inner">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      author.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{author.name}</h3>
                  <p className="text-blue-600 text-sm font-medium mb-4 bg-blue-50 px-3 py-1 rounded-full">
                    {author.role || 'Membro da Equipe'}
                  </p>
                  
                  <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2 text-sm text-slate-500">
                    {author.email && (
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{author.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-600">Nenhum membro encontrado</p>
            <p className="text-sm">Adicione novos membros para começar a gerenciar sua equipe.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AuthorModal 
          author={editingAuthor} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => {
            if (editingAuthor) {
              updateAuthor(editingAuthor.id, data);
            } else {
              addAuthor(data);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface AuthorModalProps {
  author: Author | null;
  onClose: () => void;
  onSave: (data: Partial<Author>) => void;
}

function AuthorModal({ author, onClose, onSave }: AuthorModalProps) {
  const [formData, setFormData] = useState<Partial<Author>>({
    name: author?.name || '',
    email: author?.email || '',
    role: author?.role || '',
    avatar: author?.avatar || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            {author ? 'Editar Membro' : 'Novo Membro'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Função</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                placeholder="Ex: Desenvolvedor Frontend"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                placeholder="Ex: joao@exemplo.com"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium border border-transparent"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-sm shadow-blue-600/20"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
