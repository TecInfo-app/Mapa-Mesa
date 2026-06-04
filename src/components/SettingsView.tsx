import React, { useState } from 'react';
import { 
  Bell, 
  CircleCheck, 
  HelpCircle, 
  Shield, 
  Store, 
  Calendar, 
  Users, 
  Plus, 
  Trash2 
} from 'lucide-react';

interface SettingsViewProps {
  storeName: string;
  setStoreName: (name: string) => void;
  eventName: string;
  setEventName: (name: string) => void;
  storeWhatsapp: string;
  setStoreWhatsapp: (whatsapp: string) => void;
  agentsList: Array<{ name: string, defaultCommission: number }>;
  onUpdateAgents: (agents: Array<{ name: string, defaultCommission: number }>) => void;
}

export function SettingsView({ 
  storeName, 
  setStoreName, 
  eventName, 
  setEventName, 
  storeWhatsapp,
  setStoreWhatsapp,
  agentsList, 
  onUpdateAgents 
}: SettingsViewProps) {
  // Temporary component states to apply collectively on "Salvar"
  const [tempStoreName, setTempStoreName] = useState(storeName);
  const [tempEventName, setTempEventName] = useState(eventName);
  const [tempStoreWhatsapp, setTempStoreWhatsapp] = useState(storeWhatsapp || '');
  
  // New Agent insertion state fields
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentCommission, setNewAgentCommission] = useState('');
  
  const [whatsappReminders, setWhatsappReminders] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [agentFormError, setAgentFormError] = useState('');

  const saveSettings = () => {
    setStoreName(tempStoreName.trim() || 'Cia do Chopp');
    setEventName(tempEventName.trim() || 'São João 2025');
    setStoreWhatsapp(tempStoreWhatsapp.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    setAgentFormError('');

    if (!newAgentName.trim()) {
      setAgentFormError('O nome do vendedor não pode estar vazio.');
      return;
    }

    if (agentsList.some(a => a.name.toLowerCase() === newAgentName.trim().toLowerCase())) {
      setAgentFormError('Já existe um vendedor cadastrado com esse nome.');
      return;
    }

    const commissionNum = parseFloat(newAgentCommission) || 0;

    const updated = [
      ...agentsList,
      { name: newAgentName.trim(), defaultCommission: commissionNum }
    ];

    onUpdateAgents(updated);
    setNewAgentName('');
    setNewAgentCommission('');

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteAgent = (agentName: string) => {
    const updated = agentsList.filter(a => a.name !== agentName);
    onUpdateAgents(updated);
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2 tracking-tight">⚙️ Configurações</h1>
        <p className="text-sm text-on-surface-variant">
          Personalize a identidade da loja, o nome do evento e configure as comissões da comitiva de vendas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Store and Event details, general notifications */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-6 shadow-sm">
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2 border-b border-outline-variant/50 pb-2">
              <Store className="w-4 h-4 text-primary" /> Identidade Visual & Branding
            </h3>

            {/* Store input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome da Loja / Estabelecimento *</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
                value={tempStoreName}
                onChange={(e) => setTempStoreName(e.target.value)}
                placeholder="Ex: Cia do Chopp"
              />
            </div>

            {/* Event input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome do Evento / Ocasião *</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
                value={tempEventName}
                onChange={(e) => setTempEventName(e.target.value)}
                placeholder="Ex: São João 2025"
              />
            </div>

            {/* WhatsApp input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                WhatsApp da Loja para Reservas *
              </label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
                value={tempStoreWhatsapp}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ""); // strip non digits
                  if (value.length > 11) value = value.substring(0, 11);
                  if (value.length > 6) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
                  } else if (value.length > 2) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                  } else if (value.length > 0) {
                    value = `(${value}`;
                  }
                  setTempStoreWhatsapp(value);
                }}
                placeholder="Ex: (81) 98765-4321"
              />
              <p className="text-[10px] text-on-surface-variant/70 italic">
                Utilizado para direcionar o cliente ao seu WhatsApp de atendimento quando ele desejar reservar no Link Compartilhado.
              </p>
            </div>

            {/* Notifications toggle */}
            <div className="space-y-4 pt-4 border-t border-outline-variant/50">
              <h4 className="text-xs uppercase tracking-wider font-bold text-secondary flex items-center gap-2">
                <Bell className="w-4 h-4" /> Comunicação & Lembretes
              </h4>

              <label className="flex items-center justify-between cursor-pointer select-none py-1">
                <div>
                  <p className="text-xs md:text-sm font-semibold text-on-surface">Lembretes automáticos por WhatsApp</p>
                  <p className="text-[11px] text-on-surface-variant">Dispara o comprovante e os detalhes da mesa ocupada via webhook.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={whatsappReminders} 
                  onChange={(e) => setWhatsappReminders(e.target.checked)}
                  className="rounded-full w-9 h-5 bg-outline checked:bg-secondary focus:ring-secondary text-secondary accent-secondary"
                />
              </label>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-secondary-container text-on-secondary-container border border-secondary/10 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
                <CircleCheck className="w-4 h-4 text-secondary shrink-0" /> Configurações atualizadas com sucesso!
              </div>
            )}

            <button
              onClick={saveSettings}
              className="w-full py-3.5 bg-secondary text-on-secondary font-extrabold rounded-xl text-xs uppercase tracking-wider hover:brightness-95 transition-all text-center cursor-pointer"
            >
              Salvar Identidade & Preferências
            </button>
          </div>

          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/50 flex gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-on-surface">Dados & Segurança</p>
              <p className="text-on-surface-variant mt-0.5 leading-relaxed">
                As configurações de marca, identidade física e vendedores locais são gravadas de forma persistente em storage nativo.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sales agents & Commissions roster registration */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2 border-b border-outline-variant/50 pb-2">
            <Users className="w-4 h-4 text-primary" /> Vendedores do São João
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Cadastre previamente as pessoas autorizadas a reservar mesas e suas respectivas recompensas / taxas de comissão.
          </p>

          {/* Roster list */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {agentsList.length === 0 ? (
              <div className="p-4 border border-dashed border-outline text-center rounded-xl text-xs text-on-surface-variant/70">
                Nenhum vendedor cadastrado.
              </div>
            ) : (
              agentsList.map((agent, i) => (
                <div key={i} className="flex justify-between items-center bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/60 text-xs">
                  <div>
                    <span className="font-bold text-on-surface">🧑‍💼 {agent.name}</span>
                    <span className="text-[10px] text-on-surface-variant block">Comissão Padrão: R$ {agent.defaultCommission.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAgent(agent.name)}
                    className="p-1.5 text-error hover:bg-error-container/20 hover:text-red-700 rounded-lg transition-all"
                    title={`Excluir ${agent.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick insertion form */}
          <form className="p-4 bg-surface rounded-xl border border-outline-variant/60 space-y-3" onSubmit={handleAddAgent}>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">⚡ Novo Vendedor</p>
            
            {agentFormError && (
              <p className="text-[10px] text-error font-semibold uppercase">{agentFormError}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-on-surface-variant">Nome do Vendedor</label>
                <input
                  type="text"
                  placeholder="Nome"
                  className="w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-on-surface"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-on-surface-variant">Comissão Padrão (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  min="0"
                  step="any"
                  className="w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-on-surface"
                  value={newAgentCommission}
                  onChange={(e) => setNewAgentCommission(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary-container text-on-primary-container hover:opacity-90 transition-all font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Vendedor
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
