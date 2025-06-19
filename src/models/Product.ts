// src/types/Product.ts (o donde prefieras)

export interface Product {
  id: string; // uuid
  id_restaurant: string; // uuid, Foreign Key a restaurant.id
  name: string; // text
  price: number; // numeric
  category: string; // text
  description?: string | null; // text, puede ser opcional o nulo
  video_url?: string | null; // text, puede ser opcional o nulo
  rating?: number | null; // numeric, puede ser opcional o nulo
  created_at?: string; // timestamptz, usualmente string en formato ISO 8601 desde la API

  // NOTA: Las propiedades para AR (model, position, rotation, scale) y 'calification'
  // que tenías en tu interfaz Product anterior no están en esta tabla 'restaurant_product'.
  // Deberás decidir si estas propiedades se almacenan en otro lugar,
  // se derivan, o si necesitas extender esta tabla/interfaz.
  // Por ahora, esta interfaz refleja estrictamente la tabla 'restaurant_product'.
}
