/**
 * Utilidad para obtener iconos y colores específicos según el tipo de cultivo
 */

interface CropIconData {
  icon: string;
  color: string;
  gradient: string[];
}

// Mapeo de cultivos a sus iconos y colores representativos
const CROP_ICONS: Record<string, CropIconData> = {
  // Hortalizas y frutas
  'tomate': { icon: '🍅', color: '#E53935', gradient: ['#FF5252', '#E53935'] },
  'maíz': { icon: '🌽', color: '#FDD835', gradient: ['#FFD54F', '#FDD835'] },
  'papa': { icon: '🥔', color: '#8D6E63', gradient: ['#A1887F', '#8D6E63'] },
  'zanahoria': { icon: '🥕', color: '#FF6F00', gradient: ['#FF8F00', '#FF6F00'] },
  'lechuga': { icon: '🥬', color: '#66BB6A', gradient: ['#81C784', '#66BB6A'] },
  'cebolla': { icon: '🧅', color: '#8E24AA', gradient: ['#9C27B0', '#8E24AA'] },
  'pimentón': { icon: '🫑', color: '#43A047', gradient: ['#66BB6A', '#43A047'] },
  'pimiento': { icon: '🌶️', color: '#D32F2F', gradient: ['#E53935', '#D32F2F'] },
  'berenjena': { icon: '🍆', color: '#6A1B9A', gradient: ['#7B1FA2', '#6A1B9A'] },
  'calabaza': { icon: '🎃', color: '#F57C00', gradient: ['#FB8C00', '#F57C00'] },
  'pepino': { icon: '🥒', color: '#558B2F', gradient: ['#689F38', '#558B2F'] },
  'ajo': { icon: '🧄', color: '#BDBDBD', gradient: ['#E0E0E0', '#BDBDBD'] },
  
  // Granos y cereales
  'arroz': { icon: '🌾', color: '#F9A825', gradient: ['#FBC02D', '#F9A825'] },
  'trigo': { icon: '🌾', color: '#FFA726', gradient: ['#FFB74D', '#FFA726'] },
  'cebada': { icon: '🌾', color: '#FFB300', gradient: ['#FFC107', '#FFB300'] },
  'avena': { icon: '🌾', color: '#FFD54F', gradient: ['#FFE082', '#FFD54F'] },
  
  // Leguminosas
  'frijol': { icon: '🫘', color: '#6D4C41', gradient: ['#795548', '#6D4C41'] },
  'lenteja': { icon: '🫘', color: '#8D6E63', gradient: ['#A1887F', '#8D6E63'] },
  'garbanzo': { icon: '🫘', color: '#BCAAA4', gradient: ['#D7CCC8', '#BCAAA4'] },
  'soya': { icon: '🫘', color: '#F9A825', gradient: ['#FBC02D', '#F9A825'] },
  
  // Bebidas y especias
  'café': { icon: '☕', color: '#5D4037', gradient: ['#6D4C41', '#5D4037'] },
  'cacao': { icon: '🍫', color: '#4E342E', gradient: ['#5D4037', '#4E342E'] },
  
  // Frutas
  'plátano': { icon: '🍌', color: '#FDD835', gradient: ['#FFEB3B', '#FDD835'] },
  'banana': { icon: '🍌', color: '#FDD835', gradient: ['#FFEB3B', '#FDD835'] },
  'naranja': { icon: '🍊', color: '#FF6F00', gradient: ['#FF8F00', '#FF6F00'] },
  'manzana': { icon: '🍎', color: '#C62828', gradient: ['#D32F2F', '#C62828'] },
  'fresa': { icon: '🍓', color: '#E53935', gradient: ['#F44336', '#E53935'] },
  'sandía': { icon: '🍉', color: '#388E3C', gradient: ['#43A047', '#388E3C'] },
  'melón': { icon: '🍈', color: '#66BB6A', gradient: ['#81C784', '#66BB6A'] },
  'piña': { icon: '🍍', color: '#F9A825', gradient: ['#FBC02D', '#F9A825'] },
  'mango': { icon: '🥭', color: '#FF6F00', gradient: ['#FF8F00', '#FF6F00'] },
  'aguacate': { icon: '🥑', color: '#558B2F', gradient: ['#689F38', '#558B2F'] },
  'pera': { icon: '🍐', color: '#9CCC65', gradient: ['#AED581', '#9CCC65'] },
  'durazno': { icon: '🍑', color: '#FFAB91', gradient: ['#FFCCBC', '#FFAB91'] },
  'uva': { icon: '🍇', color: '#6A1B9A', gradient: ['#7B1FA2', '#6A1B9A'] },
  'limón': { icon: '🍋', color: '#F9A825', gradient: ['#FBC02D', '#F9A825'] },
  
  // Tubérculos y raíces
  'yuca': { icon: '🥔', color: '#8D6E63', gradient: ['#A1887F', '#8D6E63'] },
  'batata': { icon: '🍠', color: '#EF6C00', gradient: ['#F57C00', '#EF6C00'] },
  'remolacha': { icon: '🫐', color: '#AD1457', gradient: ['#C2185B', '#AD1457'] },
  
  // Hierbas y aromáticas
  'cilantro': { icon: '🌿', color: '#66BB6A', gradient: ['#81C784', '#66BB6A'] },
  'perejil': { icon: '🌿', color: '#43A047', gradient: ['#66BB6A', '#43A047'] },
  'albahaca': { icon: '🌿', color: '#558B2F', gradient: ['#689F38', '#558B2F'] },
  
  // Otros
  'algodón': { icon: '☁️', color: '#EEEEEE', gradient: ['#FAFAFA', '#EEEEEE'] },
  'caña': { icon: '🎋', color: '#689F38', gradient: ['#7CB342', '#689F38'] },
};

