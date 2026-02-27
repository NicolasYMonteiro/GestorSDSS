import { Board } from '../types/kanban';

export async function fetchBoardFromApi(): Promise<Board[]> {
  const response = await fetch('/api/sync');
  if (!response.ok) {
    throw new Error('Failed to fetch data from server');
  }
  const data = await response.json();
  return data.boards;
}

export async function saveBoardToApi(board: Board): Promise<void> {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ board }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save data to server');
  }
}
