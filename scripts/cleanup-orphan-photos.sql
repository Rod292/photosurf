-- Script pour nettoyer les photos orphelines
-- Photos qui existent dans la table 'photos' mais dont les fichiers n'existent plus dans les buckets

-- D'abord, voir les photos suspectes (celles qui ont des URLs vides ou nulles)
SELECT 
  p.id,
  p.filename,
  p.original_s3_key,
  p.preview_s3_url,
  p.created_at,
  g.name as gallery_name,
  g.date as gallery_date
FROM photos p
JOIN galleries g ON p.gallery_id = g.id
WHERE p.preview_s3_url IS NULL 
   OR p.preview_s3_url = ''
   OR p.original_s3_key IS NULL 
   OR p.original_s3_key = ''
ORDER BY p.created_at DESC;

-- Ensuite, supprimer ces photos orphelines
-- ATTENTION: Décommentez cette ligne seulement après avoir vérifié les résultats ci-dessus
-- DELETE FROM photos 
-- WHERE preview_s3_url IS NULL 
--    OR preview_s3_url = ''
--    OR original_s3_key IS NULL 
--    OR original_s3_key = '';