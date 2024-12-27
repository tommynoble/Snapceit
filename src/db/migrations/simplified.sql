-- Drop existing tables if they exist
DROP TABLE IF EXISTS login_history;
DROP TABLE IF EXISTS user_usage_stats;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS billing_addresses;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS users;

-- Core user table (simplified, mainly for Firebase Auth integration)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,  -- Firebase Auth UID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium'
    monthly_scan_count INTEGER DEFAULT 0,
    total_receipts_scanned INTEGER DEFAULT 0
);

-- Receipt table (core functionality)
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,          -- S3 URL
    thumbnail_url TEXT,               -- S3 URL for thumbnail
    merchant_name VARCHAR(255),
    total_amount DECIMAL(10,2),
    transaction_date DATE,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'error'
    extracted_text TEXT,              -- Raw text from Textract
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User settings (simplified)
CREATE TABLE user_settings (
    user_id VARCHAR(50) PRIMARY KEY,
    default_currency VARCHAR(3) DEFAULT 'USD',
    scan_quality VARCHAR(20) DEFAULT 'standard', -- 'standard', 'high'
    notifications_enabled BOOLEAN DEFAULT true,
    dark_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_transaction_date ON receipts(transaction_date);
CREATE INDEX idx_receipts_merchant ON receipts(merchant_name);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
