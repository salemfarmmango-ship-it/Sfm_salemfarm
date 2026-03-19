-- Ensure COD setting exists and is enabled
INSERT INTO store_settings (setting_key, setting_value) 
VALUES ('payment_cod_enabled', 'true')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
