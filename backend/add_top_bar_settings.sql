-- Add Top Bar settings to store_settings table
INSERT INTO store_settings (setting_key, setting_value) 
VALUES ('top_bar_content', 'Free delivery on all orders above ₹1000!')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO store_settings (setting_key, setting_value) 
VALUES ('top_bar_enabled', 'true')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
