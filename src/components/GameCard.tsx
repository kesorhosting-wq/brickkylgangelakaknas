import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Game } from '@/contexts/SiteContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2 } from 'lucide-react';

interface GameCardProps {
  game: Game;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardFrameImage?: string;
  cardBorderImage?: string;
  priority?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, cardBgColor, cardBorderColor, cardFrameImage, cardBorderImage, priority = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const frameColor = cardBorderColor || 'hsl(43 74% 49%)';
  const bgColor = cardBgColor || 'hsl(43 74% 70% / 0.15)';
  
  return (
    <div className="group block">
      <div className="relative">
        {/* Modern card with glass effect */}
        <div 
          className="relative rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
          style={{
            background: `linear-gradient(145deg, ${bgColor}, hsl(var(--card) / 0.8))`,
            border: `1px solid ${frameColor}40`,
            boxShadow: `0 8px 32px hsl(43 74% 49% / 0.15), inset 0 1px 0 hsl(43 74% 80% / 0.1)`,
          }}
        >
          {/* Glow effect on hover */}
          <div 
            className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{ background: `linear-gradient(135deg, ${frameColor}40, transparent)` }}
          />
          
          {/* Image container */}
          <div className="relative aspect-square overflow-hidden">
            {/* Skeleton loader */}
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            
            <img 
              src={game.image} 
              alt={game.name}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
            
            {/* Game name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <h3 className="font-khmer text-sm sm:text-base font-bold text-foreground line-clamp-2 drop-shadow-lg">
                {game.name}
              </h3>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
          
          {/* Topup Button */}
          <div className="p-3 sm:p-4 pt-2">
            <Link to={`/topup/${game.slug}`} className="block">
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-background font-semibold transition-all duration-300 shadow-lg hover:shadow-gold/30"
                size="sm"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="font-khmer">Topup</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Corner accents */}
        <div 
          className="absolute -top-0.5 -left-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-tl-xl opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${frameColor}, transparent)` }}
        />
        <div 
          className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-tr-xl opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          style={{ background: `linear-gradient(225deg, ${frameColor}, transparent)` }}
        />
      </div>
    </div>
  );
};

export default GameCard;
