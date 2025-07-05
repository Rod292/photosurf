// Utilitaires pour améliorer les performances

// Fonction pour retarder le chargement des ressources non critiques
export function loadNonCriticalResources() {
  if (typeof window === "undefined") return

  // Attendre que la page soit complètement chargée
  if (document.readyState === "complete") {
    setTimeout(loadResources, 1000)
  } else {
    window.addEventListener("load", () => {
      setTimeout(loadResources, 1000)
    })
  }
}

function loadResources() {
  // Charger les scripts non critiques
  loadScripts()
  // Précharger les images qui pourraient être nécessaires plus tard
  prefetchImages()
}

function loadScripts() {
  const scripts = [{ src: "https://js.stripe.com/v3/", async: true, defer: true }]

  scripts.forEach((script) => {
    const scriptEl = document.createElement("script")
    scriptEl.src = script.src
    if (script.async) scriptEl.async = true
    if (script.defer) scriptEl.defer = true
    document.body.appendChild(scriptEl)
  })
}

function prefetchImages() {
  // Liste des images à précharger
  const imagesToPrefetch: string[] = [
    // Ajouter ici les URLs des images importantes qui seront nécessaires plus tard
  ]

  imagesToPrefetch.forEach((src) => {
    const link = document.createElement("link")
    link.rel = "prefetch"
    link.as = "image"
    link.href = src
    document.head.appendChild(link)
  })
}

