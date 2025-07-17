import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';

interface Participant {
  id: string;
  name: string;
  currentDays: number;
  bestRecord: number;
  totalResets: number;
  joinedAt: string;
  lastResetAt: string | null;
}

interface Achievement {
  level: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requiredDays: number;
}

const achievements: Achievement[] = [
  { level: 'bronze', title: 'Бронзовый старт', description: 'Первая неделя без упоминания Валеры', icon: 'Medal', color: 'bg-amber-600', requiredDays: 7 },
  { level: 'silver', title: 'Серебряная выдержка', description: 'Две недели молчания', icon: 'Award', color: 'bg-gray-400', requiredDays: 14 },
  { level: 'gold', title: 'Золотая стойкость', description: 'Три недели без срывов', icon: 'Crown', color: 'bg-yellow-500', requiredDays: 21 },
  { level: 'platinum', title: 'Платиновая дисциплина', description: 'Месяц железной воли', icon: 'Star', color: 'bg-slate-600', requiredDays: 28 },
  { level: 'diamond', title: 'Алмазная стойкость', description: 'Пять недель совершенства', icon: 'Gem', color: 'bg-blue-600', requiredDays: 35 },
];

const Index = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('valeraCounter');
    if (saved) {
      setParticipants(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('valeraCounter', JSON.stringify(participants));
  }, [participants]);

  const addParticipant = () => {
    if (!newParticipantName.trim()) return;
    
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      currentDays: 0,
      bestRecord: 0,
      totalResets: 0,
      joinedAt: new Date().toISOString(),
      lastResetAt: null,
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    setNewParticipantName('');
    setIsDialogOpen(false);
    toast({
      title: 'Участник добавлен',
      description: `${newParticipant.name} присоединился к челленджу!`,
    });
  };

  const resetCounter = (participantId: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === participantId) {
        const newBestRecord = Math.max(p.bestRecord, p.currentDays);
        return {
          ...p,
          currentDays: 0,
          bestRecord: newBestRecord,
          totalResets: p.totalResets + 1,
          lastResetAt: new Date().toISOString(),
        };
      }
      return p;
    }));
    
    const participant = participants.find(p => p.id === participantId);
    toast({
      title: 'Счетчик сброшен',
      description: `${participant?.name} упомянул Валеру. Счетчик обнулен.`,
    });
  };

  const getAchievement = (days: number): Achievement | null => {
    for (let i = achievements.length - 1; i >= 0; i--) {
      if (days >= achievements[i].requiredDays) {
        return achievements[i];
      }
    }
    return null;
  };

  const getTopParticipant = () => {
    if (participants.length === 0) return null;
    return participants.reduce((max, current) => 
      current.currentDays > max.currentDays ? current : max
    );
  };

  const topParticipant = getTopParticipant();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Счетчик дней без упоминания Валеры
          </h1>
          <p className="text-slate-600">
            Челлендж на самоконтроль и дисциплину
          </p>
        </div>

        <Tabs defaultValue="counter" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="counter">Счетчик</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="counter" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">Участники</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Добавить участника
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новый участник</DialogTitle>
                    <DialogDescription>
                      Введите имя участника для добавления в челлендж
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Имя участника</Label>
                      <Input
                        id="name"
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        placeholder="Введите имя"
                        onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                      />
                    </div>
                    <Button onClick={addParticipant} className="w-full">
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {participants.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">Пока нет участников</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Добавьте первого участника для начала челленджа
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {participants.map(participant => {
                  const achievement = getAchievement(participant.currentDays);
                  return (
                    <Card key={participant.id} className="relative overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{participant.name}</CardTitle>
                            <CardDescription>
                              Присоединился {new Date(participant.joinedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-slate-800">
                              {participant.currentDays}
                            </div>
                            <div className="text-sm text-slate-500">
                              {participant.currentDays === 1 ? 'день' : 
                               participant.currentDays < 5 ? 'дня' : 'дней'}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            {achievement && (
                              <Badge className={`${achievement.color} text-white`}>
                                <Icon name={achievement.icon as any} size={12} className="mr-1" />
                                {achievement.title}
                              </Badge>
                            )}
                            <Badge variant="outline">
                              Рекорд: {participant.bestRecord}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => resetCounter(participant.id)}
                          >
                            <Icon name="RotateCcw" size={16} className="mr-2" />
                            Сбросить
                          </Button>
                        </div>
                        <div className="bg-slate-100 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((participant.currentDays / 7) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <div className="text-xs text-slate-500">
                          {participant.currentDays < 7 
                            ? `${7 - participant.currentDays} дней до первого достижения`
                            : `${participant.currentDays} дней без упоминания`
                          }
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Trophy" size={20} />
                    Лидер
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topParticipant ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-600 mb-2">
                        {topParticipant.name}
                      </div>
                      <div className="text-2xl text-slate-600 mb-4">
                        {topParticipant.currentDays} дней
                      </div>
                      {getAchievement(topParticipant.currentDays) && (
                        <Badge className={`${getAchievement(topParticipant.currentDays)!.color} text-white`}>
                          <Icon name={getAchievement(topParticipant.currentDays)!.icon as any} size={12} className="mr-1" />
                          {getAchievement(topParticipant.currentDays)!.title}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      Нет участников
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Award" size={20} />
                    Достижения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {achievements.map(achievement => (
                      <div key={achievement.level} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <div className={`w-10 h-10 rounded-full ${achievement.color} flex items-center justify-center`}>
                          <Icon name={achievement.icon as any} size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-slate-500">{achievement.description}</div>
                        </div>
                        <div className="text-sm text-slate-500">
                          {achievement.requiredDays} дней
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BarChart3" size={20} />
                    Рекорды
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length > 0 ? (
                    <div className="space-y-3">
                      {participants
                        .sort((a, b) => b.bestRecord - a.bestRecord)
                        .map((participant, index) => (
                          <div key={participant.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium">{participant.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{participant.bestRecord} дней</div>
                              <div className="text-sm text-slate-500">
                                Срывов: {participant.totalResets}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      Нет данных о рекордах
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;