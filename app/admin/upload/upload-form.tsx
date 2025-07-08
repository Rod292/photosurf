"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Upload, Loader2, ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { uploadPhotos } from './actions'
import { useToast } from '@/hooks/use-toast'
import { SurfSchool, Gallery, FileMatch } from '@/lib/database.types'

// Schéma de validation avec Zod - utilise any pour FileList côté serveur
const uploadFormSchema = z.object({
  school_id: z.number().min(1, "Veuillez sélectionner une école de surf"),
  gallerySelection: z.string().min(1, "Veuillez sélectionner une galerie"),
  newGalleryName: z.string().optional(),
  galleryDate: z.string().min(1, "La date est requise"),
  originalFiles: z
    .any()
    .refine((files) => files && files.length > 0, "Veuillez sélectionner au moins une photo originale")
    .refine(
      (files) => files && Array.from(files as FileList).every((file) => (file as File).type.startsWith('image/')),
      "Seuls les fichiers image sont autorisés pour les originaux"
    )
    .refine(
      (files) => files && Array.from(files as FileList).every((file) => (file as File).size <= 200 * 1024 * 1024),
      "Chaque fichier original doit faire moins de 200MB"
    )
    .refine(
      (files) => {
        if (!files) return true
        const totalSize = Array.from(files as FileList).reduce((sum, file) => sum + (file as File).size, 0)
        return totalSize <= 1024 * 1024 * 1024 // 1GB total
      },
      "La taille totale des fichiers originaux ne doit pas dépasser 1GB"
    ),
  previewFiles: z
    .any()
    .refine((files) => files && files.length > 0, "Veuillez sélectionner au moins une photo preview")
    .refine(
      (files) => files && Array.from(files as FileList).every((file) => (file as File).type.startsWith('image/')),
      "Seuls les fichiers image sont autorisés pour les previews"
    )
    .refine(
      (files) => files && Array.from(files as FileList).every((file) => (file as File).size <= 200 * 1024 * 1024),
      "Chaque fichier preview doit faire moins de 200MB"
    )
    .refine(
      (files) => {
        if (!files) return true
        const totalSize = Array.from(files as FileList).reduce((sum, file) => sum + (file as File).size, 0)
        return totalSize <= 1024 * 1024 * 1024 // 1GB total
      },
      "La taille totale des fichiers preview ne doit pas dépasser 1GB"
    ),
})

type UploadFormData = z.infer<typeof uploadFormSchema>

interface PhotoUploadFormProps {
  surfSchools: SurfSchool[]
  galleries: Gallery[]
}

// Fonction utilitaire pour formater les tailles de fichiers
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Fonction pour calculer la taille totale des fichiers
function getTotalFileSize(fileList: FileList | null): number {
  if (!fileList) return 0
  return Array.from(fileList).reduce((total, file) => total + file.size, 0)
}

