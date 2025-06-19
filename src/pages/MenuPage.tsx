// En src/pages/MenuPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,        // Re-introducido para las categorías
  IonSegmentButton,  // Re-introducido para las categorías
  IonLabel,
  IonSpinner,
  IonText,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonButton
} from '@ionic/react';
import { imageOutline } from 'ionicons/icons';

// Importa los servicios y tipos
import * as restaurantService from '../services/restaurantService';
import * as productService from '../services/productService';
import type { Restaurant } from '../services/restaurantService';
import type { Product } from '../services/productService';

// Importa el componente de tarjeta de producto
import MenuItem from '../components/MenuItem';

const MenuPage: React.FC = () => {
  const { id: restaurantId } = useParams<{ id: string }>();
  const history = useHistory();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Estados para la lógica de categorías
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenuData = async () => {
      if (!restaurantId) {
        setError("No se proporcionó un ID de restaurante en la URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [restaurantData, productsData] = await Promise.all([
          restaurantService.getRestaurantById(restaurantId),
          productService.getProductsByRestaurant(restaurantId)
        ]);
        if (!restaurantData) throw new Error("El restaurante que buscas no existe.");

        setRestaurant(restaurantData);
        setProducts(productsData);

        // Lógica para establecer las categorías y la categoría inicial
        if (productsData.length > 0) {
          // Ordena las categorías según una lista predefinida para una mejor UX
          const categoryOrder = ["Entrantes", "Platos principales", "Ensaladas", "Postres", "Bebidas", "Otros"];
          const productCategories = Array.from(new Set(productsData.map(p => p.category || 'Otros')))
            .sort((a, b) => {
              const indexA = categoryOrder.indexOf(a);
              const indexB = categoryOrder.indexOf(b);
              // Si ambos están en la lista, usa el orden. Si no, ponlos al final.
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a.localeCompare(b);
            });

          setCategories(productCategories);
          setSelectedCategory(productCategories[0]); // Selecciona la primera categoría por defecto
        }
      } catch (err: any) {
        setError(err.message || "Ocurrió un error al cargar el menú.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMenuData();
  }, [restaurantId]);

  // Filtra los productos basados en la categoría seleccionada
  const filteredProducts = products.filter(item => {
    // Si no hay categorías o solo hay una, muestra todos los productos.
    if (categories.length <= 1) return true;
    // De lo contrario, filtra por la categoría seleccionada.
    return (item.category || 'Otros') === selectedCategory;
  });

  if (isLoading) { /* ... (sin cambios) */ }
  if (error) { /* ... (sin cambios) */ }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref={`/${restaurantId}`} /></IonButtons>
          <IonTitle className="font-bold">{restaurant?.name || 'Menú'}</IonTitle>
        </IonToolbar>

        {/* ===== SECCIÓN DE CATEGORÍAS RE-INTRODUCIDA ===== */}
        {/* Solo se muestra si hay más de una categoría para filtrar */}
        {categories.length > 1 && (
          <IonToolbar>
            <IonSegment
              value={selectedCategory}
              onIonChange={e => setSelectedCategory(e.detail.value as string)}
              scrollable
            >
              {categories.map(category => (
                <IonSegmentButton key={category} value={category}>
                  <IonLabel>{category}</IonLabel>
                </IonSegmentButton>
              ))}
            </IonSegment>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent fullscreen className="ion-padding bg-gray-50">
        {products.length > 0 ? (
          <IonGrid>
            <IonRow>
              {filteredProducts.map(product => (
                <IonCol key={product.id} size="12" size-md="6" size-lg="4">
                  <MenuItem
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    description={product.description}
                    rating={product.rating}
                    image_path={product.image_path}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        ) : (
          <div className="text-center py-16">
            <IonIcon icon={imageOutline} className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500">Este restaurante aún no tiene productos en su menú.</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MenuPage;
