CREATE OR REPLACE FUNCTION public.validate_order_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.customer_name IS NULL OR btrim(NEW.customer_name) = '' THEN
    RAISE EXCEPTION 'customer_name is required';
  END IF;
  IF NEW.customer_phone IS NULL OR btrim(NEW.customer_phone) = '' THEN
    RAISE EXCEPTION 'customer_phone is required';
  END IF;
  IF NEW.customer_address IS NULL OR btrim(NEW.customer_address) = '' THEN
    RAISE EXCEPTION 'customer_address is required';
  END IF;
  IF NEW.governorate_id IS NULL THEN
    RAISE EXCEPTION 'governorate_id is required';
  END IF;
  IF NEW.total IS NULL OR NEW.total <= 0 THEN
    RAISE EXCEPTION 'total must be greater than zero';
  END IF;
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_before_insert ON public.orders;
CREATE TRIGGER trg_validate_order_before_insert
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order_before_insert();