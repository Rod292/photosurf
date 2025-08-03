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
    }
  }
}

export function getTranslation(lang: Language) {
  return translations[lang] || translations.fr
}