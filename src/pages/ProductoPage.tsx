// En src/pages/ProductoPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText,
} from '@ionic/react';
import { cubeOutline, alertCircleOutline, pauseCircleOutline } from 'ionicons/icons';
import '@google/model-viewer';

import * as productService from '../services/productService';
import * as restaurantService from '../services/restaurantService';
import type { Product } from '../services/productService';
import type { Restaurant } from '../services/restaurantService';
import { supabase } from '../utils/supabase';

const ProductoPage: React.FC = () => {
  const { id: productId } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError("No se especificó un producto.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const productData = await productService.getProductById(productId);
        if (!productData) {
          throw new Error("El producto que buscas no fue encontrado.");
        }

        // Obtener información del restaurante para validar su estado
        const restaurantData = await restaurantService.getRestaurantById(productData.id_restaurant);
        if (!restaurantData) {
          throw new Error("El restaurante de este producto no fue encontrado.");
        }

        setProduct(productData);
        setRestaurant(restaurantData);
      } catch (err: any) {
        setError(err.message || "Ocurrió un error al cargar el modelo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const glbUrl = product?.model_gbl_path
    ? supabase.storage.from('models').getPublicUrl(product.model_gbl_path).data.publicUrl
    : '';

  const usdzUrl = product?.model_usdz_path
    ? supabase.storage.from('models').getPublicUrl(product.model_usdz_path).data.publicUrl
    : '';

  if (isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen className="flex justify-center items-center">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="danger"><IonTitle>Error</IonTitle></IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding text-center flex flex-col justify-center">
          <IonIcon icon={alertCircleOutline} className="text-6xl mb-4" />
          <h2 className="font-bold text-xl">Ocurrió un Problema</h2>
          <p>{error}</p>
        </IonContent>
      </IonPage>
    );
  }

  // Renderizar mensaje si el restaurante está suspendido
  if (restaurant?.status === 'notavailable') {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton defaultHref="/" /></IonButtons>
            <IonTitle className="font-bold">{restaurant?.name || 'Restaurante'}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="ion-padding bg-gray-50">
          <div className="flex items-center justify-center min-h-full">
            <IonCard className="max-w-md mx-auto text-center">
              <IonCardContent className="p-8">
                <div className="mb-6">
                  <IonIcon 
                    icon={pauseCircleOutline} 
                    className="text-6xl text-orange-500 mb-4" 
                  />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Restaurante Suspendido
                  </h2>
                  <IonText color="medium">
                    <p className="text-gray-600">
                      {restaurant.name} está temporalmente suspendido. 
                      No puedes acceder a sus productos en este momento.
                    </p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/menu-publico/${product?.id_restaurant}`} />
          </IonButtons>
          <IonTitle>{product?.name || 'Visor 3D'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {glbUrl ? (
          <model-viewer
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            src={glbUrl}
            ios-src={usdzUrl}
            alt={`Modelo 3D de ${product?.name}`}
            camera-controls
            shadow-intensity="1"
            style={{ width: '100%', height: '100%' }}
          >
            <button slot="ar-button" id="ar-button" style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#007aff',
              color: 'white',
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: '16px',
            }}>
              Ver en tu espacio
            </button>
          </model-viewer>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center p-8">
            <IonIcon icon={cubeOutline} className="text-6xl text-gray-300 mb-4" />
            <h2 className="font-bold text-xl">Modelo no Disponible</h2>
            <p className="text-gray-500">Este producto aún no cuenta con un modelo 3D para visualización.</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductoPage;
