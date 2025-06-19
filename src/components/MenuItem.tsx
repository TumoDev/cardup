// En src/components/MenuItem.tsx

import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonImg,
  IonIcon,
} from '@ionic/react';
import { star, starOutline, starHalf } from 'ionicons/icons';

// 1. Importa el tipo Product y el cliente de Supabase
import type { Product } from '../services/productService';
import { supabase } from '../utils/supabase';

// 2. La interfaz de props ahora coincide con los nombres de la base de datos
interface MenuItemProps {
  id: Product['id'];
  name: Product['name'];
  price: Product['price'];
  description?: Product['description'];
  rating?: Product['rating'];
  image_path?: Product['image_path']; // Recibe el path de la imagen
}

const MenuItem: React.FC<MenuItemProps> = ({
  id,
  name,
  price,
  description,
  rating,
  image_path, // Se usa image_path
}) => {
  const history = useHistory();

  // 3. Construye la URL pública de la imagen a partir del path
  const imageUrl = image_path
    ? supabase.storage.from('logos').getPublicUrl(image_path).data.publicUrl
    : undefined;

  const handleClick = () => {
    // Es mejor práctica usar el ID en la URL para la página de detalles
    history.push({
      pathname: `/producto/${id}`,
      state: { id, name, price, description, rating, imageUrl }, // Pasa los datos necesarios
    });
  };

  const renderRatingStars = () => {
    if (!rating || rating <= 0) return null; // No muestra nada si no hay rating

    const stars = [];
    const currentRating = Math.min(Math.max(rating, 0), 5);
    const fullStars = Math.floor(currentRating);
    const hasHalfStar = currentRating % 1 >= 0.5;

    for (let i = 1; i <= fullStars; i++) {
      stars.push(<IonIcon key={`full-${i}`} icon={star} color="warning" className="text-sm" />);
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push(<IonIcon key="half" icon={starHalf} color="warning" className="text-sm" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 1; i <= emptyStars; i++) {
      stars.push(<IonIcon key={`empty-${i}`} icon={starOutline} color="warning" className="text-sm" />);
    }

    return (
      <div className="flex items-center mt-1">
        {stars}
        <span className="text-xs text-gray-500 ml-1">({currentRating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <IonCard className="rounded-3xl overflow-hidden shadow-lg mb-4">
      {imageUrl ? (
        <IonImg
          src={imageUrl} // Se usa la URL completa construida
          style={{ height: '12rem', width: '100%', objectFit: 'cover' }}
          alt={name}
          className="bg-gray-100"
        />
      ) : (
        <div style={{ height: '12rem', width: '100%' }} className="bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Sin imagen</span>
        </div>
      )}

      <IonCardHeader className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <IonCardTitle className="text-lg font-bold line-clamp-1">{name}</IonCardTitle>
            {renderRatingStars()}
          </div>
          <span className="text-lg font-bold text-primary whitespace-nowrap">${price.toFixed(2)}</span>
        </div>
      </IonCardHeader>

      <IonCardContent className="px-4 pt-0 pb-3">
        <p className="text-gray-600 mb-3 text-sm line-clamp-2 h-10">{description || 'No hay descripción disponible.'}</p>
        <IonButton expand="block" color="primary" className="font-semibold text-sm" onClick={handleClick}>
          Ver Detalles
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default MenuItem;
