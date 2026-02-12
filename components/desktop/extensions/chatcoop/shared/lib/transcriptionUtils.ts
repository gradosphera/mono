export function formatDateTime(dateStr: unknown): string {
  if (typeof dateStr !== 'string' || !dateStr) {
    return '';
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(startStr: unknown, endStr: unknown): string {
  if (typeof startStr !== 'string' || typeof endStr !== 'string' || !startStr || !endStr) {
    return '';
  }
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const diffMs = endDate.getTime() - startDate.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  if (minutes > 0) {
    return `${minutes} мин ${seconds} сек`;
  }
  return `${seconds} сек`;
}

export function getStatusColor(status: unknown): string {
  const s = String(status);
  switch (s) {
    case 'active':
      return 'positive';
    case 'completed':
      return 'primary';
    case 'failed':
      return 'negative';
    default:
      return 'grey';
  }
}

export function getStatusLabel(status: unknown): string {
  const s = String(status);
  switch (s) {
    case 'active':
      return 'Активен';
    case 'completed':
      return 'Завершён';
    case 'failed':
      return 'Ошибка';
    default:
      return s;
  }
}

export function getStatusIcon(status: unknown): string {
  const s = String(status);
  switch (s) {
    case 'active':
      return 'fa-solid fa-circle-play';
    case 'completed':
      return 'fa-solid fa-check';
    case 'failed':
      return 'fa-solid fa-xmark';
    default:
      return 'fa-solid fa-phone';
  }
}

export function formatOffset(seconds: unknown): string {
  const secs = Number(seconds);
  if (isNaN(secs)) return '0:00';
  const mins = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${mins}:${s.toString().padStart(2, '0')}`;
}

export function getSpeakerInitials(name: unknown): string {
  const n = String(name || '');
  if (!n) return '?';
  const parts = n.split(/[\s_-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
}
