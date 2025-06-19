// src/types/model-viewer.d.ts

// Importamos el tipo del elemento directamente desde la librería
import type { ModelViewerElement } from '@google/model-viewer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Le decimos a JSX cómo es el elemento 'model-viewer'
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<ModelViewerElement>, // Props de React (style, className)
        ModelViewerElement // Props del elemento (src, alt, etc.)
      >;
    }
  }
}
