import { useState, forwardRef } from "react";

// i18n
import { useTranslation } from 'react-i18next';

interface ImageProps {
  imageSrc: string;
  imageAlt: string;
  className?: string;
  onLoad?: () => void;
}

const Image = forwardRef<HTMLImageElement, ImageProps>((
  {
    imageSrc, 
    imageAlt, 
    className,
    onLoad
  }, 
  ref
) => {
  // i18n
  const { t } = useTranslation();

  const [imageLoaded, setImageLoaded] = useState(false);
  const fallbackImage = "/images/no_image.png";

  const srcToUse = imageSrc?.trim() ? imageSrc : fallbackImage;

  return (
    <div className="relative flex justify-center items-center" style={{ backgroundColor: "#383A39"}}>
      {!imageLoaded && (
        <span className="absolute text-[14px] text-white font-bold">{t('text.loading')}</span>
      )}
      <img
        ref={ref}
        src={srcToUse}
        loading="lazy"
        onLoad={() => {
          setImageLoaded(true);
          onLoad?.();
        }}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== window.location.origin + fallbackImage) {
            target.src = fallbackImage;
          }
          setImageLoaded(true);
        }}
        className={className}
        alt={imageAlt}
      />
    </div>
  )
})

export default Image;