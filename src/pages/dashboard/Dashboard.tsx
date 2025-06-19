import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonMenu,
  IonButtons, IonMenuButton, IonPage, IonList, IonItem, IonLabel, IonIcon,
  IonSpinner, IonAvatar, IonText, IonCard, IonCardContent, IonToast
} from '@ionic/react';
import { menuController } from '@ionic/core';
import {
  restaurantOutline, qrCodeOutline, personCircleOutline, logOutOutline, chevronBackOutline, businessOutline
} from 'ionicons/icons';
import * as restaurantService from '../../services/restaurantService';
import type { Restaurant } from '../../services/restaurantService';
import { logout } from '../../services/authService'; // Re-importamos el servicio de logout

import MenuManagement from './MenuManagement';
import Qr from './Qr';
import RestaurantSettings from './RestaurantSettings';

type ActiveTab = 'menu' | 'qr' | 'restaurant-settings';

const MenuItem: React.FC<{ label: string; icon: string; isActive: boolean; onClick: () => void; isDanger?: boolean; }> =
  ({ label, icon, isActive, onClick, isDanger = false }) => (
    <IonItem
      button
      onClick={onClick}
      className={`rounded-lg mb-2 transition-all duration-200 ${isActive
        ? 'bg-blue-100 text-blue-700 font-bold shadow-sm'
        : isDanger
          ? 'text-gray-600 hover:bg-red-50 hover:text-red-700'
          : 'text-gray-600 hover:bg-gray-100'
        }`}
      detail={false}
      lines="none"
    >
      <IonIcon slot="start" icon={icon} className={`text-xl ${isDanger && 'text-red-600'}`} />
      <IonLabel className="text-base">{label}</IonLabel>
    </IonItem>
  );

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'danger' });

  const history = useHistory();

  useEffect(() => {
    const loadRestaurantDetails = async () => {
      setIsLoading(true);
      const storedRestaurantId = localStorage.getItem('restaurantId');

      if (!storedRestaurantId) {
        history.replace('/restaurant-selection');
        return;
      }

      try {
        const data = await restaurantService.getRestaurantById(storedRestaurantId);
        if (data) {
          setRestaurant(data);
        } else {
          setToast({ isOpen: true, message: 'No se encontró el restaurante seleccionado.', color: 'danger' });
          history.replace('/restaurant-selection');
        }
      } catch (error: any) {
        setToast({ isOpen: true, message: `Error al cargar el restaurante: ${error.message}`, color: 'danger' });
        history.replace('/restaurant-selection');
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurantDetails();
  }, [history]);

  const navigateAndCloseMenu = (path: string) => {
    menuController.close('dashboardMenu');
    history.push(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      menuController.close('dashboardMenu');
      localStorage.removeItem('restaurantId');
      history.replace('/login');
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error al cerrar sesión: ${error.message}`, color: 'danger' });
      setIsLoggingOut(false);
    }
  };

  const selectTabAndCloseMenu = (tab: ActiveTab) => {
    setActiveTab(tab);
    menuController.close('dashboardMenu');
  };

  const renderTitle = () => ({
    menu: 'Gestión de Menú',
    // ===== ¡CORRECCIÓN #2! =====
    // La clave ahora está entre comillas para ser una sintaxis válida.
    'restaurant-settings': 'Configuración de Restaurante',
    qr: 'Mi Código QR',
  }[activeTab] || 'Dashboard');

  const menuItems = [
    { label: 'Gestión de Menú', tab: 'menu' as ActiveTab, icon: restaurantOutline },
    { label: 'Mi Código QR', tab: 'qr' as ActiveTab, icon: qrCodeOutline },
    // ===== ¡CORRECCIÓN #3! =====
    // El 'tab' ahora coincide con el tipo y la lógica de renderizado.
    { label: 'Configuración', tab: 'restaurant-settings' as ActiveTab, icon: personCircleOutline },
  ];

  return (
    <>
      <IonMenu contentId="dashboard-main-content" menuId="dashboardMenu">
        {/* ... (Header y contenido del menú no cambian) ... */}
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'transparent' }}>
            {isLoading ? (
              <div className="flex items-center p-4"><IonSpinner name="crescent" /></div>
            ) : (
              restaurant && (
                <div className="flex items-center p-4">
                  <IonAvatar className="w-12 h-12 border-2 border-gray-200 bg-gray-100 mr-3">
                    {restaurant.logo ? (
                      <img src={restaurant.logo} alt="Logo" className="object-cover" />
                    ) : (
                      <IonIcon icon={businessOutline} className="text-2xl text-gray-400" />
                    )}
                  </IonAvatar>
                  <div className="flex-grow overflow-hidden">
                    <IonText><h2 className="font-bold text-gray-800 truncate">{restaurant.name}</h2></IonText>
                    <IonText color="medium"><p className="text-sm">Panel de Control</p></IonText>
                  </div>
                </div>
              )
            )}
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <div className="flex flex-col justify-between h-full">
            <IonList lines="none">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.tab}
                  label={item.label}
                  icon={item.icon}
                  isActive={activeTab === item.tab}
                  onClick={() => selectTabAndCloseMenu(item.tab)}
                />
              ))}
            </IonList>

            <IonList lines="none">
              <MenuItem
                label="Cambiar de Restaurante"
                icon={chevronBackOutline}
                isActive={false}
                onClick={() => navigateAndCloseMenu('/restaurant-selection')}
              />
              <IonItem
                button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg mb-2 transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-700"
                detail={false}
                lines="none"
              >
                {isLoggingOut ? (
                  <IonSpinner name="dots" className="mx-auto" />
                ) : (
                  <>
                    <IonIcon slot="start" icon={logOutOutline} className="text-xl text-red-600" />
                    <IonLabel className="text-base">Cerrar Sesión</IonLabel>
                  </>
                )}
              </IonItem>
            </IonList>
          </div>
        </IonContent>
      </IonMenu>

      <IonPage id="dashboard-main-content">
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': '#F8F9FA' }}>
            <IonButtons slot="start">
              <IonMenuButton menu="dashboardMenu" className="text-gray-700" />
            </IonButtons>
            <IonTitle className="font-semibold text-gray-800">{renderTitle()}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="ion-padding bg-gray-100">
          <IonCard className="shadow-lg rounded-2xl h-full">
            <IonCardContent className="p-4 md:p-6">
              <>
                {activeTab === 'menu' && <MenuManagement />}
                {activeTab === 'qr' && <Qr />}
                {activeTab === 'restaurant-settings' && <RestaurantSettings />}

              </>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>

      <IonToast
        isOpen={toast.isOpen}
        message={toast.message}
        duration={3000}
        onDidDismiss={() => setToast({ isOpen: false, message: '', color: 'danger' })}
        color={toast.color}
        position="top"
      />
    </>
  );
};

export default Dashboard;
