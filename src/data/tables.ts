import { Table } from '../types';

export const initialTables: Table[] = [
  // --- CHURRASQUEIRA AREA (Inside the left bordered block) ---
  { id: 18, name: "Mesa 18", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 195, y: 110, shape: "square" },
  { id: 17, name: "Mesa 17", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 285, y: 110, shape: "square" },
  { id: 19, name: "Mesa 19", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 190, y: 230, shape: "square" },
  { id: 16, name: "Mesa 16", area: "Churrasqueira", capacity: 6, type: "Estofado Luxo", isVip: true, bookingFee: 50, status: "available", x: 275, y: 220, shape: "circle" }, // Central round table
  { id: 20, name: "Mesa 20", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 195, y: 350, shape: "square" },
  { id: 15, name: "Mesa 15", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 285, y: 350, shape: "square" },
  { id: 120, name: "Mesa 120", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 195, y: 450, shape: "square" },
  { id: 115, name: "Mesa 115", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 285, y: 450, shape: "square" },
  { id: 220, name: "Mesa 220", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 195, y: 550, shape: "square" },
  { id: 215, name: "Mesa 215", area: "Churrasqueira", capacity: 4, type: "Estofado", isVip: true, bookingFee: 30, status: "available", x: 285, y: 550, shape: "square" },

  // --- EXTERNAL LEFT COLUMN (Main Outer) ---
  { id: 31, name: "Mesa 31", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 120, y: 70, shape: "square" },
  { id: 30, name: "Mesa 30", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 50, y: 175, shape: "square" },
  { id: 29, name: "Mesa 29", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 50, y: 285, shape: "square" },
  { id: 28, name: "Mesa 28", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 50, y: 395, shape: "square" },

  // --- INNER LEFT COLUMN ---
  { id: 27, name: "Mesa 27", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 120, y: 175, shape: "square" },
  { id: 26, name: "Mesa 26", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 120, y: 285, shape: "square" },
  { id: 25, name: "Mesa 25", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 120, y: 395, shape: "square" },
  { id: 24, name: "Mesa 24", area: "Área Externa Leste", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 120, y: 505, shape: "square" },

  // --- UPPER CENTRAL AREA (Stools and long tables) ---
  { id: 34, name: "Mesa 34", area: "Área Externa Norte", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 195, y: 15, shape: "square" },
  { id: 35, name: "Mesa 35", area: "Área Externa Norte", capacity: 4, type: "Madeira", isVip: false, bookingFee: 0, status: "available", x: 285, y: 15, shape: "square" },
  { id: 32, name: "Mesa 32", area: "Área Externa Norte", capacity: 6, type: "Madeira Comprida", isVip: false, bookingFee: 0, status: "available", x: 180, y: 65, shape: "rectangle" },
  { id: 132, name: "Mesa 132", area: "Balcão", capacity: 2, type: "Banqueta Alta", isVip: false, bookingFee: 0, status: "available", x: 375, y: 15, shape: "square" },
  { id: 131, name: "Mesa 131", area: "Balcão", capacity: 2, type: "Banqueta Alta", isVip: false, bookingFee: 0, status: "available", x: 375, y: 55, shape: "square" },
  { id: 130, name: "Mesa 130", area: "Balcão", capacity: 2, type: "Banqueta Alta", isVip: false, bookingFee: 0, status: "available", x: 375, y: 95, shape: "square" },

  // --- CENTRAL SALÃO & STAGE (Palco surroundings) ---
  { id: 1, name: "Mesa 1", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 425, y: 110, shape: "circle" },
  { id: 10, name: "Mesa 10", area: "Salão", capacity: 4, type: "Mesa Quadrada", isVip: false, bookingFee: 0, status: "available", x: 425, y: 220, shape: "square" },

  // Stage Round row (BAR line)
  { id: 4, name: "Mesa 4", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 615, y: 110, shape: "circle" },
  { id: 5, name: "Mesa 5", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 685, y: 110, shape: "circle" },
  { id: 105, name: "Mesa 105", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 755, y: 110, shape: "circle" },
  { id: 205, name: "Mesa 205", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 825, y: 110, shape: "circle" },

  // Central Salão circular tables under PALCO
  { id: 9, name: "Mesa 9", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 615, y: 220, shape: "circle" },
  { id: 8, name: "Mesa 8", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 685, y: 220, shape: "circle" },
  { id: 7, name: "Mesa 7", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 755, y: 220, shape: "circle" },
  { id: 6, name: "Mesa 6", area: "Salão", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 825, y: 220, shape: "circle" },
  { id: 106, name: "Mesa 106", area: "Salão", capacity: 106, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 895, y: 220, shape: "circle" },

  // COZINHA lower tables
  { id: 114, name: "Mesa 114", area: "Salão", capacity: 4, type: "Quadrada", isVip: false, bookingFee: 0, status: "available", x: 425, y: 340, shape: "square" },
  { id: 113, name: "Mesa 113", area: "Salão", capacity: 4, type: "Quadrada", isVip: false, bookingFee: 0, status: "available", x: 495, y: 340, shape: "square" },
  { id: 14, name: "Mesa 14", area: "Salão", capacity: 4, type: "Quadrada", isVip: false, bookingFee: 0, status: "available", x: 605, y: 340, shape: "square" },
  { id: 13, name: "Mesa 13", area: "Salão", capacity: 4, type: "Quadrada", isVip: false, bookingFee: 0, status: "available", x: 675, y: 340, shape: "square" },
  { id: 12, name: "Mesa 12", area: "Salão", capacity: 4, type: "Quadrada", isVip: false, bookingFee: 0, status: "available", x: 745, y: 340, shape: "square" },
  { id: 11, name: "Mesa 11", area: "Salão", capacity: 6, type: "Retangular", isVip: false, bookingFee: 0, status: "available", x: 815, y: 335, shape: "rectangle" },

  // --- RIGHT PIZZARIA & ADEGA 27 ---
  { id: 43, name: "Mesa 43", area: "Pizzaria / Adega", capacity: 4, type: "Quadrada", isVip: false, bookingFee: 0, status: "available", x: 975, y: 90, shape: "rectangle" },
  // Vertical column round
  { id: 44, name: "Mesa 44", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 960, y: 165, shape: "circle" },
  { id: 45, name: "Mesa 45", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 960, y: 235, shape: "circle" },
  { id: 46, name: "Mesa 46", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 960, y: 305, shape: "circle" },
  { id: 47, name: "Mesa 47", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 960, y: 375, shape: "circle" },
  { id: 48, name: "Mesa 48", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 960, y: 445, shape: "circle" },
  
  // Outer curves
  { id: 142, name: "Mesa 142", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 1030, y: 200, shape: "circle" },
  { id: 42, name: "Mesa 42", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 1030, y: 270, shape: "circle" },
  { id: 41, name: "Mesa 41", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 1030, y: 340, shape: "circle" },
  { id: 40, name: "Mesa 40", area: "Pizzaria / Adega", capacity: 4, type: "Mesa Redonda", isVip: false, bookingFee: 0, status: "available", x: 1030, y: 410, shape: "circle" }
];
