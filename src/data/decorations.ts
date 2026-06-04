import { MapDecoration } from '../types';

export const initialDecorations: MapDecoration[] = [
  {
    id: 'deco-palco',
    label: '🎸 PALCO',
    sublabel: 'São João 2025',
    type: 'stage',
    x: 450,
    y: 10,
    width: 150,
    height: 70
  },
  {
    id: 'deco-bar',
    label: '🍺 BAR CENTRAL',
    type: 'bar',
    x: 615,
    y: 10,
    width: 310,
    height: 30
  },
  {
    id: 'deco-churrasqueira',
    label: '🥩 Setor Churrasqueira',
    sublabel: 'Mesas VIP Cobertas',
    type: 'zone',
    x: 170,
    y: 100,
    width: 205,
    height: 520
  },
  {
    id: 'deco-cozinha',
    label: '🍳 COZINHA',
    type: 'kitchen',
    x: 430,
    y: 580,
    width: 180,
    height: 30
  },
  {
    id: 'deco-adega',
    label: '🍷 ADEGA 27',
    sublabel: 'Setor Vinhos',
    type: 'adega',
    x: 990,
    y: 15,
    width: 120,
    height: 40
  },
  {
    id: 'deco-pizzaria',
    label: '🍕 PIZZARIA',
    sublabel: 'Forno de Pizza',
    type: 'pizzaria',
    x: 990,
    y: 440,
    width: 120,
    height: 40
  },
  {
    id: 'deco-salon',
    label: 'SALÃO',
    type: 'salon',
    x: 520,
    y: 210,
    width: 300,
    height: 60
  }
];
