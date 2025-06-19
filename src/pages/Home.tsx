import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonPage,
  IonIcon,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { restaurantOutline, alertCircleOutline } from 'ionicons/icons';
import * as restaurantService from '../services/restaurantService';
import { supabase } from '../utils/supabase';

import type { Restaurant as RestaurantFromDB } from '../services/restaurantService';

const Home: React.FC = () => {
  const [animateOut, setAnimateOut] = useState(false);
  const history = useHistory();
  const { id: restaurantId } = useParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<RestaurantFromDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData(restaurantId);
    } else {
      setIsLoading(false);
    }
  }, [restaurantId]);

  const fetchRestaurantData = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantService.getRestaurantById(id);
      if (data) {
        setRestaurant(data);
      } else {
        throw new Error(`El restaurante que buscas no fue encontrado.`);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al cargar la información del restaurante.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigationToMenu = () => {
    if (!restaurant) return;
    setAnimateOut(true);
    // Corregido para usar la ruta del menú público que creamos
    setTimeout(() => {
      history.push(`/menu-publico/${restaurant.id}`);
    }, 300);
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding flex justify-center items-center">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding ion-text-center">
          <div className="flex flex-col justify-center items-center h-full">
            <IonIcon icon={alertCircleOutline} className="text-6xl" color="danger" />
            <IonText color="danger">
              <h2 className="font-bold mt-4 text-xl">Ocurrió un Problema</h2>
            </IonText>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className={`ion-padding ion-text-center transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}
        style={{ '--background': 'linear-gradient(to bottom, #fefce8 0%, #ffffff 100%)' }}
      >
        {restaurant ? (
          // --- VISTA CUANDO SE ENCUENTRA UN RESTAURANTE ---
          <div className="flex flex-col justify-center items-center h-full">
            <IonCard className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden m-0">
              <IonCardContent className="p-8">
                <div className="icon-container">
                  {restaurant.logo ? (
                    <img
                      src={supabase.storage.from('logos').getPublicUrl(restaurant.logo).data.publicUrl}
                      alt={`${restaurant.name} logo`}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <IonIcon
                      icon={restaurantOutline}
                      color="primary"
                      className="text-6xl mb-4"
                    />
                  )}
                </div>
                <h1 className="font-bold text-2xl uppercase tracking-wide mb-2">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>
                )}
                <IonButton
                  expand="block"
                  size="large"
                  className="h-14 font-semibold rounded-lg"
                  onClick={handleNavigationToMenu}
                >
                  Ver Menú
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          // --- VISTA DE BIENVENIDA POR DEFECTO (CUANDO NO HAY ID) ---
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <IonIcon icon={restaurantOutline} className="text-7xl mb-4" />
            <h2 className="font-bold text-2xl text-gray-700">Bienvenido a Menú AR</h2>
            <p className="mt-2 max-w-xs">
              Escanea un código QR para ver el menú de un restaurante o explora las opciones disponibles.
            </p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
