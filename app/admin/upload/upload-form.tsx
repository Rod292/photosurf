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
import { useToast } from '@/components/ui/use-toast'
import { SurfSchool, Gallery, FileMatch } from '@/lib/database.types'

// Schéma de validation avec Zod
const uploadFormSchema = z.object({
  school_id: z.number().min(1, "Veuillez sélectionner une école de surf"),
  gallerySelection: z.string().min(1, "Veuillez sélectionner une galerie"),
  newGalleryName: z.string().optional(),
  galleryDate: z.string().min(1, "La date est requise"),
  originalFiles: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Veuillez sélectionner au moins une photo originale")
    .refine(
      (files) => Array.from(files).every((file) => file.type.startsWith('image/')),
      "Seuls les fichiers image sont autorisés pour les originaux"
    )
    .refine(
      (files) => Array.from(files).every((file) => file.size <= 50 * 1024 * 1024),
      "Chaque fichier original doit faire moins de 50MB"
    ),
  previewFiles: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Veuillez sélectionner au moins une photo preview")
    .refine(
      (files) => Array.from(files).every((file) => file.type.startsWith('image/')),
      "Seuls les fichiers image sont autorisés pour les previews"
    )
    .refine(
      (files) => Array.from(files).every((file) => file.size <= 50 * 1024 * 1024),
      "Chaque fichier preview doit faire moins de 50MB"
    ),
})

type UploadFormData = z.infer<typeof uploadFormSchema>

interface PhotoUploadFormProps {
  surfSchools: SurfSchool[]
  galleries: Gallery[]
}

export function PhotoUploadForm({ surfSchools, galleries }: PhotoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showNewGalleryInput, setShowNewGalleryInput] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
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
      const sortedOriginals = Array.from(data.originalFiles).sort((a, b) => a.name.localeCompare(b.name))
      const sortedPreviews = Array.from(data.previewFiles).sort((a, b) => a.name.localeCompare(b.name))
      
      sortedOriginals.forEach((file) => {
        formData.append("originalFiles", file)
      })
      
      sortedPreviews.forEach((file) => {
        formData.append("previewFiles", file)
      })

      setTotalFiles(sortedOriginals.length)
      setUploadedFiles(0)
      setUploadProgress(0)

      // Simuler le progrès d'upload
      clearProgressInterval()
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

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
      toast({
        title: "Erreur d'upload",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
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
                          <span className="font-medium">{gallery.name}</span>
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
                      <div className="flex items-center gap-2 text-blue-700">
                        <span className="font-medium">{originalFileCount} fichier(s)</span>
                      </div>
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
                      <div className="flex items-center gap-2 text-green-700">
                        <span className="font-medium">{previewFileCount} fichier(s)</span>
                      </div>
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
          <div className={`p-4 rounded-lg border ${isValidMatching ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isValidMatching ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${isValidMatching ? 'text-green-800' : 'text-red-800'}`}>
                Validation des correspondances
              </span>
            </div>
            
            <div className={`text-sm ${isValidMatching ? 'text-green-700' : 'text-red-700'}`}>
              <div className="flex gap-4 mb-2">
                <span>Originaux: {originalFileCount}</span>
                <span>Previews: {previewFileCount}</span>
                <span>Correspondances: {matchedCount}</span>
              </div>
              
              {!isValidMatching && (
                <div className="text-xs text-red-600 mt-2">
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
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Upload en cours...
              </span>
              <span className="text-sm text-blue-700">
                {uploadedFiles}/{totalFiles} paires • {Math.round(uploadProgress)}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <div className="text-xs text-blue-600">
              Upload des photos originales et previews...
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUploading || !watchedGallerySelection || !isValidMatching}
            className="min-w-[200px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload en cours...
              </>
            ) : uploadProgress === 100 && uploadedFiles > 0 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Upload terminé !
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Télécharger les photos
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 