export type Language = 'fr' | 'en' | 'de'

export const translations = {
  fr: {
    howToFind: {
      title: "Comment retrouver vos photos ?",
      step1: {
        title: "Trouvez votre date",
        description: "Recherchez la galerie correspondant à votre date de session"
      },
      step2: {
        title: "Parcourez les photos",
        description: "Explorez toutes les photos de votre session"
      },
      step3: {
        title: "Commandez",
        description: "Sélectionnez vos photos favorites et passez commande"
      }
    },
    gallery: {
      title: "Nos dernières photos",
      subtitle: "Découvre, télécharge, imprime tes photos de surf sur le spot de La Torche",
      backHome: "Retour à l'accueil",
      activeFilters: "Filtres actifs :",
      clearFilters: "Effacer les filtres",
      invalidDate: "Date invalide",
      sessionTimeWarning: "⚠️ Une session dure 1h20. Si votre cours a commencé à 10h, vos photos peuvent se trouver dans les créneaux 9h-10h59 et 11h-12h59. Idem pour les autres créneaux."
    },
    favorites: {
      title: "Vos photos favorites",
      photoCount: (count: number) => `${count} photo${count > 1 ? 's' : ''} favorite${count > 1 ? 's' : ''}`,
      backHome: "Retour à l'accueil",
      addAllToCart: "Ajouter toutes au panier",
      addingToCart: "Ajout en cours...",
      allInCart: "Toutes dans le panier",
      clearFavorites: "Vider les favoris",
      noFavorites: {
        title: "Aucune photo favorite pour le moment",
        description: "Parcourez nos galeries et cliquez sur le cœur pour ajouter vos photos préférées à vos favoris. Vous pourrez les retrouver facilement ici et les ajouter rapidement à votre panier.",
        exploreGalleries: "Explorer les galeries"
      },
      clickToEnlarge: "Cliquer pour agrandir",
      tips: {
        title: "💡 Conseils pour vos favoris",
        quickAdd: {
          title: "Ajout rapide au panier",
          description: "Utilisez le bouton \"+\" sur chaque photo pour l'ajouter directement au panier"
        },
        localSave: {
          title: "Sauvegarde locale",
          description: "Vos favoris sont sauvegardés sur ce navigateur pendant 30 jours"
        },
        maxPhotos: {
          title: "Maximum 100 photos",
          description: "Gardez vos meilleures photos favorites pour un achat facilité"
        }
      },
      addToCart: "Ajouter au panier",
      alreadyInCart: "Déjà dans le panier"
    },
    photoModal: {
      gallery: "GALERIE",
      digitalPhoto: "Photo Numérique",
      digitalDownload: "Téléchargement haute résolution",
      printPhoto: "Tirage photo",
      professionalPrint: "Impression professionnelle + JPEG inclus",
      startingFrom: "À partir de",
      addToFavorites: "Ajoute à tes favoris et reviens en fin de semaine pour sélectionner les meilleures photos.",
      addToCart: "Ajouter au panier",
      packInstructions: "Ajoutez vos photos une à une, les prix de pack s'appliqueront automatiquement dans le panier",
      tooltips: {
        pack15: "S'applique automatiquement dès que votre total atteint 40€",
        unlimited: "S'applique automatiquement dès que votre total atteint 69€"
      },
      counter: {
        photosRemainingPack15: "photos restantes pour le Pack 15",
        pack15Unlocked: "📷 Pack 15 débloqué !",
        photosRemainingUnlimited: "photos restantes pour le Pack Illimité",
        unlimitedUnlocked: "🎁 Pack Illimité débloqué !",
        photosInCart: (count: number) => `${count} photo${count > 1 ? 's' : ''} dans le panier`,
        noPhotosInCart: "Aucune photo dans le panier"
      },
      pricing: {
        single: "1",
        pack15: "Pack 15",
        unlimited: "Illimité"
      }
    },
    location: {
      sessionsPerDay: "Sessions par jour",
      recentPhotos: "Photos récentes",
      surfSchools: "Écoles de surf",
      cantFindPhotos: "Vous ne trouvez pas vos photos ?",
      contactUs: "Contactez-nous directement et nous vous aiderons à les retrouver",
      contactInstagram: "Nous contacter sur Instagram",
      contactEmail: "Par email",
      officialPartner: "École de Surf Partenaire Officielle",
      sessionsImmortal: "Sessions Surf Immortalisées",
      sessionsDescription: "Photos haute résolution de vos sessions de surf. Présents quotidiennement sur les spots.",
      professionalQuality: "Qualité professionnelle",
      instantDelivery: "Livraison immédiate par email",
      expertise: "Expertise",
      expertiseDescription: "Spécialisés dans la photographie de surf. Connaissance parfaite des conditions et meilleurs angles.",
      allLevels: "Tous niveaux de surfeurs",
      personalizedService: "Service client personnalisé",
      coverageZone: "Zone de Couverture",
      coverageDescription: "Couverture complète des spots de surf."
    }
  },
  en: {
    howToFind: {
      title: "How to find your photos?",
      step1: {
        title: "Find your date",
        description: "Search for the gallery matching your session date"
      },
      step2: {
        title: "Browse photos",
        description: "Explore all photos from your session"
      },
      step3: {
        title: "Order",
        description: "Select your favorite photos and place your order"
      }
    },
    gallery: {
      title: "Our latest photos",
      subtitle: "Discover, download, print your surf photos from La Torche spot",
      backHome: "Back to home",
      activeFilters: "Active filters:",
      clearFilters: "Clear filters",
      invalidDate: "Invalid date",
      sessionTimeWarning: "⚠️ A session lasts 1h20. If your lesson started at 10am, your photos may be in the 9am-10:59am and 11am-12:59pm time slots. Same applies for other time slots."
    },
    favorites: {
      title: "Your favorite photos",
      photoCount: (count: number) => `${count} favorite photo${count > 1 ? 's' : ''}`,
      backHome: "Back to home",
      addAllToCart: "Add all to cart",
      addingToCart: "Adding...",
      allInCart: "All in cart",
      clearFavorites: "Clear favorites",
      noFavorites: {
        title: "No favorite photos yet",
        description: "Browse our galleries and click the heart to add your favorite photos. You can easily find them here and quickly add them to your cart.",
        exploreGalleries: "Explore galleries"
      },
      clickToEnlarge: "Click to enlarge",
      tips: {
        title: "💡 Tips for your favorites",
        quickAdd: {
          title: "Quick add to cart",
          description: "Use the \"+\" button on each photo to add it directly to the cart"
        },
        localSave: {
          title: "Local storage",
          description: "Your favorites are saved in this browser for 30 days"
        },
        maxPhotos: {
          title: "Maximum 100 photos",
          description: "Keep your best favorite photos for easy purchasing"
        }
      },
      addToCart: "Add to cart",
      alreadyInCart: "Already in cart"
    },
    photoModal: {
      gallery: "GALLERY",
      digitalPhoto: "Digital Photo",
      digitalDownload: "High resolution download",
      printPhoto: "Photo Print",
      professionalPrint: "Professional print + JPEG included",
      startingFrom: "Starting from",
      addToFavorites: "Add to your favorites and come back at the end of the week to select the best photos.",
      addToCart: "Add to cart",
      packInstructions: "Add your photos one by one, pack prices will apply automatically in the cart",
      tooltips: {
        pack15: "Applies automatically when your total reaches €40",
        unlimited: "Applies automatically when your total reaches €69"
      },
      counter: {
        photosRemainingPack15: "photos remaining for Pack 15",
        pack15Unlocked: "📷 Pack 15 unlocked!",
        photosRemainingUnlimited: "photos remaining for Unlimited Pack",
        unlimitedUnlocked: "🎁 Unlimited Pack unlocked!",
        photosInCart: (count: number) => `${count} photo${count > 1 ? 's' : ''} in cart`,
        noPhotosInCart: "No photos in cart"
      },
      pricing: {
        single: "1",
        pack15: "Pack 15",
        unlimited: "Unlimited"
      }
    },
    location: {
      sessionsPerDay: "Sessions per day",
      recentPhotos: "Recent photos",
      surfSchools: "Surf schools",
      cantFindPhotos: "Can't find your photos?",
      contactUs: "Contact us directly and we'll help you find them",
      contactInstagram: "Contact us on Instagram",
      contactEmail: "By email",
      officialPartner: "Official Partner Surf School",
      sessionsImmortal: "Surf Sessions Immortalized",
      sessionsDescription: "High resolution photos of your surf sessions. Present daily on the spots.",
      professionalQuality: "Professional quality",
      instantDelivery: "Instant delivery by email",
      expertise: "Expertise",
      expertiseDescription: "Specialized in surf photography. Perfect knowledge of conditions and best angles.",
      allLevels: "All levels of surfers",
      personalizedService: "Personalized customer service",
      coverageZone: "Coverage Area",
      coverageDescription: "Complete coverage of surf spots."
    }
  },
  de: {
    howToFind: {
      title: "Wie finden Sie Ihre Fotos?",
      step1: {
        title: "Finden Sie Ihr Datum",
        description: "Suchen Sie die Galerie für Ihr Sitzungsdatum"
      },
      step2: {
        title: "Fotos durchsuchen",
        description: "Erkunden Sie alle Fotos Ihrer Sitzung"
      },
      step3: {
        title: "Bestellen",
        description: "Wählen Sie Ihre Lieblingsfotos aus und bestellen Sie"
      }
    },
    gallery: {
      title: "Unsere neuesten Fotos",
      subtitle: "Entdecken, herunterladen, drucken Sie Ihre Surffotos vom La Torche Spot",
      backHome: "Zurück zur Startseite",
      activeFilters: "Aktive Filter:",
      clearFilters: "Filter löschen",
      invalidDate: "Ungültiges Datum",
      sessionTimeWarning: "⚠️ Eine Sitzung dauert 1h20. Wenn Ihr Kurs um 10 Uhr begonnen hat, können sich Ihre Fotos in den Zeitfenstern 9-10:59 Uhr und 11-12:59 Uhr befinden. Gleiches gilt für andere Zeitfenster."
    },
    favorites: {
      title: "Ihre Lieblingsfotos",
      photoCount: (count: number) => `${count} Lieblingsfoto${count > 1 ? 's' : ''}`,
      backHome: "Zurück zur Startseite",
      addAllToCart: "Alle in den Warenkorb",
      addingToCart: "Hinzufügen...",
      allInCart: "Alle im Warenkorb",
      clearFavorites: "Favoriten löschen",
      noFavorites: {
        title: "Noch keine Lieblingsfotos",
        description: "Durchsuchen Sie unsere Galerien und klicken Sie auf das Herz, um Ihre Lieblingsfotos hinzuzufügen. Sie können sie hier leicht finden und schnell in Ihren Warenkorb legen.",
        exploreGalleries: "Galerien erkunden"
      },
      clickToEnlarge: "Klicken zum Vergrößern",
      tips: {
        title: "💡 Tipps für Ihre Favoriten",
        quickAdd: {
          title: "Schnell zum Warenkorb hinzufügen",
          description: "Verwenden Sie die \"+\"-Taste bei jedem Foto, um es direkt in den Warenkorb zu legen"
        },
        localSave: {
          title: "Lokale Speicherung",
          description: "Ihre Favoriten werden 30 Tage lang in diesem Browser gespeichert"
        },
        maxPhotos: {
          title: "Maximum 100 Fotos",
          description: "Behalten Sie Ihre besten Lieblingsfotos für einen einfachen Kauf"
        }
      },
      addToCart: "In den Warenkorb",
      alreadyInCart: "Bereits im Warenkorb"
    },
    photoModal: {
      gallery: "GALERIE",
      digitalPhoto: "Digitales Foto",
      digitalDownload: "High-Resolution-Download",
      printPhoto: "Fotoabzug",
      professionalPrint: "Professioneller Druck + JPEG enthalten",
      startingFrom: "Ab",
      addToFavorites: "Zu Ihren Favoriten hinzufügen und am Ende der Woche wiederkommen, um die besten Fotos auszuwählen.",
      addToCart: "In den Warenkorb",
      packInstructions: "Fügen Sie Ihre Fotos einzeln hinzu, Paketpreise werden automatisch im Warenkorb angewendet",
      tooltips: {
        pack15: "Wird automatisch angewendet, wenn Ihr Gesamtbetrag 40€ erreicht",
        unlimited: "Wird automatisch angewendet, wenn Ihr Gesamtbetrag 69€ erreicht"
      },
      counter: {
        photosRemainingPack15: "Fotos übrig für Paket 15",
        pack15Unlocked: "📷 Paket 15 freigeschaltet!",
        photosRemainingUnlimited: "Fotos übrig für Unbegrenztes Paket",
        unlimitedUnlocked: "🎁 Unbegrenztes Paket freigeschaltet!",
        photosInCart: (count: number) => `${count} Foto${count > 1 ? 's' : ''} im Warenkorb`,
        noPhotosInCart: "Keine Fotos im Warenkorb"
      },
      pricing: {
        single: "1",
        pack15: "Paket 15",
        unlimited: "Unbegrenzt"
      }
    },
    location: {
      sessionsPerDay: "Sitzungen pro Tag",
      recentPhotos: "Neueste Fotos",
      surfSchools: "Surfschulen",
      cantFindPhotos: "Können Sie Ihre Fotos nicht finden?",
      contactUs: "Kontaktieren Sie uns direkt und wir helfen Ihnen dabei, sie zu finden",
      contactInstagram: "Kontaktieren Sie uns auf Instagram",
      contactEmail: "Per E-Mail",
      officialPartner: "Offizielle Partner-Surfschule",
      sessionsImmortal: "Surf-Sessions Verewigt",
      sessionsDescription: "Hochauflösende Fotos Ihrer Surf-Sessions. Täglich an den Spots präsent.",
      professionalQuality: "Professionelle Qualität",
      instantDelivery: "Sofortige Lieferung per E-Mail",
      expertise: "Expertise",
      expertiseDescription: "Spezialisiert auf Surf-Fotografie. Perfekte Kenntnis der Bedingungen und besten Winkel.",
      allLevels: "Alle Surfer-Level",
      personalizedService: "Personalisierter Kundenservice",
      coverageZone: "Abdeckungsbereich",
      coverageDescription: "Vollständige Abdeckung der Surf-Spots."
    }
  }
}

export function getTranslation(lang: Language) {
  return translations[lang] || translations.fr
}