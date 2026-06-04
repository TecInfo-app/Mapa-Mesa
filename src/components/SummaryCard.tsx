import { Utensils, Users, Armchair, Info, Sparkles } from 'lucide-react';
import { Table } from '../types';

interface SummaryCardProps {
  selectedTable: Table;
  guestsCount?: number;
}

export function SummaryCard({ selectedTable, guestsCount = 4 }: SummaryCardProps) {
  if (!selectedTable) {
    return (
      <div className="w-full lg:w-96 select-none bg-surface-container-lowest p-6 rounded-xl border border-outline border-dashed flex items-center justify-center text-xs text-on-surface-variant font-semibold">
        Selecione uma mesa no mapa...
      </div>
    );
  }

  const bookingFeeValue = selectedTable.bookingFee || 0;
  const formattedFee = bookingFeeValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <div className="w-full lg:w-96 select-none">
      <div className="sticky top-24 space-y-6 animate-fade-in">
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-md border border-outline-variant">
          {/* Visual Header */}
          <div className="h-32 bg-secondary relative wood-texture overflow-hidden">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" 
              alt="A warm and inviting interior of a high-end Brazilian steakhouse during the São João festival." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuButCJ4beXgnTEUX1pCV90njxF13p55AMguGmPpBJR9wHaARUYcJhSypiYRMC_R9kRU1dFJlAwua4ECef4-3BkSuum7zwSuKgh1jKRb7Vhyz-viTbHA9k0n4IpaDg0Q0kT206D7RBkzrohj1MXBjDL5SdV8N6cgGDhwJTEcVI9z9kPk1-3YtzMwuO-_fu4G8ZbkrJ1ervhAd8bkHDmingqahGFmMQN-8rcumXRWSDIPCaysfXAoRaqYtoxGzF0JcUebmi5j-Gu0B2o"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent z-0"></div>
            <div className="absolute bottom-4 left-6 flex items-center gap-3 z-10">
              <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center gold-glow">
                <Utensils className="w-6 h-6 text-on-primary-container" strokeWidth={2.5} />
              </div>
              <h3 className="text-on-secondary text-base md:text-lg font-bold tracking-tight">Resumo da Mesa</h3>
            </div>
          </div>
          
          {/* Card Details */}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Localização</p>
                <p className="text-lg md:text-xl font-bold text-on-surface mt-1">{selectedTable.name} - {selectedTable.area}</p>
              </div>
              {selectedTable.isVip ? (
                <span className="shrink-0 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current" /> VIP
                </span>
              ) : (
                <span className="shrink-0 bg-surface-container text-on-surface p-1 px-3.5 rounded-full text-[10px] font-bold uppercase tracking-wider">COMUM</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface-container rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Capacidade</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  <span className="text-xs font-bold">Até {selectedTable.capacity} pessoas</span>
                </div>
              </div>
              <div className="p-3 bg-surface-container rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Tipo</p>
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  <span className="text-xs font-bold">{selectedTable.type}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-outline-variant pt-4 space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
                <span>Taxa de Reserva</span>
                <span>{selectedTable.bookingFee === 0 ? 'Grátis' : formattedFee}</span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
                <span>Convidados Selecionados</span>
                <span>{guestsCount} {guestsCount === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-secondary border-t border-dashed border-outline-variant/60 pt-3 mt-1">
                <span>Total</span>
                <span>{selectedTable.bookingFee === 0 ? 'R$ 0,00' : formattedFee}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="p-4 bg-tertiary-container/30 border border-outline-variant rounded-xl flex gap-4 items-start">
          <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Sua reserva será garantida por até 15 minutos após o horário agendado. Em caso de atrasos, por favor entre em contato.
          </p>
        </div>
      </div>
    </div>
  );
}
