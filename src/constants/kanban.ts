import { Priority, Tag } from '../types/kanban';

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

export const TAG_LABELS: Record<Tag, string> = {
  vigilancia: 'Vigilância',
  regulacao: 'Regulação',
  adm: 'Administrativo',
  comunicacao: 'Comunicação',
  ti: 'TI',
};

export const TAG_COLORS: Record<Tag, string> = {
  vigilancia: 'bg-emerald-100 text-emerald-700',
  regulacao: 'bg-purple-100 text-purple-700',
  adm: 'bg-slate-100 text-slate-700',
  comunicacao: 'bg-pink-100 text-pink-700',
  ti: 'bg-cyan-100 text-cyan-700',
};
