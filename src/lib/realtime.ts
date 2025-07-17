import { useState, useEffect } from 'react';

interface Participant {
  id: string;
  name: string;
  currentStreak: number;
  totalFailures: number;
  lastActivity: Date;
  joinDate: Date;
  achievements: string[];
  isOnline: boolean;
}

interface RealtimeEvent {
  type: 'participant_joined' | 'participant_updated' | 'participant_left' | 'stats_updated';
  data: any;
  timestamp: Date;
}

// Глобальная база данных участников (имитация реального времени)
const STORAGE_KEY = 'valera_challenge_participants';
const EVENTS_KEY = 'valera_challenge_events';

class RealtimeManager {
  private participants: Map<string, Participant> = new Map();
  private listeners: ((event: RealtimeEvent) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadParticipants();
    this.startPeriodicSync();
  }

  // Подписка на события
  subscribe(callback: (event: RealtimeEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Отправка события всем подписчикам
  private emit(event: RealtimeEvent) {
    this.listeners.forEach(callback => callback(event));
    this.saveEvent(event);
  }

  // Загрузка участников из localStorage
  private loadParticipants() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.participants = new Map(
          data.map((p: any) => [p.id, {
            ...p,
            lastActivity: new Date(p.lastActivity),
            joinDate: new Date(p.joinDate)
          }])
        );
      }
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    }
  }

  // Сохранение участников в localStorage
  private saveParticipants() {
    try {
      const data = Array.from(this.participants.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка сохранения участников:', error);
    }
  }

  // Сохранение события
  private saveEvent(event: RealtimeEvent) {
    try {
      const events = this.getRecentEvents();
      events.push(event);
      // Храним только последние 100 событий
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Ошибка сохранения события:', error);
    }
  }

  // Получение недавних событий
  getRecentEvents(): RealtimeEvent[] {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (stored) {
        return JSON.parse(stored).map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    }
    return [];
  }

  // Добавление нового участника
  addParticipant(name: string): string {
    const id = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const participant: Participant = {
      id,
      name,
      currentStreak: 0,
      totalFailures: 0,
      lastActivity: new Date(),
      joinDate: new Date(),
      achievements: [],
      isOnline: true
    };

    this.participants.set(id, participant);
    this.saveParticipants();
    
    this.emit({
      type: 'participant_joined',
      data: participant,
      timestamp: new Date()
    });

    return id;
  }

  // Обновление участника
  updateParticipant(id: string, updates: Partial<Participant>) {
    const participant = this.participants.get(id);
    if (participant) {
      const updated = { 
        ...participant, 
        ...updates, 
        lastActivity: new Date(),
        isOnline: true 
      };
      this.participants.set(id, updated);
      this.saveParticipants();
      
      this.emit({
        type: 'participant_updated',
        data: updated,
        timestamp: new Date()
      });
    }
  }

  // Получение участника
  getParticipant(id: string): Participant | undefined {
    return this.participants.get(id);
  }

  // Получение всех участников
  getAllParticipants(): Participant[] {
    return Array.from(this.participants.values());
  }

  // Получение статистики
  getStats() {
    const participants = this.getAllParticipants();
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return {
      totalParticipants: participants.length,
      activeParticipants: participants.filter(p => p.lastActivity > fiveMinutesAgo).length,
      avgStreak: participants.length > 0 ? 
        Math.round(participants.reduce((sum, p) => sum + p.currentStreak, 0) / participants.length) : 0,
      topStreak: Math.max(...participants.map(p => p.currentStreak), 0),
      totalFailures: participants.reduce((sum, p) => sum + p.totalFailures, 0)
    };
  }

  // Периодическая синхронизация
  private startPeriodicSync() {
    this.updateInterval = setInterval(() => {
      // Обновляем статус онлайн участников
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      let hasUpdates = false;
      this.participants.forEach((participant, id) => {
        if (participant.isOnline && participant.lastActivity < fiveMinutesAgo) {
          participant.isOnline = false;
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        this.saveParticipants();
        this.emit({
          type: 'stats_updated',
          data: this.getStats(),
          timestamp: new Date()
        });
      }
    }, 30000); // Каждые 30 секунд
  }

  // Пинг активности
  pingActivity(id: string) {
    const participant = this.participants.get(id);
    if (participant) {
      participant.lastActivity = new Date();
      participant.isOnline = true;
      this.saveParticipants();
    }
  }

  // Очистка
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.listeners = [];
  }
}

// Синглтон для управления реальным временем
export const realtimeManager = new RealtimeManager();

// Хук для подписки на события
export function useRealtime() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState(() => realtimeManager.getStats());
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    // Начальная загрузка
    setParticipants(realtimeManager.getAllParticipants());
    setEvents(realtimeManager.getRecentEvents().slice(-10)); // Последние 10 событий

    // Подписка на обновления
    const unsubscribe = realtimeManager.subscribe((event) => {
      switch (event.type) {
        case 'participant_joined':
        case 'participant_updated':
        case 'participant_left':
          setParticipants(realtimeManager.getAllParticipants());
          setStats(realtimeManager.getStats());
          break;
        case 'stats_updated':
          setStats(event.data);
          break;
      }
      
      // Обновляем события
      setEvents(prev => [...prev.slice(-9), event]);
    });

    return unsubscribe;
  }, []);

  return {
    participants,
    stats,
    events,
    addParticipant: realtimeManager.addParticipant.bind(realtimeManager),
    updateParticipant: realtimeManager.updateParticipant.bind(realtimeManager),
    getParticipant: realtimeManager.getParticipant.bind(realtimeManager),
    pingActivity: realtimeManager.pingActivity.bind(realtimeManager)
  };
}

export default RealtimeManager;
export type { Participant, RealtimeEvent };