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
      invalidDate: "Date invalide"
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
      invalidDate: "Invalid date"
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
      invalidDate: "Ungültiges Datum"
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
    }
  }
}

export function getTranslation(lang: Language) {
  return translations[lang] || translations.fr
}