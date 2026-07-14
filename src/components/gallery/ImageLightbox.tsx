'use client';

import { useState, useEffect, useCallback } from 'react';

interface LightboxImage {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  caption: string | null;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({ images, currentIndex, isOpen, onClose, onNavigate }: ImageLightboxProps) {
  const image = images[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown, isOpen]);

  if (!isOpen || !image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
        aria-label="Close"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          className="absolute bottom-20 left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          aria-label="Previous image"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          className="absolute bottom-20 right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          aria-label="Next image"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      <div
        className="flex max-h-[85vh] max-w-[90vw] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.imageUrl}
          alt={image.title || image.caption || ''}
          className="max-h-[75vh] rounded-lg object-contain"
        />
        {(image.title || image.description || image.caption) && (
          <div className="mt-3 max-w-lg text-center">
            {image.title && <p className="font-display font-semibold text-white">{image.title}</p>}
            {image.description && <p className="mt-1 text-sm text-white/70">{image.description}</p>}
            {image.caption && !image.title && <p className="text-sm text-white/70">{image.caption}</p>}
          </div>
        )}
        <p className="mt-2 text-xs text-white/40">{currentIndex + 1} / {images.length}</p>
      </div>
    </div>
  );
}
