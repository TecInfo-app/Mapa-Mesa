export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'chopp' | 'typical' | 'portions' | 'drinks';
  imageUrl: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "m1",
    name: "Chopp Premium Cia do Chopp 300ml",
    description: "Nosso tradicional chopp leve, cremoso e geladíssimo servido na caneca congelada.",
    price: 11.90,
    category: "chopp",
    imageUrl: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "m2",
    name: "Chopp Escuro Cia do Chopp 500ml",
    description: "Chopp escuro encorpado com notas maltadas e cremosidade incomparável.",
    price: 16.50,
    category: "chopp",
    imageUrl: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "m3",
    name: "Quentão de São João",
    description: "Bebida quente tradicional à base de cachaça premium, gengibre, cravo e canela aromática.",
    price: 14.00,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "m4",
    name: "Canjica Cremosa com Canela",
    description: "Deliciosa canjica de milho branco com leite de coco condensado de alta cremosidade.",
    price: 12.00,
    category: "typical",
    imageUrl: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "m5",
    name: "Pamonha de Milho Verde Doce",
    description: "Pamonha fresca servida quentinha na palha, com opção de queijo coalho derretido.",
    price: 13.50,
    category: "typical",
    imageUrl: "https://images.unsplash.com/photo-1588168333986-5078647ac9ab?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "m6",
    name: "Espetinho Misto no Braseiro",
    description: "Três espetinhos artesanais (carne, e queijo coalho) grelhados na brasa com farofa temperada.",
    price: 28.00,
    category: "portions",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "m7",
    name: "Frango com Quiabo e Polenta",
    description: "Porção típica com pedacinhos suculentos de frango caipira, quiabo grelhado e polenta frita.",
    price: 42.00,
    category: "portions",
    imageUrl: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "m8",
    name: "Caipirinha de Três Limões",
    description: "Limão siciliano, tahiti e cravo macerados com cachaça envelhecida em barril de umburana.",
    price: 18.00,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400"
  }
];
