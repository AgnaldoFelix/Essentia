import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardHeader, CardBody, CardFooter, Chip, Divider } from "@heroui/react";
import { Progress } from "@heroui/react";
import { Clock, Timer, Calendar } from 'lucide-react';

interface FeedingWindowProgressProps {
  selectedPlanId: string;
}

export function FeedingWindowProgress({ selectedPlanId }: FeedingWindowProgressProps) {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [status, setStatus] = useState<'em_andamento' | 'finalizado' | 'fora_janela'>('em_andamento');

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Horário de início (7h00)
      const startTime = 7 * 60;
      
      // Horário final depende do plano
      const endTime = selectedPlanId === 'plan-15h' ? 15 * 60 : 18 * 60;
      
      // Calcular progresso e tempo restante
      const totalMinutes = endTime - startTime;
      const elapsedMinutes = Math.max(0, currentTimeInMinutes - startTime);
      const remainingMinutes = Math.max(0, endTime - currentTimeInMinutes);
      
      const progress = Math.min(100, (elapsedMinutes / totalMinutes) * 100);
      
      // Atualizar status
      if (currentTimeInMinutes < startTime) {
        setStatus('fora_janela');
      } else if (currentTimeInMinutes > endTime) {
        setStatus('finalizado');
      } else {
        setStatus('em_andamento');
      }
      
      // Formatar tempo restante
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      setTimeRemaining(`${hours}h${minutes}min`);
      
      setProgress(progress);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000);
    return () => clearInterval(interval);
  }, [selectedPlanId]);

  return (
    <div className="flex w-full flex-col">
      <Card className="w-full">
        <CardHeader className="flex gap-3 border-b p-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Timer className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Janela de Alimentação</p>
            <p className="text-small text-default-500">
              {selectedPlanId === 'plan-15h' ? 'Plano até 15h' : 'Plano até 18h'}
            </p>
          </div>
        </CardHeader>
        <CardBody className="py-4">
          <Tabs aria-label="Opções de Monitoramento">
            <Tab 
              key="progresso" 
              title={
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Progresso</span>
                </div>
              }
            >
              <Card>
                <CardBody className="gap-6">
                  <div className="flex justify-between items-center">
                    <Chip
                      color={
                        status === 'em_andamento' 
                          ? 'success' 
                          : status === 'finalizado' 
                            ? 'danger' 
                            : 'warning'
                      }
                      className="h-7"
                    >
                      {status === 'em_andamento' 
                        ? '⏳ Em andamento' 
                        : status === 'finalizado'
                          ? '🏁 Finalizado'
                          : '⏰ Aguardando início'
                      }
                    </Chip>
                    {status === 'em_andamento' && (
                      <Chip variant="flat" color="primary" className="h-7">
                        ⏰ Restante: {timeRemaining}
                      </Chip>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Progress
                      aria-label="Progresso da janela"
                      className="w-full"
                      color={progress >= 80 ? 'danger' : progress >= 50 ? 'warning' : 'success'}
                      showValueLabel={true}
                      size="md"
                      value={Math.round(progress)}
                    />
                    
                    <div className="flex justify-between items-center text-sm text-default-500">
                      <span>Início: 7h00</span>
                      <span>
                        Término: {selectedPlanId === 'plan-15h' ? '15h00' : '18h00'}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab 
              key="detalhes" 
              title={
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Detalhes</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-default-500">Horário de Início</span>
                      <span className="font-semibold">7:00</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between items-center">
                      <span className="text-default-500">Horário de Término</span>
                      <span className="font-semibold">
                        {selectedPlanId === 'plan-15h' ? '15:00' : '18:00'}
                      </span>
                    </div>
                    <Divider />
                    <div className="flex justify-between items-center">
                      <span className="text-default-500">Duração Total</span>
                      <span className="font-semibold">
                        {selectedPlanId === 'plan-15h' ? '8h' : '11h'}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
