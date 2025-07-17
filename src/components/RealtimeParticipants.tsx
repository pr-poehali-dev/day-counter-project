import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useRealtime } from '@/lib/realtime';

const RealtimeParticipants = () => {
  const { participants, stats, events } = useRealtime();

  const getStreakColor = (streak: number) => {
    if (streak >= 70) return 'bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600';
    if (streak >= 35) return 'bg-gradient-to-r from-cyan-400 to-blue-500';
    if (streak >= 28) return 'bg-gradient-to-r from-purple-400 to-purple-600';
    if (streak >= 21) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (streak >= 14) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (streak >= 7) return 'bg-gradient-to-r from-amber-400 to-orange-500';
    return 'bg-gray-100';
  };

  const getStreakTitle = (streak: number) => {
    if (streak >= 77) return '⚡ Бог';
    if (streak >= 70) return '🌟 Бессмертный';
    if (streak >= 63) return '⚔️ Ас-доминатор';
    if (streak >= 56) return '🎯 Ас-мастер';
    if (streak >= 49) return '🃏 Ас';
    if (streak >= 42) return '👑 Корона';
    if (streak >= 35) return '💠 Алмазная стойкость';
    if (streak >= 28) return '💎 Платиновая дисциплина';
    if (streak >= 21) return '🥇 Золотая стойкость';
    if (streak >= 14) return '🥈 Серебряная выдержка';
    if (streak >= 7) return '🥉 Бронзовый старт';
    return '🔥 Новичок';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}д назад`;
    if (hours > 0) return `${hours}ч назад`;
    if (minutes > 0) return `${minutes}м назад`;
    return 'только что';
  };

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Общая статистика
            <Badge variant="secondary" className="ml-auto">
              Обновлено {formatTime(new Date())}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalParticipants}</div>
              <div className="text-sm text-gray-600">Участников</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeParticipants}</div>
              <div className="text-sm text-gray-600">Онлайн</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgStreak}</div>
              <div className="text-sm text-gray-600">Средний стрик</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.topStreak}</div>
              <div className="text-sm text-gray-600">Лучший стрик</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.totalFailures}</div>
              <div className="text-sm text-gray-600">Всего срывов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список участников */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Trophy" size={20} />
            Участники челленджа
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participants
              .sort((a, b) => b.currentStreak - a.currentStreak)
              .map((participant) => (
                <div
                  key={participant.id}
                  className={`p-3 rounded-lg border transition-all ${
                    participant.isOnline 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-gray-600">
                          {getStreakTitle(participant.currentStreak)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStreakColor(participant.currentStreak)} text-white`}>
                        <Icon name="Flame" size={14} />
                        {participant.currentStreak} дней
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Срывов: {participant.totalFailures}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Последняя активность: {formatTime(participant.lastActivity)}
                  </div>
                </div>
              ))}
            {participants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Пока нет участников</p>
                <p className="text-sm">Станьте первым!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Лента активности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={20} />
            Лента активности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {events.slice(-10).reverse().map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  event.type === 'participant_joined' ? 'bg-green-500' :
                  event.type === 'participant_updated' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm">
                    {event.type === 'participant_joined' && `${event.data.name} присоединился к челленджу`}
                    {event.type === 'participant_updated' && `${event.data.name} обновил прогресс`}
                    {event.type === 'stats_updated' && 'Статистика обновлена'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Icon name="Activity" size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Пока нет активности</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeParticipants;