import { Reservation, Table } from '../types';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trash2, 
  CheckCircle2, 
  Ticket, 
  QrCode, 
  Printer, 
  Coins, 
  UserCheck, 
  CreditCard 
} from 'lucide-react';

interface ReservationsViewProps {
  reservations: Reservation[];
  tables: Table[];
  onCancelReservation: (id: string) => void;
  onEditReservation: (id: string) => void;
  onGoToMap: () => void;
  storeName: string;
  eventName: string;
}

export function ReservationsView({ 
  reservations, 
  tables, 
  onCancelReservation, 
  onEditReservation,
  onGoToMap,
  storeName,
  eventName 
}: ReservationsViewProps) {
  const activeReservations = reservations.filter(r => r.status === 'confirmed');

  // Calculates financial balances safely
  const sumOfBookingFees = activeReservations.reduce((acc, r) => {
    return acc + (r.bookingFeeCharged ?? r.total ?? 0);
  }, 0);

  const sumOfCommissions = activeReservations.reduce((acc, r) => {
    return acc + (r.agentCommission ?? 0);
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      
      {/* SCREEN-ONLY VIEWPORT: This header and list hides during window.print() */}
      <div className="print:hidden space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2 tracking-tight">🎫 Minhas Reservas</h1>
            <p className="text-sm text-on-surface-variant">
              Acompanhe ou gerencie suas mesas reservadas para o <strong>{eventName} do {storeName}</strong>.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeReservations.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-outline hover:bg-surface-container-high text-on-surface-variant font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                title="Imprimir Relatório de Vendas Consolidado"
              >
                <Printer className="w-4 h-4" /> Relatório 🖨️
              </button>
            )}
            
            <button
              onClick={onGoToMap}
              className="px-4 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:brightness-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              Novo Registro 🎪
            </button>
          </div>
        </div>

        {/* FINANCIAL METRICS SUMMARY BAR inside screen */}
        {activeReservations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary-container/10 border border-secondary/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-secondary-container/70 uppercase">Total das Mesas (Soma)</p>
                <p className="text-base font-extrabold text-on-surface">R$ {sumOfBookingFees.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-primary-container/70 uppercase">Comissões Devidas (Responsáveis)</p>
                <p className="text-base font-extrabold text-red-500">R$ {sumOfCommissions.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-105 text-green-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-800 uppercase">Saldo Estimado Líquido</p>
                <p className="text-base font-extrabold text-green-700">R$ {(sumOfBookingFees - sumOfCommissions).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE RESERVATIONS CHECKLISTS */}
        {activeReservations.length === 0 ? (
          <div className="p-8 md:p-12 bg-surface-container-lowest rounded-2xl border border-outline-variant text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Nenhuma reserva ativa encontrada</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Não há reservas salvas no dispositivo. Vamos começar ocupando uma mesa diretamente na planta?
            </p>
            <button
              onClick={onGoToMap}
              className="px-6 py-3 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-98 transition-all shadow-md"
            >
              Escolher Mesa no Mapa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReservations.map(reservation => {
              const displayFee = (reservation.total ?? 0) === 0 ? 'Grátis' : (reservation.total ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });

              return (
                <div 
                  key={reservation.id} 
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow transition-shadow animate-fade-in"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-secondary/15 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {reservation.tableName}
                      </span>
                      <span className="bg-primary/10 text-on-primary-container px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {reservation.area}
                      </span>
                      <span className="bg-green-150 text-green-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide flex items-center gap-1 align-middle">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 fill-current" /> Confirmado
                      </span>
                      
                      {/* Payment Quick Indicator Tag */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${reservation.paymentStatus === 'paid' ? 'bg-green-105 text-green-800' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                        {reservation.paymentStatus === 'paid' ? '✓ Pago' : '⚠ À Pagar'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs md:text-sm pt-1">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-on-surface-variant/70">Data</p>
                          <p className="font-semibold text-on-surface">
                            {new Date(reservation.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-on-surface-variant/70">Horário</p>
                          <p className="font-semibold text-on-surface">{reservation.time}</p>
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Users className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-on-surface-variant/70">Convidados</p>
                          <p className="font-semibold text-on-surface">
                            {reservation.guests} {reservation.guests === 1 ? 'Lugar' : 'Lugares'}
                          </p>
                        </div>
                      </div>

                      {/* Cost */}
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Ticket className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-on-surface-variant/70">Taxa da Mesa</p>
                          <p className="font-bold text-secondary">{displayFee}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Agent Detailed Metadata Panels */}
                    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/45 text-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wide">Cliente</p>
                        <p className="font-bold text-on-surface mt-0.5">{reservation.name}</p>
                        <p className="font-mono text-on-surface-variant">{reservation.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wide">Meio / Método Pago</p>
                        <p className="font-semibold mt-0.5 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
                          {reservation.paymentStatus === 'paid' ? (
                            <span className="capitalize">
                              {reservation.paymentMethod === 'dinheiro' ? 'Dinheiro (Espécie)' : reservation.paymentMethod === 'cartao' ? 'Cartão' : 'PIX'}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant">Pendente</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wide">Responsável da Venda</p>
                        <p className="font-bold mt-0.5 text-secondary">{reservation.agentName || 'Direto / Próprio'}</p>
                        {reservation.agentCommission !== undefined && (
                          <p className="text-[10px] text-on-surface-variant">Comissão: <span className="font-bold font-mono">R$ {reservation.agentCommission.toFixed(2)}</span></p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Voucher Code & Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-outline-variant pt-4 md:pt-0 md:pl-6 gap-4 shrink-0 min-w-[140px]">
                    <div className="text-center">
                      <QrCode className="w-12 h-12 text-on-surface mx-auto cursor-pointer hover:scale-105 transition-transform" />
                      <p className="text-[9px] font-mono font-bold mt-1 uppercase tracking-tight text-on-surface-variant">
                        ID: {reservation.id}
                      </p>
                    </div>

                    <button
                      onClick={() => onEditReservation(reservation.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-secondary border border-secondary/20 hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
                      title="Análise/Edição Completa da Reserva"
                    >
                      <span>⚙️ Editar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja cancelar sua reserva para esta mesa?')) {
                          onCancelReservation(reservation.id);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-error border border-error/20 hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                      title="Cancelar Reserva"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* PRINT-ONLY EMBED: Only visible to the system print outputs */}
      <div className="hidden print:block bg-white text-black p-8 font-sans w-full min-h-screen text-xs">
        <div className="text-center space-y-1.5 border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-black">{storeName}</h1>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">{eventName} — Relatório de Vendas & Comitivas de Mesas</h2>
          <p className="text-[9px] text-gray-500 font-mono">Impresso em: {new Date().toLocaleString('pt-BR')} • Sistema Operacional Interno</p>
        </div>

        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="border-b-2 border-black text-gray-700 font-bold uppercase text-[9px] tracking-wider bg-gray-100">
              <th className="py-2.5 px-2 border border-gray-300">Reserva</th>
              <th className="py-2.5 px-2 border border-gray-300">Setor/Área</th>
              <th className="py-2.5 px-2 border border-gray-300">Cliente</th>
              <th className="py-2.5 px-2 border border-gray-300 font-mono">Contato</th>
              <th className="py-2.5 px-2 border border-gray-300">Pagamento</th>
              <th className="py-2.5 px-2 border border-gray-300">Responsável</th>
              <th className="py-2.5 px-2 border border-gray-300 text-right">Comissão (R$)</th>
              <th className="py-2.5 px-2 border border-gray-300 text-right">Valor Pago (R$)</th>
            </tr>
          </thead>
          <tbody>
            {activeReservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 italic">Não há mesas reservadas no sistema.</td>
              </tr>
            ) : (
              activeReservations.map((r, i) => {
                const bookingFee = r.bookingFeeCharged ?? r.total ?? 0;
                const agentCommission = r.agentCommission ?? 0;
                const payStatusStr = r.paymentStatus === 'paid' ? 'PAGO' : 'PENDENTE';
                const payMethodStr = r.paymentMethod && r.paymentMethod !== 'none' ? r.paymentMethod.toUpperCase() : 'NENHUM';
                const sellerStr = r.agentName || 'Direto / Próprio';

                return (
                  <tr key={i} className="border-b border-gray-300 hover:bg-gray-50 text-[10px]">
                    <td className="py-2 px-2 font-bold border border-gray-200">{r.id} ({r.tableName})</td>
                    <td className="py-2 px-2 border border-gray-200">{r.area}</td>
                    <td className="py-2 px-2 font-semibold border border-gray-200">{r.name}</td>
                    <td className="py-2 px-2 font-mono text-gray-600 border border-gray-200">{r.phone}</td>
                    <td className="py-2 px-2 border border-gray-200">
                      <span className={`font-bold ${r.paymentStatus === 'paid' ? 'text-green-800' : 'text-red-700'}`}>
                        {payStatusStr}
                      </span>
                      <span className="text-[8px] text-gray-500 block">({payMethodStr})</span>
                    </td>
                    <td className="py-2 px-2 border border-gray-200">{sellerStr}</td>
                    <td className="py-2 px-2 text-right font-mono border border-gray-200">R$ {agentCommission.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-bold font-mono text-black border border-gray-200">R$ {bookingFee.toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* SUM TOTALS AT THE END (SOMA DE TUDO NO FINAL) */}
        {activeReservations.length > 0 && (
          <div className="mt-8 pt-4 border-t-2 border-black border-dashed flex flex-col items-end gap-2 text-[11px] leading-relaxed">
            <div className="flex justify-between w-72 border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-650">Total de Mesas Ocupadas:</span>
              <span className="font-extrabold text-black">{activeReservations.length} mesas</span>
            </div>
            
            <div className="flex justify-between w-72 border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-650">Total Comissões dos Vendedores:</span>
              <span className="font-bold text-red-650 font-mono">R$ {sumOfCommissions.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between w-72 border-b-2 border-black pb-1.5 mt-1">
              <span className="font-extrabold text-black uppercase">Faturamento Bruto (Mesas):</span>
              <span className="font-extrabold text-green-800 font-mono text-xs">R$ {sumOfBookingFees.toFixed(2)}</span>
            </div>

            <div className="flex justify-between w-72 pt-1 font-bold">
              <span className="text-black uppercase">Resultado Líquido do Evento:</span>
              <span className="font-black text-black font-mono text-sm underline decoration-double">R$ {(sumOfBookingFees - sumOfCommissions).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="text-center text-[9px] text-gray-400 italic mt-16 border-t border-gray-150 pt-4">
          © {storeName} • {eventName} • Controle Auditado Interno
        </div>
      </div>

    </div>
  );
}
