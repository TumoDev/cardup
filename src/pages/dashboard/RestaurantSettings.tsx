// src/pages/Dashboard/RestaurantSettings.tsx (COMPLETO Y CORREGIDO)

import React, { useState, useEffect } from 'react';
import {
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonTextarea,
  IonToast,
} from '@ionic/react';
import * as restaurantService from '../../services/restaurantService';
import type { UpdateRestaurantData } from '../../services/restaurantService';

// 1. Definimos las props que recibirá el componente
interface RestaurantSettingsProps {
  restaurantId: string | null;
}

// Componente FormField (no necesita cambios)
const FormField: React.FC<{
  label: string; name: string; value: string | number | null | undefined; onIonChange: (e: any) => void;
  type?: 'text' | 'number' | 'email'; placeholder?: string;
}> = ({ label, name, value, onIonChange, type = 'text', placeholder = '' }) => (
  <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
    <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">{label}</IonLabel>
    <IonInput name={name} type={type} value={value} onIonChange={onIonChange} placeholder={placeholder} className="bg-white rounded-lg px-4 border border-gray-300 focus:border-blue-500 custom-input" />
  </IonItem>
);

// 2. Cambiamos la firma del componente para que acepte las props
const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({ restaurantId }) => {
  const [formData, setFormData] = useState<UpdateRestaurantData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'success' });

  // Se elimina la lectura de localStorage de aquí.
  // const restaurantId = localStorage.getItem('restaurantId');

  // 3. Este efecto ahora SÍ funcionará correctamente
  // porque `restaurantId` es una prop que cambia, lo que fuerza la re-ejecución.
  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsLoading(true);
      if (!restaurantId) { // Usa la prop directamente
        setToast({ isOpen: true, message: 'Error: No se encontró un restaurante seleccionado.', color: 'danger' });
        setIsLoading(false);
        setFormData({}); // Limpiamos el formulario si no hay ID
        return;
      }

      try {
        const data = await restaurantService.getRestaurantById(restaurantId);
        if (data) {
          setFormData({
            name: data.name || '', description: data.description || '', city: data.city || '',
            commune: data.commune || '', street: data.street || '', street_number: data.street_number,
          });
        }
      } catch (error: any) {
        setToast({ isOpen: true, message: `Error al cargar datos: ${error.message}`, color: 'danger' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId]); // <-- CAMBIO CLAVE: Ahora el efecto es verdaderamente reactivo.

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!restaurantId) { // Usa la prop
      setToast({ isOpen: true, message: 'No se puede guardar sin un ID de restaurante.', color: 'danger' });
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToUpdate: UpdateRestaurantData = {
        ...formData,
        street_number: formData.street_number ? Number(formData.street_number) : null,
      };
      await restaurantService.updateRestaurant(restaurantId, dataToUpdate);
      setToast({ isOpen: true, message: '¡Restaurante actualizado con éxito!', color: 'success' });
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error al guardar: ${error.message}`, color: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  return (
    <IonCardContent>
      <style>{`.custom-input .native-input { padding: 1rem 0.5rem !important; }`}</style>
      <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
        <FormField label="Nombre del Restaurante" name="name" value={formData.name} onIonChange={handleInputChange} placeholder="Ej: La Buena Mesa" />
        <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
          <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">Descripción</IonLabel>
          <IonTextarea name="description" value={formData.description || ''} onIonChange={handleInputChange} autoGrow={true} placeholder="Comida tradicional chilena" className="bg-white rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 min-h-[100px]" />
        </IonItem>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <FormField label="Ciudad" name="city" value={formData.city} onIonChange={handleInputChange} placeholder="Santiago" />
          <FormField label="Comuna" name="commune" value={formData.commune} onIonChange={handleInputChange} placeholder="Providencia" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
          <div className="md:col-span-2">
            <FormField label="Calle" name="street" value={formData.street} onIonChange={handleInputChange} placeholder="Av. Principal" />
          </div>
          <FormField label="Número" name="street_number" type="number" value={formData.street_number} onIonChange={handleInputChange} placeholder="123" />
        </div>
        <IonButton type="submit" expand="block" className="mt-6 h-14 font-medium rounded-lg" disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="dots" /> : 'Guardar Cambios'}
        </IonButton>
      </form>

      <IonToast isOpen={toast.isOpen} message={toast.message} duration={3000} onDidDismiss={() => setToast({ ...toast, isOpen: false })} color={toast.color as any} position="top" />
    </IonCardContent>
  );
};

export default RestaurantSettings;
