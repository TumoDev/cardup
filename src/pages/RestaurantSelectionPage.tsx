import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonButton, IonSpinner, IonIcon, IonCard, IonCardContent,
  IonInput, IonToast, IonButtons, IonText, IonAvatar,
  IonAlert
} from '@ionic/react';
import { businessOutline, addCircleOutline, logOutOutline, chevronForwardOutline, trashOutline } from 'ionicons/icons';
import { logout } from '../services/authService';
import * as restaurantService from '../services/restaurantService';
import type { Restaurant, NewRestaurantData } from '../services/restaurantService';


const RestaurantSelectionPage: React.FC = () => {
  const history = useHistory();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'danger' });

  const [showDeleteAlert, setShowDeleteAlert] = useState<{
    isOpen: boolean;
    restaurantId: string | null;
    restaurantName: string | null;
  }>({ isOpen: false, restaurantId: null, restaurantName: null });

  const [formData, setFormData] = useState<NewRestaurantData>({
    name: '', description: '', city: '', commune: '', street: '', streetNumber: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const userRestaurants = await restaurantService.getUserRestaurants();
      setRestaurants(Array.isArray(userRestaurants) ? userRestaurants : []);
    } catch (error: any) {
      if (error.message.includes("Usuario no autenticado")) {
        history.replace('/login');
      } else {
        setToast({ isOpen: true, message: `Error al cargar restaurantes: ${error.message}`, color: 'danger' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSelectRestaurant = (restaurantId: string) => {
    localStorage.setItem('restaurantId', restaurantId);
    history.push(`/dashboard`);
  };

  // --- ✨ SECCIÓN CORREGIDA Y VERIFICADA ---
  // Esta función ahora está completa y maneja su estado 'isSubmitting' de forma independiente.
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.street.trim()) {
      setToast({ isOpen: true, message: 'Nombre, ciudad y calle son obligatorios.', color: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await restaurantService.createRestaurant(formData, logoFile);
      setToast({ isOpen: true, message: '🎉 ¡Restaurante creado con éxito!', color: 'success' });
      setShowCreateForm(false);
      setFormData({ name: '', description: '', city: '', commune: '', street: '', streetNumber: '' });
      setLogoFile(null);
      setLogoPreview(null);
      fetchRestaurants(); // Recarga la lista de restaurantes
    } catch (error: any) {
      setToast({ isOpen: true, message: `❌ Error al crear el restaurante: ${error.message}`, color: 'danger' });
    } finally {
      // Este bloque es ESENCIAL. Se asegura de que el botón de crear se vuelva a habilitar
      // sin importar si la operación tuvo éxito o falló.
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteAlert.restaurantId) return;

    setIsSubmitting(true); // Usamos el mismo estado para deshabilitar todos los botones
    try {
      await restaurantService.deleteRestaurant(showDeleteAlert.restaurantId);
      setToast({ isOpen: true, message: 'Restaurante eliminado correctamente.', color: 'success' });
      setRestaurants(prev => prev.filter(r => r.id !== showDeleteAlert.restaurantId));
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error al eliminar: ${error.message}`, color: 'danger' });
    } finally {
      // También es crucial aquí para re-habilitar los botones después de eliminar
      setIsSubmitting(false);
      setShowDeleteAlert({ isOpen: false, restaurantId: null, restaurantName: null });
    }
  };

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const FormField: React.FC<{
    label: string; value: string; onIonChange: (e: any) => void;
    required?: boolean; type?: string; placeholder?: string;
  }> = ({ label, value, onIonChange, required = false, type = 'text', placeholder = '' }) => (
    <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
      <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">{label}{required && ' *'}</IonLabel>
      <IonInput
        type={type as any}
        value={value}
        onIonChange={onIonChange}
        placeholder={placeholder}
        className="bg-white rounded-lg px-4 border border-gray-300 focus:border-blue-500 custom-input"
      />
    </IonItem>
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#F8F9FA', '--padding-start': '1rem', '--padding-end': '1rem' }}>
          <IonTitle className="font-semibold text-gray-800">Bienvenido</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} fill="clear" className="text-gray-600 capitalize">
              Salir
              <IonIcon slot="end" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding bg-gray-50">
        <style>{`.custom-input .native-input { padding: 1rem 0.5rem !important; }`}</style>
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <IonSpinner name="crescent" className="w-12 h-12 text-blue-600" />
              <IonText className="mt-4 text-gray-500">Cargando tus datos...</IonText>
            </div>
          ) : (
            <>
              <IonCard className="shadow-lg rounded-2xl overflow-hidden">
                <IonCardContent className="p-4 md:p-6">
                  <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-800">Mis Restaurantes</h1>
                    <p className="text-sm text-gray-500 mt-1">Selecciona uno para continuar o crea uno nuevo.</p>
                  </div>

                  {restaurants.length > 0 ? (
                    <IonList lines="none" className="space-y-3">
                      {restaurants.filter(r => r).map((r) => (
                        <IonItem key={r.id} button detail={false} onClick={() => handleSelectRestaurant(r.id)} className="rounded-xl transition-all hover:shadow-md hover:-translate-y-px hover:bg-gray-50">
                          <IonAvatar slot="start" className="w-12 h-12 border-2 border-gray-100 mr-4 bg-gray-200 flex items-center justify-center">
                            {r.logo ? (
                              <img
                                src={r.logo}
                                alt={`Logo de ${r.name}`}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <IonIcon icon={businessOutline} className="text-2xl text-gray-500" />
                            )}
                          </IonAvatar>
                          <IonLabel className="py-2">
                            <h2 className="font-bold text-lg text-gray-800">{r.name}</h2>
                            <p className="text-gray-600 text-sm whitespace-normal">{r.description || 'Sin descripción'}</p>
                          </IonLabel>

                          <IonButton
                            fill="clear"
                            color="danger"
                            slot="end"
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteAlert({ isOpen: true, restaurantId: r.id, restaurantName: r.name });
                            }}
                          >
                            <IonIcon icon={trashOutline} />
                          </IonButton>

                          <IonIcon icon={chevronForwardOutline} slot="end" color="medium" />
                        </IonItem>
                      ))}
                    </IonList>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IonIcon icon={businessOutline} className="text-3xl text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-700">Aún no tienes restaurantes</h3>
                      <IonText><p className="text-sm mt-2 text-gray-500">¡No te preocupes! Crear tu primer restaurante es muy fácil. Haz clic en el botón de abajo para empezar.</p></IonText>
                    </div>
                  )}
                  <IonButton expand="block" fill={showCreateForm ? "outline" : "solid"} onClick={() => setShowCreateForm(!showCreateForm)} className="mt-6 h-14 font-medium rounded-lg">
                    <IonIcon slot="start" icon={addCircleOutline} />
                    {showCreateForm ? 'Cancelar Creación' : 'Crear Nuevo Restaurante'}
                  </IonButton>
                </IonCardContent>
              </IonCard>

              {showCreateForm && (
                <IonCard className="mt-6 animate-fade-in-up shadow-lg rounded-2xl overflow-hidden">
                  <IonCardContent className="p-4 md:p-6">
                    <h1 className="text-xl font-bold text-gray-800 mb-4">Registrar un nuevo espacio</h1>
                    <form onSubmit={handleCreateRestaurant} noValidate>
                      <FormField label="Nombre del Restaurante" value={formData.name} onIonChange={e => setFormData({ ...formData, name: e.detail.value! })} required placeholder="Ej: La Buena Mesa" />
                      <FormField label="Descripción Breve" value={formData.description} onIonChange={e => setFormData({ ...formData, description: e.detail.value! })} placeholder="Comida tradicional chilena" />
                      <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
                        <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">Logo del Restaurante</IonLabel>
                        <div className="flex items-center w-full gap-4 pt-2">
                          <IonButton fill="outline" onClick={() => fileInputRef.current?.click()} className="rounded-lg">
                            Seleccionar Archivo
                          </IonButton>
                          <input ref={fileInputRef} type="file" hidden accept="image/png, image/jpeg, image/webp" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setLogoFile(file);
                              setLogoPreview(URL.createObjectURL(file));
                            }
                          }} />
                          {logoPreview ? (<img src={logoPreview} alt="Vista previa" className="w-16 h-16 rounded-lg object-cover border" />) : (
                            <div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center">
                              <IonIcon icon={businessOutline} className="text-gray-400 text-2xl" />
                            </div>
                          )}
                        </div>
                      </IonItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <FormField label="Ciudad" value={formData.city} onIonChange={e => setFormData({ ...formData, city: e.detail.value! })} required placeholder="Santiago" />
                        <FormField label="Comuna" value={formData.commune} onIonChange={e => setFormData({ ...formData, commune: e.detail.value! })} placeholder="Providencia" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                        <div className="md:col-span-2"><FormField label="Calle" value={formData.street} onIonChange={e => setFormData({ ...formData, street: e.detail.value! })} required placeholder="Av. Principal" /></div>
                        <FormField label="Número" value={formData.streetNumber} onIonChange={e => setFormData({ ...formData, streetNumber: e.detail.value! })} type="number" placeholder="123" />
                      </div>
                      <IonButton type="submit" expand="block" className="mt-4 h-14 font-medium rounded-lg" disabled={isSubmitting}>
                        {isSubmitting ? <IonSpinner name="crescent" /> : 'Guardar Restaurante'}
                      </IonButton>
                    </form>
                  </IonCardContent>
                </IonCard>
              )}
            </>
          )}
        </div>
        <IonToast isOpen={toast.isOpen} message={toast.message} duration={3000} onDidDismiss={() => setToast({ ...toast, isOpen: false })} color={toast.color as any} position="top" />

        <IonAlert
          isOpen={showDeleteAlert.isOpen}
          onDidDismiss={() => setShowDeleteAlert({ isOpen: false, restaurantId: null, restaurantName: null })}
          header={'Confirmar Eliminación'}
          message={`¿Estás seguro de que quieres eliminar <strong>${showDeleteAlert.restaurantName}</strong>? Esta acción no se puede deshacer.`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              cssClass: 'ion-color-danger',
              handler: handleConfirmDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default RestaurantSelectionPage;
