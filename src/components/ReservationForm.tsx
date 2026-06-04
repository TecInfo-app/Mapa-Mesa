import { Table, Reservation } from '../types';
import { User, Phone, Calendar, Clock, Minus, Plus, AlertCircle, ArrowLeft, Fuel, Info } from 'lucide-react';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface ReservationFormProps {
  selectedTable: Table;
  guests: number;
  setGuests: (g: number) => void;
  onSubmitReservation: (
    name: string, 
    phone: string, 
    date: string, 
    time: string, 
    guests: number,
    bookingFeeCharged: number,
    paymentStatus: 'paid' | 'pending',
    paymentMethod: 'dinheiro' | 'cartao' | 'pix' | 'none',
    agentName: string,
    agentCommission: number
  ) => void;
  onBackToMap: () => void;
  agentsList: Array<{ name: string, defaultCommission: number }>;
  editingReservation?: Reservation | null;
}

export function ReservationForm({ 
  selectedTable, 
  guests, 
  setGuests, 
  onSubmitReservation, 
  onBackToMap,
  agentsList,
  editingReservation
}: ReservationFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('2025-06-24');
  const [time, setTime] = useState('20:00');
  const [error, setError] = useState('');

  // Internal payment & salesperson metadata state
  const [bookingFeeCharged, setBookingFeeCharged] = useState<number>(selectedTable.bookingFee);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix' | 'none'>('none');
  const [selectedAgentName, setSelectedAgentName] = useState<string>('');
  const [customAgentName, setCustomAgentName] = useState<string>('');
  const [agentCommission, setAgentCommission] = useState<number>(0);

  // Auto sync form on table selection or edit reservation changes
  useEffect(() => {
    if (editingReservation) {
      setName(editingReservation.name || '');
      setPhone(editingReservation.phone || '');
      setDate(editingReservation.date || '2025-06-24');
      setTime(editingReservation.time || '20:00');
      setBookingFeeCharged(editingReservation.bookingFeeCharged ?? editingReservation.total ?? 0);
      setPaymentStatus(editingReservation.paymentStatus || 'pending');
      setPaymentMethod(editingReservation.paymentMethod || 'none');
      setGuests(editingReservation.guests || 1);
      
      const agent = editingReservation.agentName || '';
      if (agent === '' || agent === 'Direto / Próprio') {
        setSelectedAgentName('');
        setCustomAgentName('');
      } else {
        const found = agentsList.find(a => a.name === agent);
        if (found) {
          setSelectedAgentName(agent);
          setCustomAgentName('');
        } else {
          setSelectedAgentName('custom');
          setCustomAgentName(agent);
        }
      }
      setAgentCommission(editingReservation.agentCommission ?? 0);
    } else {
      setName('');
      setPhone('');
      setDate('2025-06-24');
      setTime('20:00');
      setBookingFeeCharged(selectedTable.bookingFee);
      setPaymentStatus('pending');
      setPaymentMethod('none');
      setSelectedAgentName('');
      setCustomAgentName('');
      setAgentCommission(0);
    }
  }, [editingReservation, selectedTable, agentsList, setGuests]);

  // Sync capacity bounds safely
  const increment = () => setGuests(Math.min(guests + 1, selectedTable.capacity));
  const decrement = () => setGuests(Math.max(guests - 1, 1));

  // Quick helper to mask Brazilian phones: (XX) XXXXX-XXXX
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // strip non digits
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    // Apply layout formatting
    if (value.length > 6) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    setPhone(value);
  };

  // Status handler to auto-select payment methods consistently
  const handlePaymentStatusChange = (status: 'paid' | 'pending') => {
    setPaymentStatus(status);
    if (status === 'paid') {
      if (paymentMethod === 'none') {
        setPaymentMethod('pix');
      }
    } else {
      setPaymentMethod('none');
    }
  };

  // Agent change to pull commission value
  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAgentName(val);
    if (val === 'custom') {
      setCustomAgentName('');
      setAgentCommission(0);
    } else if (val === '') {
      setAgentCommission(0);
    } else {
      const found = agentsList.find(a => a.name === val);
      if (found) {
        setAgentCommission(found.defaultCommission);
      }
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    
    // Verify phone length at least 10 chars
    const numericPhone = phone.replace(/\D/g, "");
    if (numericPhone.length < 10) {
      setError('Por favor, informe um telefone de contato válido com DDD.');
      return;
    }

    if (guests > selectedTable.capacity) {
      setError(`O número máximo de convidados para esta mesa é ${selectedTable.capacity} pessoas.`);
      return;
    }

    const finalAgentName = selectedAgentName === 'custom' ? customAgentName : selectedAgentName;

    // Call the parent submission handler with expand parameters
    onSubmitReservation(
      name, 
      phone, 
      date, 
      time, 
      guests, 
      Number(bookingFeeCharged) || 0,
      paymentStatus,
      paymentMethod,
      finalAgentName || 'Direto / Próprio',
      Number(agentCommission) || 0
    );
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Navigation aid */}
      <button 
        onClick={onBackToMap}
        className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider hover:opacity-80 transition-all cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Voltar para o Mapa de Mesas
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2 tracking-tight">Finalizar Reserva</h1>
        <p className="text-sm md:text-base text-on-surface-variant">
          Confirmando detalhes para a <strong>{selectedTable.name}</strong> ({selectedTable.area}).
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center text-xs md:text-sm font-semibold animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-error" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-6 bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant" onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* USER CLIENT AREA */}
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#d85c27] pb-1 border-b border-outline-variant/50 sm:col-span-2">
            👤 Dados do Cliente / Reserva
          </h3>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome Completo *</label>
            <div className="relative group">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm md:text-base text-on-surface placeholder:text-on-surface-variant/40" 
                placeholder="Como devemos te chamar?" 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Telefone / WhatsApp *</label>
            <div className="relative group">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm md:text-base text-on-surface placeholder:text-on-surface-variant/40" 
                placeholder="(00) 00000-0000" 
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
              />
            </div>
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Data da Reserva</label>
            <div className="relative group">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm md:text-base text-on-surface" 
                type="date" 
                min="2025-06-01"
                max="2025-06-30"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Time Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Horário</label>
            <div className="relative group">
              <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none" />
              <select 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm md:text-base text-on-surface appearance-none"
              >
                <option value="19:00">19:00</option>
                <option value="19:30">19:30</option>
                <option value="20:00">20:00</option>
                <option value="20:30">20:30</option>
                <option value="21:00">21:00</option>
              </select>
            </div>
          </div>

          {/* Guests Field */}
          <div className="space-y-2 sm:col-span-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Número de Convidados</label>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Mesa comporta até {selectedTable.capacity} pessoas</span>
            </div>
            <div className="flex items-center gap-4 bg-surface p-2 border border-outline rounded-lg">
              <button 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant transition-colors active:scale-95 duration-100" 
                type="button"
                onClick={decrement}
                disabled={guests <= 1}
                title="Reduzir Convidados"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="flex-1 text-center text-lg md:text-xl font-bold">{guests}</span>
              <button 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-container text-on-primary-container hover:opacity-90 transition-colors shadow-sm active:scale-95 duration-100" 
                type="button"
                onClick={increment}
                disabled={guests >= selectedTable.capacity}
                title="Adicionar Convidados"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>


          {/* FINANCIALS & INTERNAL CONTROLS SECTION */}
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#d85c27] pt-4 mt-2 border-t border-outline-variant/60 sm:col-span-2">
            💰 Informações da Cobrança & Responsável
          </h3>

          {/* Booking Fee Override Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              Valor ou Taxa da Mesa (R$)
            </label>
            <input 
              type="number"
              min="0"
              step="any"
              className="w-full px-4 py-3 rounded-lg border border-outline bg-surface font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm md:text-base text-on-surface"
              value={bookingFeeCharged}
              onChange={(e) => setBookingFeeCharged(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          {/* Payment Status Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Estado do Pagamento *</label>
            <select
              value={paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value as 'paid' | 'pending')}
              className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm md:text-base text-on-surface cursor-pointer"
            >
              <option value="pending">A pagar (Pendente)</option>
              <option value="paid">Confirmado (Pago)</option>
            </select>
          </div>

          {/* Payment Method Selector Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'dinheiro' | 'cartao' | 'pix' | 'none')}
              disabled={paymentStatus !== 'paid'}
              className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm md:text-base text-on-surface cursor-pointer disabled:opacity-50 disabled:bg-surface-container-high"
            >
              {paymentStatus === 'pending' ? (
                <option value="none">--- Sem Pagamento ---</option>
              ) : (
                <>
                  <option value="pix">🏷️ PIX</option>
                  <option value="dinheiro">💵 Dinheiro (Espécie)</option>
                  <option value="cartao">💳 Cartão de Crédito/Débito</option>
                </>
              )}
            </select>
          </div>

          {/* Salesperson Agent Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Vendedor / Responsável</label>
            <select
              value={selectedAgentName}
              onChange={handleAgentChange}
              className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm md:text-base text-on-surface cursor-pointer"
            >
              <option value="">Direto / Sem Intermediário</option>
              {agentsList.map((a, i) => (
                <option key={i} value={a.name}>🧑‍💼 {a.name} (Cadastrado)</option>
              ))}
              <option value="custom">✍️ Outro Vendedor (Digitar...)</option>
            </select>
          </div>

          {/* Custom agent name write-in (rendered if "custom" selected) */}
          {selectedAgentName === 'custom' && (
            <div className="space-y-2 sm:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome do Vendedor Interno *</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm md:text-base text-on-surface placeholder:text-on-surface-variant/40"
                placeholder="Escreva o nome do responsável..."
                value={customAgentName}
                required
                onChange={(e) => setCustomAgentName(e.target.value)}
              />
            </div>
          )}

          {/* Salesperson rewards/comissão override */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              Valor para quem vendeu (R$)
            </label>
            <input 
              type="number"
              min="0"
              step="any"
              className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm md:text-base text-on-surface"
              value={agentCommission}
              onChange={(e) => setAgentCommission(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

        </div>

        <div className="pt-4">
          <button 
            className="w-full bg-secondary text-on-secondary font-bold py-4 rounded-xl text-base md:text-lg shadow-lg hover:scale-[1.01] hover:brightness-95 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2" 
            type="submit"
          >
            <span>{editingReservation ? 'Salvar Edição da Reserva' : 'Confirmar Reserva'}</span>
            <span className="bg-[#b34015] px-2.5 py-0.5 rounded text-xs select-none">
              R$ {Number(bookingFeeCharged).toFixed(2)}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
