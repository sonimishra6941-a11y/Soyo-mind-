// Helper to read and compress gallery photos for fast & safe localStorage storage

export async function processGalleryImage(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Curated high quality wallpaper gallery presets for users to pick from
export interface GalleryPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  primaryColor: string;
  mode: 'dark' | 'light';
}

export const CURATED_GALLERY_PRESETS: GalleryPreset[] = [
  {
    id: 'cyber-jarvis',
    name: 'Cyber Jarvis Core',
    category: 'Sci-Fi AI',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#38bdf8',
    mode: 'dark',
  },
  {
    id: 'nebula-cosmos',
    name: 'Deep Cosmos Nebula',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#a855f7',
    mode: 'dark',
  },
  {
    id: 'abstract-fluid',
    name: 'Liquid Hologram Wave',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#ec4899',
    mode: 'dark',
  },
  {
    id: 'minimal-mountain',
    name: 'Ethereal Mountain Mist',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#06b6d4',
    mode: 'dark',
  },
  {
    id: 'golden-aurora',
    name: 'Champagne Silk Sunset',
    category: 'Warm',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#f59e0b',
    mode: 'light',
  },
];