/**
 * Obtiene el icono emoji para un cultivo específico
 * @param cropName - Nombre del cultivo (no sensitivo a mayúsculas)
 * @returns Emoji del cultivo o emoji genérico si no se encuentra
 */
export const getCropIcon = (cropName: string): string => {
  const normalizedName = cropName.toLowerCase().trim();
  return CROP_ICONS[normalizedName]?.icon || '🌱';
};

/**
 * Obtiene el color principal asociado a un cultivo
 * @param cropName - Nombre del cultivo
 * @returns Color hexadecimal o color verde genérico
 */
export const getCropColor = (cropName: string): string => {
  const normalizedName = cropName.toLowerCase().trim();
  return CROP_ICONS[normalizedName]?.color || '#4CAF50';
};

/**
 * Obtiene los colores de gradiente para un cultivo
 * @param cropName - Nombre del cultivo
 * @returns Array con dos colores para gradiente
 */
export const getCropGradient = (cropName: string): string[] => {
  const normalizedName = cropName.toLowerCase().trim();
  return CROP_ICONS[normalizedName]?.gradient || ['#66BB6A', '#4CAF50'];
};

/**
 * Obtiene el icono según el estado del cultivo
 * @param status - Estado del cultivo
 * @returns Emoji representativo del estado
 */
export const getStatusIcon = (status: string): string => {
  const statusIcons: Record<string, string> = {
    'activo': '🟢',
    'cosechado': '✅',
    'en_problemas': '🟡',
    'perdido': '🔴',
    'en_preparacion': '🔵',
  };
  return statusIcons[status.toLowerCase()] || '🟢';
};

/**
 * Obtiene el color del badge según días hasta cosecha
 * @param days - Días restantes para la cosecha
 * @returns Objeto con color de fondo y texto
 */
export const getHarvestBadgeColor = (days: number | null): { bg: string; text: string; label: string } => {
  if (days === null) {
    return { bg: '#E0E0E0', text: '#757575', label: 'Sin fecha' };
  }
  
  if (days < 0) {
    return { bg: '#FFCDD2', text: '#C62828', label: 'Atrasado' };
  }
  
  if (days === 0) {
    return { bg: '#C8E6C9', text: '#2E7D32', label: '¡Hoy!' };
  }
  
  if (days <= 7) {
    return { bg: '#FFECB3', text: '#F57C00', label: 'Esta semana' };
  }
  
  if (days <= 30) {
    return { bg: '#FFE082', text: '#F9A825', label: 'Este mes' };
  }
  
  return { bg: '#E8F5E9', text: '#388E3C', label: 'A tiempo' };
};

/**
 * Obtiene iconos para diferentes tipos de alertas
 * @param alertType - Tipo de alerta
 * @returns Emoji de la alerta
 */
export const getAlertIcon = (alertType: string): string => {
  const alertIcons: Record<string, string> = {
    'riego': '💧',
    'fertilizacion': '💊',
    'cosecha': '🗓️',
    'plaga': '🐛',
    'clima': '🌡️',
    'enfermedad': '🦠',
    'general': '⚠️',
  };
  return alertIcons[alertType.toLowerCase()] || '🔔';
};

/**
 * Calcula el porcentaje de progreso del cultivo
 * @param daysSincePlanting - Días desde la siembra
 * @param totalCycleDays - Días totales del ciclo del cultivo
 * @returns Porcentaje de 0 a 100
 */
export const getCropProgress = (daysSincePlanting: number, totalCycleDays: number): number => {
  if (totalCycleDays <= 0) return 0;
  const progress = (daysSincePlanting / totalCycleDays) * 100;
  return Math.min(Math.max(progress, 0), 100); // Limitar entre 0 y 100
};

/**
 * Obtiene el color de la barra de progreso según el porcentaje
 * @param progress - Porcentaje de progreso (0-100)
 * @returns Color hexadecimal
 */
export const getProgressColor = (progress: number): string => {
  if (progress < 25) return '#4CAF50'; // Verde - Etapa inicial
  if (progress < 50) return '#8BC34A'; // Verde claro - Crecimiento
  if (progress < 75) return '#FFC107'; // Amarillo - Desarrollo
  if (progress < 100) return '#FF9800'; // Naranja - Pre-cosecha
  return '#66BB6A'; // Verde brillante - Listo para cosechar
};

/**
 * Obtiene la etapa de crecimiento basada en el progreso
 * @param progress - Porcentaje de progreso (0-100)
 * @returns Nombre de la etapa y emoji
 */
export const getGrowthStage = (progress: number): { name: string; icon: string } => {
  if (progress < 15) return { name: 'Germinación', icon: '🌱' };
  if (progress < 35) return { name: 'Plántula', icon: '🌿' };
  if (progress < 60) return { name: 'Crecimiento', icon: '🌾' };
  if (progress < 85) return { name: 'Floración', icon: '🌸' };
  if (progress < 100) return { name: 'Fructificación', icon: '🍃' };
  return { name: 'Cosecha', icon: '✨' };
};

export default {
  getCropIcon,
  getCropColor,
  getCropGradient,
  getStatusIcon,
  getHarvestBadgeColor,
  getAlertIcon,
  getCropProgress,
  getProgressColor,
  getGrowthStage,
};
