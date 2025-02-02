-- Create Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL
);

-- Create Subcategories table
CREATE TABLE subcategories (
    id INT PRIMARY KEY,
    id_related_category INT NOT NULL,
    subcategory VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL,
    hidden BOOLEAN,
    FOREIGN KEY (id_related_category) REFERENCES categories(id)
);

-- Create Options table
CREATE TABLE options (
    id INT PRIMARY KEY,
    id_related_subcategory INT NOT NULL,
    active BOOLEAN NOT NULL,
    is_default BOOLEAN NOT NULL,
    option VARCHAR(255) NOT NULL,
    strings VARCHAR(50) NOT NULL,
    scale_length VARCHAR(50) NOT NULL,
    zindex DECIMAL(10,2),
    image_url VARCHAR(255),
    view VARCHAR(50),
    color_hardware VARCHAR(50),
    price_usd INT NOT NULL,
    FOREIGN KEY (id_related_subcategory) REFERENCES subcategories(id)
);

-- Add indexes for better performance
CREATE INDEX idx_subcategories_category ON subcategories(id_related_category);
CREATE INDEX idx_options_subcategory ON options(id_related_subcategory);
CREATE INDEX idx_options_active ON options(active);
