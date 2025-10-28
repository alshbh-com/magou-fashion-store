-- Add governorate_id to orders table to track which governorate was selected
ALTER TABLE orders ADD COLUMN governorate_id uuid REFERENCES governorates(id);

-- Add index for better performance
CREATE INDEX idx_orders_governorate_id ON orders(governorate_id);

-- Add comment
COMMENT ON COLUMN orders.governorate_id IS 'المحافظة المختارة للطلب';