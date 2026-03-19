-- Fix verification_tokens table to support 'login' purpose
ALTER TABLE verification_tokens MODIFY COLUMN purpose ENUM('signup', 'reset', 'login') NOT NULL;
