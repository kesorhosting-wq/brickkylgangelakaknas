import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Package } from '@/contexts/SiteContext';
import { useSite } from '@/contexts/SiteContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

interface PackageCardProps {
  pkg: Package;
  selected: boolean;
  onSelect: () => void;
}

// Preload image and cache it
const imageCache = new Map<string, boolean>();

const preloadImage = (src: string): Promise<boolean> => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, true);
      resolve(true);
    };
    img.onerror = () => {
      imageCache.set(src, false);
      resolve(false);
    };
    img.src = src;
  });
};

const PackageCard: React.FC<PackageCardProps> = ({ pkg, selected, onSelect }) => {
  const { settings } = useSite();
  const isMobile = useIsMobile();
  const [iconLoaded, setIconLoaded] = useState(false);
  const [iconError, setIconError] = useState(false);
  
  // Get icon sizes from settings with defaults - use appropriate size based on screen
  const iconSize = isMobile 
    ? (settings.packageIconSizeMobile || 50) 
    : (settings.packageIconSizeDesktop || 32);

  // Determine which icon to use: package icon > global icon > default emoji
  const iconSrc = pkg.icon || settings.packageIconUrl;
  
  // Preload icon on mount
  useEffect(() => {
    if (iconSrc) {
      // Check cache first
      if (imageCache.has(iconSrc)) {
        setIconLoaded(true);
        setIconError(!imageCache.get(iconSrc));
      } else {
        preloadImage(iconSrc).then((success) => {
          setIconLoaded(true);
          setIconError(!success);
        });
      }
    } else {
      setIconLoaded(true); // No icon to load, show emoji
    }
  }, [iconSrc]);
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full overflow-hidden transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        selected && "ring-2 ring-gold ring-offset-2 ring-offset-background"
      )}
    >
      {/* Label badge overlay - positioned at top */}
      {pkg.label && (
        <div 
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-1 px-2 py-0.5 rounded-t-lg"
          style={{
            backgroundColor: pkg.labelBgColor || '#dc2626',
          }}
        >
          {pkg.labelIcon && (
            <img 
              src={pkg.labelIcon} 
              alt="" 
              className="w-4 h-4 object-contain"
              loading="lazy"
            />
          )}
          <span 
            className="text-[10px] sm:text-xs font-bold truncate"
            style={{ color: pkg.labelTextColor || '#ffffff' }}
          >
            {pkg.label}
          </span>
        </div>
      )}

      {/* Banner/Ribbon style container */}
      <div 
        className={cn(
          "relative flex items-center rounded-lg overflow-hidden",
          "shadow-md hover:shadow-lg transition-shadow",
          pkg.label && "rounded-t-none"
        )}
        style={{
          height: `${Math.min(settings.packageHeight || 48, window.innerWidth < 640 ? 40 : settings.packageHeight || 48)}px`,
          background: settings.packageBgImage 
            ? `url(${settings.packageBgImage})` 
            : settings.packageBgColor 
              ? settings.packageBgColor 
              : 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #2d2d2d 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: settings.packageBorderWidth ? `${settings.packageBorderWidth}px solid ${settings.packageBorderColor || '#D4A84B'}` : 'none',
          borderTop: pkg.label ? 'none' : undefined,
        }}
      >
        {/* Left section with icon */}
        <div className="flex items-center px-2 sm:px-3">
          {/* Show skeleton while loading */}
          {!iconLoaded ? (
            <Skeleton 
              className="rounded-md flex-shrink-0"
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
              }}
            />
          ) : iconSrc && !iconError ? (
            <img 
              src={iconSrc} 
              alt="" 
              className="object-contain flex-shrink-0"
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
              }}
              loading="eager"
              decoding="async"
            />
          ) : (
            <span className="flex-shrink-0 text-3xl sm:text-xl">💎</span>
          )}
        </div>
        
        {/* Center section with amount and name - centered */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 leading-tight">
          <span 
            className="truncate text-xs sm:text-sm"
            style={{ 
              color: settings.packageTextColor || '#ffffff',
              fontWeight: settings.packageTextWeight || 700
            }}
          >
            {pkg.amount.toLocaleString()}
          </span>
          <span 
            className="truncate text-[10px] sm:text-xs"
            style={{ 
              color: settings.packageTextColor || '#ffffff',
              fontWeight: settings.packageTextWeight || 700,
              opacity: 0.9
            }}
          >
            {pkg.name}
          </span>
        </div>
        
        {/* Right section with chevron arrow shape */}
        <div 
          className="relative flex items-center justify-end pr-2 sm:pr-3 pl-3 sm:pl-6 h-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
          }}
        >
          {/* Arrow/chevron cutout effect */}
          <div 
            className="absolute left-0 top-0 h-full w-3 sm:w-4"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%)',
            }}
          />
          
          {/* Price */}
          <span 
            className="whitespace-nowrap text-[10px] sm:text-sm"
            style={{ 
              color: settings.packagePriceColor || '#ffffff',
              fontWeight: settings.packagePriceWeight || 700
            }}
          >
            {settings.packageCurrencySymbol || '$'}{pkg.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        {/* Selection checkmark */}
        {selected && (
          <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gold rounded-full flex items-center justify-center z-10">
            <span className="text-primary-foreground text-[10px] sm:text-xs">✓</span>
          </div>
        )}
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </button>
  );
};

export default PackageCard;