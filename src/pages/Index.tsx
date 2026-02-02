import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import GameCard from '@/components/GameCard';
import Footer from '@/components/Footer';
import { useSite } from '@/contexts/SiteContext';
import { useFavicon } from '@/hooks/useFavicon';
import { Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const { settings, games, isLoading } = useSite();
  
  // Update favicon dynamically
  useFavicon(settings.siteIcon);

  return (
    <>
      <Helmet>
        <title>{settings.browserTitle || `${settings.siteName} - Game Topup Cambodia`}</title>
        <meta name="description" content="Top up your favorite games instantly. Mobile Legends, Free Fire, PUBG, and more. Fast, secure, and affordable." />
      </Helmet>
      
      <div 
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {settings.backgroundImage && (
          <div className="fixed inset-0 bg-background/80 -z-10" />
        )}
        <Header />
        
        <HeroBanner 
          bannerImage={settings.bannerImage} 
          bannerImages={settings.bannerImages}
          bannerHeight={settings.bannerHeight} 
        />
        
        {/* Games Section */}
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex-1">
          {/* Section Title */}
          <div className="text-center mb-6 sm:mb-10">
            <span className="inline-block px-4 py-1.5 mb-3 text-xs font-medium tracking-wider uppercase bg-gold/10 text-gold rounded-full border border-gold/20">
              Popular Games
            </span>
            <h2 className="font-khmer text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              {settings.heroText}
            </h2>
            <div className="w-24 sm:w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent rounded-full" />
          </div>
          
          {/* Games Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Loader2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                No games available yet. Add games from the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {games.map((game, index) => (
                <GameCard 
                  key={game.id} 
                  game={game}
                  cardBgColor={settings.gameCardBgColor}
                  cardBorderColor={settings.gameCardBorderColor}
                  cardFrameImage={settings.gameCardFrameImage}
                  cardBorderImage={settings.gameCardBorderImage}
                  priority={index < 4}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Footer */}
        <Footer 
          backgroundColor={settings.footerBgColor}
          textColor={settings.footerTextColor}
          copyrightText={settings.footerText}
          socialIcons={{
            telegram: settings.footerTelegramIcon,
            tiktok: settings.footerTiktokIcon,
            facebook: settings.footerFacebookIcon
          }}
          socialUrls={{
            telegram: settings.footerTelegramUrl,
            tiktok: settings.footerTiktokUrl,
            facebook: settings.footerFacebookUrl
          }}
          paymentIcons={settings.footerPaymentIcons}
          paymentIconSize={settings.footerPaymentIconSize}
        />
      </div>
    </>
  );
};

export default Index;
