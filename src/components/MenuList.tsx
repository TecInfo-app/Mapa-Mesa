import { useState } from 'react';
import { menuItems, MenuItem } from '../data/menu';
import { Search, Compass } from 'lucide-react';

export function MenuList() {
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'todos', label: '🔥 Tudo' },
    { id: 'chopp', label: '🍺 Chopps Gelados' },
    { id: 'typical', label: '🌽 Comidas Típicas' },
    { id: 'portions', label: '🥩 Espetinhos & Porções' },
    { id: 'drinks', label: '🍹 Drinks Juninos' }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeTab === 'todos' || item.category === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2 tracking-tight">🍽️ Cardápio de São João</h1>
        <p className="text-sm text-on-surface-variant">
          Confira o que serviremos na grande noite da Cia do Chopp 2025! Pratos típicos, petiscos e nossos famosos chopps.
        </p>
      </div>

      {/* Control bar with searches and tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-2">
        <div className="flex flex-wrap gap-1.5 order-2 md:order-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === cat.id
                  ? 'bg-secondary text-on-secondary shadow-md'
                  : 'bg-surface-container hover:bg-surface-variant/75 text-on-surface-variant'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Real-time description filter search */}
        <div className="relative order-1 md:order-2">
          <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full md:w-60 text-xs rounded-xl border border-outline bg-surface-container-lowest focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant text-on-surface-variant text-xs">
          Nenhum prato ou bebida encontrado com o termo informado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant p-4 flex gap-4 hover:shadow-sm transition-all"
            >
              {/* Food Image */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-surface-container overflow-hidden shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-305"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Food Details */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-on-surface leading-tight mb-1">{item.name}</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2 md:line-clamp-3">
                    {item.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-bold text-secondary">
                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  
                  {/* Visual tag indicator */}
                  <span className="text-[9px] font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    {item.category === 'chopp' ? '🍺 Chopp' : item.category === 'typical' ? '🌽 Típico' : item.category === 'portions' ? '🍢 Porção' : '🍹 Drink'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decorative prompt box */}
      <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl flex items-center gap-3">
        <Compass className="w-5 h-5 text-secondary shrink-0" />
        <p className="text-xs text-on-surface-variant leading-relaxed">
          💡 <strong>Dica do Chef:</strong> No dia do evento, você poderá realizar pedidos adicionais diretamente da sua mesa usando o QR Code impresso na sua placa de reserva.
        </p>
      </div>
    </div>
  );
}
