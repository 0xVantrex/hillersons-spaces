
// components/ImageGallery.tsx
import React, { useState, useCallback } from 'react';

const ImageGallery= ({ images, title }) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => new Set(prev).add(index));
  }, []);

  const handleImageError = useCallback((index) => {
    setFailedImages(prev => new Set(prev).add(index));
  }, []);

  if (images.length === 0) {
    return (
      <div className="no-images">
        <p>No images available for this project.</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      {images.map((image, index) => (
        <div key={index} className="image-wrapper">
          {!loadedImages.has(index) && !failedImages.has(index) && (
            <div className="image-placeholder">
              <div className="image-loading" />
            </div>
          )}
          {!failedImages.has(index) && (
            <img
              src={image}
              alt={`${title} - Design ${index + 1}`}
              className={`gallery-image ${loadedImages.has(index) ? 'loaded' : ''}`}
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
              loading="lazy"
            />
          )}
          {failedImages.has(index) && (
            <div className="image-error">
              <span>Failed to load image</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
