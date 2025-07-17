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
  avatar?: string;
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
  { level: 'bronze', title: '🥉 Бронзовый старт', description: 'Первая неделя без упоминания Валеры', icon: 'Medal', color: 'bg-gradient-to-r from-amber-400 to-orange-500', requiredDays: 7 },
  { level: 'silver', title: '🥈 Серебряная выдержка', description: 'Две недели молчания', icon: 'Award', color: 'bg-gradient-to-r from-gray-300 to-gray-400', requiredDays: 14 },
  { level: 'gold', title: '🥇 Золотая стойкость', description: 'Три недели без срывов', icon: 'Crown', color: 'bg-gradient-to-r from-yellow-400 to-yellow-500', requiredDays: 21 },
  { level: 'platinum', title: '💎 Платиновая дисциплина', description: 'Месяц железной воли', icon: 'Star', color: 'bg-gradient-to-r from-purple-400 to-purple-600', requiredDays: 28 },
  { level: 'diamond', title: '💠 Алмазная стойкость', description: 'Пять недель совершенства', icon: 'Gem', color: 'bg-gradient-to-r from-cyan-400 to-blue-500', requiredDays: 35 },
];

const Index = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantAvatar, setNewParticipantAvatar] = useState('');
  const [secretWord, setSecretWord] = useState('');
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
    if (!newParticipantName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя участника',
        variant: 'destructive',
      });
      return;
    }
    
    if (secretWord !== 'Валера') {
      toast({
        title: 'Неверное секретное слово',
        description: 'Для добавления участника требуется правильное секретное слово',
        variant: 'destructive',
      });
      return;
    }
    
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      currentDays: 0,
      bestRecord: 0,
      totalResets: 0,
      joinedAt: new Date().toISOString(),
      lastResetAt: null,
      avatar: newParticipantAvatar || undefined,
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    setNewParticipantName('');
    setNewParticipantAvatar('');
    setSecretWord('');
    setIsDialogOpen(false);
    toast({
      title: 'Участник добавлен',
      description: `${newParticipant.name} присоединился к челленджу!`,
    });
  };

  const removeParticipant = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    setParticipants(prev => prev.filter(p => p.id !== participantId));
    toast({
      title: 'Участник удален',
      description: `${participant?.name} покинул челлендж`,
    });
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewParticipantAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(120,_119,_198,_0.1),_transparent)]"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl opacity-20 blur-sm"
              style={{
                backgroundImage: 'url(https://cdn.poehali.dev/files/dd199704-b88b-446d-8a2f-ec86154b553d.jpg)',
                transform: 'scale(1.1)'
              }}
            />
            <h1 className="relative text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse px-8 py-4">
              Счетчик дней без упоминания Валеры
            </h1>
          </div>
          <p className="text-xl text-cyan-200 font-medium">
            🚀 Челлендж на самоконтроль и дисциплину
          </p>
        </div>

        <Tabs defaultValue="counter" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-1">
            <TabsTrigger value="counter" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-cyan-200 font-medium rounded-xl transition-all duration-300 hover:bg-white/10">⚡ Счетчик</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-cyan-200 font-medium rounded-xl transition-all duration-300 hover:bg-white/10">📊 Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="counter" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">👥 Участники</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-xl border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    ✨ Добавить участника
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">🎯 Новый участник</DialogTitle>
                    <DialogDescription className="text-cyan-200">
                      Введите имя участника для добавления в челлендж
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-cyan-200 font-medium">Имя участника</Label>
                      <Input
                        id="name"
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        placeholder="Введите имя"
                        className="bg-white/10 border-2 border-cyan-500/30 text-white placeholder-cyan-300 focus:border-pink-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar" className="text-cyan-200 font-medium">Аватар участника</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="bg-white/10 border-2 border-cyan-500/30 text-white focus:border-pink-500 transition-all duration-300"
                        />
                        {newParticipantAvatar && (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-500 flex-shrink-0">
                            <img src={newParticipantAvatar} alt="Аватар" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secret" className="text-cyan-200 font-medium flex items-center gap-2">
                        🔐 Секретное слово
                        <span className="text-xs text-pink-300">(обязательно)</span>
                      </Label>
                      <Input
                        id="secret"
                        type="password"
                        value={secretWord}
                        onChange={(e) => setSecretWord(e.target.value)}
                        placeholder="Введите секретное слово"
                        onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                        className="bg-white/10 border-2 border-red-500/30 text-white placeholder-red-300 focus:border-pink-500 transition-all duration-300"
                      />
                      <p className="text-xs text-red-300 mt-1">Требуется секретное слово для добавления участника</p>
                    </div>
                    <Button onClick={addParticipant} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-medium rounded-xl">
                      🚀 Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {participants.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl">
                <CardContent className="text-center py-8">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-cyan-400" />
                  <p className="text-cyan-200 text-lg font-medium">🌟 Пока нет участников</p>
                  <p className="text-cyan-300 mt-2">
                    Добавьте первого участника для начала челленджа
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {participants.map(participant => {
                  const achievement = getAchievement(participant.currentDays);
                  return (
                    <Card key={participant.id} className="relative overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-500 flex-shrink-0">
                              {participant.avatar ? (
                                <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                  {participant.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg text-white font-bold">{participant.name}</CardTitle>
                              <CardDescription className="text-cyan-200">
                                🎯 Присоединился {new Date(participant.joinedAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium rounded-lg border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                            <div className="text-right">
                              <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                {participant.currentDays}
                              </div>
                              <div className="text-sm text-cyan-200">
                                {participant.currentDays === 1 ? 'день' : 
                                 participant.currentDays < 5 ? 'дня' : 'дней'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            {achievement && (
                              <Badge className={`${achievement.color} text-white border-0 shadow-lg font-medium`}>
                                <Icon name={achievement.icon as any} size={12} className="mr-1" />
                                {achievement.title}
                              </Badge>
                            )}
                            <Badge className="bg-white/20 text-cyan-200 border-2 border-cyan-500/30 font-medium">
                              🏆 Рекорд: {participant.bestRecord}
                            </Badge>
                          </div>
                          <Button
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium rounded-xl border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            size="sm"
                            onClick={() => resetCounter(participant.id)}
                          >
                            <Icon name="RotateCcw" size={16} className="mr-2" />
                            💥 Сбросить
                          </Button>
                        </div>
                        <div className="bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                            style={{
                              width: `${Math.min((participant.currentDays / 7) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <div className="text-sm text-cyan-200">
                          {participant.currentDays < 7 
                            ? `⏳ ${7 - participant.currentDays} дней до первого достижения`
                            : `🔥 ${participant.currentDays} дней без упоминания`
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
              <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon name="Trophy" size={20} className="text-yellow-400" />
                    🏆 Лидер
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topParticipant ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                        {topParticipant.name}
                      </div>
                      <div className="text-2xl text-cyan-200 mb-4">
                        {topParticipant.currentDays} дней
                      </div>
                      {getAchievement(topParticipant.currentDays) && (
                        <Badge className={`${getAchievement(topParticipant.currentDays)!.color} text-white border-0 shadow-lg font-medium`}>
                          <Icon name={getAchievement(topParticipant.currentDays)!.icon as any} size={12} className="mr-1" />
                          {getAchievement(topParticipant.currentDays)!.title}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-cyan-200">
                      Нет участников
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon name="Award" size={20} className="text-yellow-400" />
                    🏅 Достижения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {achievements.map(achievement => (
                      <div key={achievement.level} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 hover:border-pink-500/50 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-full ${achievement.color} flex items-center justify-center shadow-lg`}>
                          <Icon name={achievement.icon as any} size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{achievement.title}</div>
                          <div className="text-sm text-cyan-200">{achievement.description}</div>
                        </div>
                        <div className="text-sm text-cyan-200 font-medium">
                          {achievement.requiredDays} дней
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon name="BarChart3" size={20} className="text-yellow-400" />
                    📈 Рекорды
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length > 0 ? (
                    <div className="space-y-3">
                      {participants
                        .sort((a, b) => b.bestRecord - a.bestRecord)
                        .map((participant, index) => (
                          <div key={participant.id} className="flex justify-between items-center p-3 rounded-xl bg-white/10 border border-white/20 hover:border-purple-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                                index === 2 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                'bg-gradient-to-r from-purple-400 to-purple-600'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                                {participant.avatar ? (
                                  <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs">
                                    {participant.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-white">{participant.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-cyan-200">{participant.bestRecord} дней</div>
                              <div className="text-sm text-cyan-300">
                                💥 Срывов: {participant.totalResets}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-cyan-200">
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