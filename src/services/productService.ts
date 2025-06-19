// En src/services/productService.ts

import { supabase } from '../utils/supabase';

// --- TIPOS Y MODELOS DE DATOS ---

export interface Product {
  id: string;
  id_restaurant: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image_path?: string | null;
  model_usdz_path?: string | null;
  model_gbl_path?: string | null;
  created_at: string;
  rating?: number | null;
}

// Datos para crear un nuevo producto. Se omiten los campos generados por la DB.
export type NewProductData = Omit<Product, 'id' | 'id_restaurant' | 'created_at' | 'rating' | 'image_path' | 'model_usdz_path' | 'model_gbl_path'>;

// Datos para actualizar un producto. Todos los campos son opcionales.
export type UpdateProductData = Partial<NewProductData>;

// Interfaz para los archivos que se pueden subir.
export interface ProductFiles {
  image?: File;
  modelUsdz?: File;
  modelGlb?: File;
}

// --- FUNCIONES DEL SERVICIO (CRUD) ---

/**
 * Llama a la Edge Function 'create-full-product' para crear un producto.
 * Orquesta la subida de archivos y la inserción en la DB de forma segura.
 */
export const createProduct = async (
  restaurantId: string,
  productData: NewProductData,
  files: ProductFiles
): Promise<Product> => {
  const formData = new FormData();

  formData.append('restaurantId', restaurantId);
  formData.append('name', productData.name);
  formData.append('description', productData.description || '');
  formData.append('price', productData.price.toString());
  formData.append('category', productData.category);

  if (files.image) formData.append('image', files.image);
  if (files.modelUsdz) formData.append('modelUsdz', files.modelUsdz);
  if (files.modelGlb) formData.append('modelGlb', files.modelGlb);

  const { data, error } = await supabase.functions.invoke('create-full-product', {
    body: formData,
  });

  if (error) {
    if (data && data.error) throw new Error(data.error);
    throw new Error(error.message || 'Error al invocar la función de creación.');
  }

  return data;
};

/** 
 * Obtiene todos los productos de un restaurante específico.
 */
export const getProductsByRestaurant = async (restaurantId: string): Promise<Product[]> => {
  if (!restaurantId) return [];
  const { data, error } = await supabase
    .from('restaurant_product')
    .select('*')
    .eq('id_restaurant', restaurantId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
};

/**
 * Obtiene los detalles de un único producto por su ID.
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  if (!productId) {
    console.error("No se proporcionó un ID de producto.");
    return null;
  }

  const { data, error } = await supabase
    .from('restaurant_product')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // 'PGRST116' es el código para "0 filas encontradas"
      console.error(`Error al obtener el producto ${productId}:`, error);
    }
    return null; // Devuelve null si no se encuentra o hay un error
  }

  return data;
};

/** 
 * Actualiza los datos de texto/numéricos de un producto.
 */
export const updateProduct = async (productId: string, data: UpdateProductData): Promise<Product> => {
  const { data: updatedData, error } = await supabase
    .from('restaurant_product')
    .update(data)
    .eq('id', productId)
    .select()
    .single();
  if (error) throw error;
  if (!updatedData) throw new Error("No se devolvió el producto actualizado.");
  return updatedData;
};

/** 
 * Elimina un producto y sus archivos asociados del storage.
 */
export const deleteProduct = async (product: Product): Promise<void> => {
  const filesToDelete: { bucket: 'logos' | 'models'; path: string }[] = [];
  if (product.image_path) filesToDelete.push({ bucket: 'logos', path: product.image_path });
  if (product.model_usdz_path) filesToDelete.push({ bucket: 'models', path: product.model_usdz_path });
  if (product.model_gbl_path) filesToDelete.push({ bucket: 'models', path: product.model_gbl_path });

  // Eliminar archivos concurrentemente para mayor eficiencia
  if (filesToDelete.length > 0) {
    await Promise.all(
      filesToDelete.map(file => supabase.storage.from(file.bucket).remove([file.path]))
    );
  }

  const { error: dbError } = await supabase.from('restaurant_product').delete().eq('id', product.id);
  if (dbError) throw dbError;
};
