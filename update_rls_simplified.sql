-- Mettre à jour les politiques RLS pour une approche simplifiée
-- Toute personne authentifiée aura accès complet (puisque seul l'admin se connectera)

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Allow admin to manage galleries" ON public.galleries;
DROP POLICY IF EXISTS "Allow admin to manage photos" ON public.photos;
DROP POLICY IF EXISTS "Allow admin to manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to manage order items" ON public.order_items;

-- Nouvelles politiques simplifiées pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to manage galleries" ON public.galleries
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage photos" ON public.photos
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage orders" ON public.orders
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage order items" ON public.order_items
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Aussi pour surf_schools (au cas où)
DROP POLICY IF EXISTS "Allow admin to manage surf schools" ON public.surf_schools;
CREATE POLICY "Allow authenticated users to manage surf schools" ON public.surf_schools
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Activer RLS sur surf_schools si ce n'est pas déjà fait
ALTER TABLE public.surf_schools ENABLE ROW LEVEL SECURITY; 