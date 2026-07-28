CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq;

SELECT setval(
  'public.orders_order_number_seq',
  GREATEST(COALESCE((SELECT MAX(order_number) FROM public.orders), 0) + 1, 1),
  false
);

UPDATE public.orders
SET
  id = COALESCE(id, gen_random_uuid()::text),
  order_number = COALESCE(order_number, nextval('public.orders_order_number_seq')),
  created_at = COALESCE(created_at, now()),
  status = COALESCE(status, 'pending')
WHERE id IS NULL
   OR order_number IS NULL
   OR created_at IS NULL
   OR status IS NULL;

UPDATE public.order_items
SET
  id = COALESCE(id, gen_random_uuid()::text),
  created_at = COALESCE(created_at, now())
WHERE id IS NULL
   OR created_at IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text,
  ALTER COLUMN order_number SET DEFAULT nextval('public.orders_order_number_seq'),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.order_items
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text,
  ALTER COLUMN created_at SET DEFAULT now();

ALTER SEQUENCE public.orders_order_number_seq OWNED BY public.orders.order_number;

GRANT USAGE, SELECT ON SEQUENCE public.orders_order_number_seq TO anon, authenticated, service_role;