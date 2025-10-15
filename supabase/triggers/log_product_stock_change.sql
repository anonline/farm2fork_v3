CREATE OR REPLACE FUNCTION public.log_product_stock_change()
RETURNS TRIGGER AS $$
DECLARE
    current_user_uuid UUID;
    system_user_uuid CONSTANT UUID := '00000000-0000-0000-0000-000000000000';
    calculated_change DOUBLE PRECISION;
    jwt_claim TEXT;
BEGIN
    IF OLD.stock IS DISTINCT FROM NEW.stock THEN

        -- Try multiple methods to grab user UUID
        BEGIN
            -- Method 1: Try auth.uid() function (Supabase built-in)
            BEGIN
                current_user_uuid := auth.uid();
                IF current_user_uuid IS NOT NULL THEN
                    RAISE NOTICE 'Got user from auth.uid(): %', current_user_uuid;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'auth.uid() not available: %', SQLERRM;
                    current_user_uuid := NULL;
            END;
            
            -- Method 2: If auth.uid() failed, try JWT claim
            IF current_user_uuid IS NULL THEN
                jwt_claim := current_setting('request.jwt.claim.sub', TRUE);
                RAISE NOTICE 'JWT claim value: %', jwt_claim;
                
                IF jwt_claim IS NOT NULL AND jwt_claim != '' THEN
                    current_user_uuid := jwt_claim::UUID;
                    RAISE NOTICE 'Got user from JWT claim: %', current_user_uuid;
                END IF;
            END IF;
            
            -- Fallback to system user if still null
            IF current_user_uuid IS NULL THEN
                RAISE NOTICE 'No user found, using system user';
                current_user_uuid := system_user_uuid;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error getting user: %', SQLERRM;
                current_user_uuid := system_user_uuid;
        END;

        IF OLD.stock IS NOT NULL AND NEW.stock IS NOT NULL THEN
            calculated_change := (NEW.stock - OLD.stock);
        ELSIF OLD.stock IS NULL AND NEW.stock IS NOT NULL THEN
            calculated_change := NEW.stock;
        ELSE
            calculated_change := NULL;
        END IF;

        INSERT INTO public.stock_log (
            product_id,
            original_stock,
            new_stock,
            change_quantity,
            user_id
        )
        VALUES (
            NEW.id,
            OLD.stock,
            NEW.stock,
            calculated_change,
            current_user_uuid
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

CREATE TRIGGER products_stock_update_log
AFTER UPDATE OF stock ON public."Products"
FOR EACH ROW
WHEN (OLD.stock IS DISTINCT FROM NEW.stock)
EXECUTE FUNCTION public.log_product_stock_change();