export function PhotoUploadForm({ surfSchools, galleries }: PhotoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showNewGalleryInput, setShowNewGalleryInput] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [fileMatches, setFileMatches] = useState<FileMatch[]>([])
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      school_id: 0,
      gallerySelection: "",
      newGalleryName: "",
      galleryDate: new Date().toISOString().split('T')[0],
    },
  })

  const watchedSchoolId = form.watch("school_id")
  const watchedGallerySelection = form.watch("gallerySelection")
  const watchedOriginalFiles = form.watch("originalFiles")
  const watchedPreviewFiles = form.watch("previewFiles")

  // Filtrer les galeries par école sélectionnée
  const filteredGalleries = galleries.filter(gallery => gallery.school_id === watchedSchoolId)

  // Gérer le changement de sélection de galerie
  const handleGallerySelectionChange = (value: string) => {
    form.setValue("gallerySelection", value)
    setShowNewGalleryInput(value === "new")
    if (value !== "new") {
      form.setValue("newGalleryName", "")
    }
  }

  // Fonction pour apparier les fichiers par nom (tri alphabétique)
  const matchFiles = (originals: FileList | undefined, previews: FileList | undefined): FileMatch[] => {
    if (!originals || !previews) return []
    
    const sortedOriginals = Array.from(originals).sort((a, b) => a.name.localeCompare(b.name))
    const sortedPreviews = Array.from(previews).sort((a, b) => a.name.localeCompare(b.name))
    
    const matches: FileMatch[] = []
    const maxLength = Math.max(sortedOriginals.length, sortedPreviews.length)
    
    for (let i = 0; i < maxLength; i++) {
      const original = sortedOriginals[i] || null
      const preview = sortedPreviews[i] || null
      const matched = original && preview && original.name === preview.name
      
      if (original || preview) {
        matches.push({
          original,
          preview,
          matched: !!matched
        })
      }
    }
    
    return matches
  }

  // Mettre à jour les correspondances quand les fichiers changent
  useEffect(() => {
    const matches = matchFiles(watchedOriginalFiles, watchedPreviewFiles)
    setFileMatches(matches)
  }, [watchedOriginalFiles, watchedPreviewFiles])

  // Nettoyage de l'intervalle
  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  // Soumettre le formulaire
  const onSubmit = async (data: UploadFormData) => {
    try {
      setIsUploading(true)
      
      // Valider que si "new" est sélectionné, un nom de galerie est fourni
      if (data.gallerySelection === "new" && !data.newGalleryName?.trim()) {
        form.setError("newGalleryName", {
          message: "Le nom de la nouvelle galerie est requis"
        })
        return
      }

      // Valider que les fichiers sont bien appariés
      const matches = matchFiles(data.originalFiles, data.previewFiles)
      const hasUnmatchedFiles = matches.some(match => !match.matched)
      const originalCount = data.originalFiles.length
      const previewCount = data.previewFiles.length

      if (originalCount !== previewCount) {
        toast({
          title: "Erreur d'appariement",
          description: `Nombre de fichiers différent : ${originalCount} originaux, ${previewCount} previews`,
          variant: "destructive",
        })
        return
      }

      if (hasUnmatchedFiles) {
        toast({
          title: "Erreur d'appariement",
          description: "Certains fichiers ne correspondent pas. Vérifiez que les noms sont identiques.",
          variant: "destructive",
        })
        return
      }

      // Préparer les données pour le Server Action
      const formData = new FormData()
      formData.append("school_id", data.school_id.toString())
      formData.append("gallerySelection", data.gallerySelection)
      formData.append("galleryDate", data.galleryDate)
      
      if (data.newGalleryName) {
        formData.append("newGalleryName", data.newGalleryName.trim())
      }

      // Ajouter les fichiers triés pour garantir l'ordre
      const sortedOriginals = Array.from(data.originalFiles as FileList).sort((a, b) => (a as File).name.localeCompare((b as File).name))
      const sortedPreviews = Array.from(data.previewFiles as FileList).sort((a, b) => (a as File).name.localeCompare((b as File).name))
      
      sortedOriginals.forEach((file) => {
        formData.append("originalFiles", file as File)
      })
      
      sortedPreviews.forEach((file) => {
        formData.append("previewFiles", file as File)
      })

      const totalPhotos = sortedOriginals.length
      const batchSize = 5 // Traitement par lots de 5 photos
      const totalBatches = Math.ceil(totalPhotos / batchSize)
      
      setTotalFiles(totalPhotos)
      setTotalBatches(totalBatches)
      setUploadedFiles(0)
      setCurrentBatch(0)
      setUploadProgress(0)

      // Simuler le progrès d'upload plus réaliste basé sur les lots
      clearProgressInterval()
      
      let currentFileIndex = 0
      let currentBatchIndex = 0
      
      const estimatedTimePerFile = 3000 // 3 secondes par fichier
      const intervalDelay = estimatedTimePerFile / batchSize // Interval plus réaliste
      
      progressIntervalRef.current = setInterval(() => {
        currentFileIndex++
        
        if (currentFileIndex % batchSize === 0 || currentFileIndex === totalPhotos) {
          currentBatchIndex++
          setCurrentBatch(currentBatchIndex)
        }
        
        setUploadedFiles(Math.min(currentFileIndex, totalPhotos))
        setUploadProgress(Math.min((currentFileIndex / totalPhotos) * 85, 85)) // Max 85% pendant l'upload
        
        // Arrêter la simulation quand on arrive au bout
        if (currentFileIndex >= totalPhotos) {
          clearProgressInterval()
        }
      }, intervalDelay)

      // Appeler le Server Action
      const result = await uploadPhotos(formData)
      
      clearProgressInterval()
      setUploadProgress(100)

      if (result.success) {
        setUploadedFiles(result.uploadedCount || 0)
        toast({
          title: "Upload réussi !",
          description: `${result.uploadedCount} paire(s) de photos ont été téléchargées avec succès.`,
        })
        
        // Reset après un délai pour montrer le succès
        setTimeout(() => {
          form.reset({
            school_id: 0,
            gallerySelection: "",
            newGalleryName: "",
            galleryDate: new Date().toISOString().split('T')[0],
          })
          setShowNewGalleryInput(false)
          setUploadProgress(0)
          setUploadedFiles(0)
          setTotalFiles(0)
          setCurrentBatch(0)
          setTotalBatches(0)
          setFileMatches([])
        }, 2000)
      } else {
        setUploadProgress(0)
        toast({
          title: "Erreur d'upload",
          description: result.error || "Une erreur est survenue lors de l'upload.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      clearProgressInterval()
      setUploadProgress(0)
      
      // Gestion spécifique des erreurs connues
      let errorMessage = "Une erreur inattendue est survenue."
      
      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('Content Too Large')) {
          errorMessage = "Les fichiers sont trop volumineux. Réduisez la taille ou le nombre de fichiers (max 200MB par fichier, 1GB total)."
        } else if (error.message.includes('timeout')) {
          errorMessage = "L'upload a pris trop de temps. Essayez avec moins de fichiers ou une connexion plus rapide."
        } else if (error.message.includes('network')) {
          errorMessage = "Problème de connexion réseau. Vérifiez votre connexion internet."
        }
      }
      
      // Si c'est une erreur fetch avec status 413
      if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
        errorMessage = "Les fichiers sont trop volumineux pour le serveur. Réduisez la taille des images avant l'upload."
      }
      
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Plus long pour les erreurs détaillées
      })
    } finally {
      setIsUploading(false)
    }
  }

  const originalFileCount = watchedOriginalFiles ? watchedOriginalFiles.length : 0
  const previewFileCount = watchedPreviewFiles ? watchedPreviewFiles.length : 0
  const matchedCount = fileMatches.filter(match => match.matched).length
  const isValidMatching = originalFileCount > 0 && previewFileCount > 0 && originalFileCount === previewFileCount && matchedCount === originalFileCount

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sélection école de surf */}
        <FormField
          control={form.control}
          name="school_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                École de surf
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(parseInt(value))
                  // Reset gallery selection when school changes
                  form.setValue("gallerySelection", "")
                }}
                value={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez une école de surf" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {surfSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sélection de galerie */}
        {watchedSchoolId > 0 && (
          <FormField
            control={form.control}
            name="gallerySelection"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Choisir une galerie
                </FormLabel>
                <Select
                  onValueChange={handleGallerySelectionChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez une galerie ou créez-en une nouvelle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Créer une nouvelle galerie
                      </div>
                    </SelectItem>
                    {filteredGalleries.map((gallery) => (
                      <SelectItem key={gallery.id} value={gallery.id.toString()}>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{gallery.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(gallery.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Input pour nouvelle galerie et date */}
        {showNewGalleryInput && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="newGalleryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Nom de la nouvelle galerie
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Session Surf Matin"
                        {...field}
                        value={field.value || ""}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="galleryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Date de la session
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
          </div>
        )}

        {/* Zones d'upload séparées */}
        {watchedGallerySelection && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Originaux */}
            <FormField
              control={form.control}
              name="originalFiles"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-blue-700">
                    Photos Originales (Haute Qualité)
                  </FormLabel>
                  <FormControl>
                    <div 
                      className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                        const files = e.dataTransfer.files
                        if (files) {
                          onChange(files)
                        }
                      }}
                    >
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        className="hidden"
                        id="original-upload"
                        {...field}
                      />
                      <Label
                        htmlFor="original-upload"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <div className="p-3 bg-blue-100 rounded-full">
                          <ImageIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-semibold text-blue-700">
                            Photos Originales
                          </span>
                          <span className="text-xs text-blue-500 block">
                            Glissez ou cliquez pour ajouter
                          </span>
                        </div>
                      </Label>
                    </div>
                  </FormControl>
                  {originalFileCount > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between text-blue-700">
                        <span className="font-medium">{originalFileCount} fichier(s)</span>
                        <span className="text-sm">
                          {formatFileSize(getTotalFileSize(watchedOriginalFiles))}
                        </span>
                      </div>
                      {getTotalFileSize(watchedOriginalFiles) > 1024 * 1024 * 1024 && (
                        <div className="mt-2 text-red-600 text-xs">
                          ⚠️ Taille totale trop importante (max 1GB)
                        </div>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Previews */}
            <FormField
              control={form.control}
              name="previewFiles"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-green-700">
                    Photos Previews (Avec Watermark)
                  </FormLabel>
                  <FormControl>
                    <div 
                      className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50/50 transition-all duration-200"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-green-400', 'bg-green-50')
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-green-400', 'bg-green-50')
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-green-400', 'bg-green-50')
                        const files = e.dataTransfer.files
                        if (files) {
                          onChange(files)
                        }
                      }}
                    >
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        className="hidden"
                        id="preview-upload"
                        {...field}
                      />
                      <Label
                        htmlFor="preview-upload"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <div className="p-3 bg-green-100 rounded-full">
                          <ImageIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-semibold text-green-700">
                            Photos Previews
                          </span>
                          <span className="text-xs text-green-500 block">
                            Glissez ou cliquez pour ajouter
                          </span>
                        </div>
                      </Label>
                    </div>
                  </FormControl>
                  {previewFileCount > 0 && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between text-green-700">
                        <span className="font-medium">{previewFileCount} fichier(s)</span>
                        <span className="text-sm">
                          {formatFileSize(getTotalFileSize(watchedPreviewFiles))}
                        </span>
                      </div>
                      {getTotalFileSize(watchedPreviewFiles) > 1024 * 1024 * 1024 && (
                        <div className="mt-2 text-red-600 text-xs">
                          ⚠️ Taille totale trop importante (max 1GB)
                        </div>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Validation des correspondances */}
        {originalFileCount > 0 && previewFileCount > 0 && (
          <div className={`p-6 rounded-2xl border-2 shadow-lg backdrop-blur-sm transition-all duration-300 ${isValidMatching ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              {isValidMatching ? (
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              )}
              <span className={`font-bold text-lg ${isValidMatching ? 'text-emerald-800' : 'text-red-800'}`}>
                Validation des correspondances
              </span>
            </div>
            
            <div className={`text-sm ${isValidMatching ? 'text-emerald-700' : 'text-red-700'}`}>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="font-bold text-lg">{originalFileCount}</div>
                  <div className="text-xs opacity-75">Originaux</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{previewFileCount}</div>
                  <div className="text-xs opacity-75">Previews</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{matchedCount}</div>
                  <div className="text-xs opacity-75">Correspondances</div>
                </div>
              </div>
              
              {!isValidMatching && (
                <div className="text-sm text-red-700 mt-3 p-3 bg-red-100 rounded-xl border border-red-200">
                  {originalFileCount !== previewFileCount && 
                    "⚠️ Le nombre de fichiers originaux et previews doit être identique."
                  }
                  {originalFileCount === previewFileCount && matchedCount !== originalFileCount &&
                    "⚠️ Les noms de fichiers doivent être identiques entre originaux et previews."
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* Barre de progression */}
        {isUploading && (
          <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                Upload en cours...
              </span>
              <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                {uploadedFiles}/{totalFiles} photos • {Math.round(uploadProgress)}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-4 bg-blue-100" />
            <div className="flex items-center justify-between text-xs text-blue-600">
              <span className="font-medium">Upload des photos originales et previews...</span>
              {totalBatches > 1 && (
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">
                  Lot {currentBatch}/{totalBatches}
                </span>
              )}
            </div>
            {uploadedFiles > 0 && (
              <div className="text-sm text-blue-600 bg-blue-100 rounded-xl p-3 font-medium">
                📤 {uploadedFiles} paire{uploadedFiles > 1 ? 's' : ''} de photos uploadée{uploadedFiles > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isUploading || !watchedGallerySelection || !isValidMatching}
            className="min-w-[240px] h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Upload en cours...
              </>
            ) : uploadProgress === 100 && uploadedFiles > 0 ? (
              <>
                <CheckCircle className="mr-3 h-5 w-5 text-emerald-400" />
                Upload terminé !
              </>
            ) : (
              <>
                <Upload className="mr-3 h-5 w-5" />
                Télécharger les photos
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 