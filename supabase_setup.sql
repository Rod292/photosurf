-- Créer la table galleries
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer la table photos
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID REFERENCES public.galleries(id) ON DELETE CASCADE,
    original_s3_key TEXT NOT NULL,
    preview_s3_url TEXT NOT NULL,
    filename TEXT NOT NULL,
    filesize BIGINT,
    content_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer la table orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_email TEXT NOT NULL,
    stripe_checkout_id TEXT,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer la table order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL, -- 'digital' ou 'print'
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_photos_gallery_id ON public.photos(gallery_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_photo_id ON public.order_items(photo_id);

-- Activer RLS (Row Level Security)
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent (ignore les erreurs)
DROP POLICY IF EXISTS "Allow public read access to galleries" ON public.galleries;
DROP POLICY IF EXISTS "Allow admin to manage galleries" ON public.galleries;
DROP POLICY IF EXISTS "Allow public read access to photos" ON public.photos;
DROP POLICY IF EXISTS "Allow admin to manage photos" ON public.photos;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to manage orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Allow admin to manage order items" ON public.order_items;

-- Politiques RLS pour galleries (lecture publique, écriture admin uniquement)
CREATE POLICY "Allow public read access to galleries" ON public.galleries
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage galleries" ON public.galleries
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques RLS pour photos (lecture publique, écriture admin uniquement)
CREATE POLICY "Allow public read access to photos" ON public.photos
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage photos" ON public.photos
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques RLS pour orders (accès restreint)
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Allow admin to manage orders" ON public.orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques RLS pour order_items (accès via orders)
CREATE POLICY "Users can view order items for their orders" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Allow admin to manage order items" ON public.order_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
