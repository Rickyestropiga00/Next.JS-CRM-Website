import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
}

export const ProductImage = ({ src, alt }: ProductImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      unoptimized
      sizes="64px"
      className="object-cover bg-muted"
      onError={() => setImageSrc('/products/product-1.webp')}
    />
  );
};
