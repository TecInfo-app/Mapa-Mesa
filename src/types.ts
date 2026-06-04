export interface Table {
  id: number;
  name: string;
  area: string;
  capacity: number;
  type: string;
  isVip: boolean;
  bookingFee: number;
  status: 'available' | 'reserved' | 'selected';
  // Position coordinates inside the container
  x: number;
  y: number;
  shape: 'circle' | 'square' | 'rectangle';
}

export interface MapDecoration {
  id: string;
  label: string;
  sublabel?: string;
  type: 'stage' | 'bar' | 'zone' | 'kitchen' | 'adega' | 'pizzaria' | 'salon' | 'custom';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Reservation {
  id: string;
  tableId: number;
  tableName: string;
  area: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  total: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  paymentStatus?: 'paid' | 'pending';
  paymentMethod?: 'dinheiro' | 'cartao' | 'pix' | 'none';
  agentName?: string;
  agentCommission?: number;
  bookingFeeCharged?: number;
}

export type AppView = 'map' | 'form' | 'reservations' | 'menu' | 'settings';
