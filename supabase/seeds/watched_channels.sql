INSERT INTO watched_channels (platform, channel_id, channel_name, channel_url, category, is_active) VALUES
-- Food FR
('youtube', 'UCun3kLMBjOe_YALSaKxarIg', 'FastGoodCuisine', 'https://youtube.com/@FastGoodCuisine', 'food_fr', true),
('youtube', 'UCT0RY6LDFIH-UwaqfbwQFTQ', 'Gastronogeek', 'https://youtube.com/@Gastronogeek', 'food_fr', true),
('youtube', 'UCJmhFGl8YjlFhJl0ltFZ59Q', 'IbraTV', 'https://youtube.com/@IbraTV', 'food_fr', true),
('youtube', 'UCVJnSxQo8F7d9LT-I97W9Ig', 'Valouzz', 'https://youtube.com/@Valouzz', 'food_fr', true),

-- Food International
('youtube', 'UCMyOj6fhvKFMjxUCpkVj3dg', 'Nick DiGiovanni', 'https://youtube.com/@NickDigiovanni', 'food_intl', true),
('youtube', 'UCcjhYlDx7Kp_GXophkLaFNg', 'Mythical Kitchen', 'https://youtube.com/@mythicalkitchen', 'food_intl', true),
('youtube', 'UChBEbMKI1eCcejTtmI32UEw', 'Joshua Weissman', 'https://youtube.com/@JoshuaWeissman', 'food_intl', true),
('youtube', 'UCDq5v10l4wkV5-ZBIJJFbzQ', 'CZN Burak', 'https://youtube.com/@cznburak', 'food_intl', true),

-- Shorts Food Viral
('youtube', 'UCIwFjwMjI0y7PDBVEO9-bkQ', 'Bayashi', 'https://youtube.com/@BayashiTV', 'shorts_food', true),
('youtube', 'UCe5bH4EPQY-dPp10nDuePbQ', 'That Little Puff', 'https://youtube.com/@ThatLittlePuff', 'shorts_food', true),
('youtube', 'UCJHA_jMfCvEnv-3kRjTCQXw', 'Binging with Babish', 'https://youtube.com/@BabishCulinaryUniverse', 'shorts_food', true),

-- Entertainment/Humor (formats adaptables food)
('youtube', 'UCWOA1ZGiwLbDQJk2xYePJTA', 'Squeezie', 'https://youtube.com/@Squeezie', 'entertainment', true),
('youtube', 'UCWeg2Pkate69NFdBeuRFTAw', 'Michou', 'https://youtube.com/@Michou', 'entertainment', true),
('youtube', 'UCmtOvXHn0WKJB8AZ8e6WHaQ', 'ZHC', 'https://youtube.com/@ZHC', 'entertainment', true),
('youtube', 'UCX6OQ3DkcsbYNE6H8uQQuVA', 'MrBeast', 'https://youtube.com/@MrBeast', 'entertainment', true),

-- TikTok food
('tiktok', 'bayashi.tiktok', 'Bayashi', 'https://tiktok.com/@bayashi.tiktok', 'shorts_food', true),
('tiktok', 'cznburak', 'CZN Burak', 'https://tiktok.com/@cznburak', 'shorts_food', true),
('tiktok', 'nick.digiovanni', 'Nick DiGiovanni', 'https://tiktok.com/@nick.digiovanni', 'food_intl', true),
('tiktok', 'khaby.lame', 'Khaby Lame', 'https://tiktok.com/@khaby.lame', 'entertainment', true)
ON CONFLICT (platform, channel_id) DO NOTHING;
