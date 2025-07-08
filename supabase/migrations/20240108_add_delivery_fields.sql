-- Add delivery-related fields to order_items table
ALTER TABLE public.order_items 
ADD COLUMN delivery_option TEXT CHECK (delivery_option IN ('pickup', 'delivery')),
ADD COLUMN delivery_price DECIMAL(10,2) DEFAULT 0;

-- Update product_type to support new print formats
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_product_type_check,
ADD CONSTRAINT order_items_product_type_check 
CHECK (product_type IN ('digital', 'print_a5', 'print_a4', 'print_a3', 'print_a2'));

-- Add shipping_address field to orders table
ALTER TABLE public.orders 
ADD COLUMN shipping_address JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_delivery_option ON public.order_items(delivery_option);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address ON public.orders USING GIN(shipping_address);