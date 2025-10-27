-- ====================================
-- Base de Datos: movie_bff
-- Tabla: movie_likes (versión simple)
-- ====================================

-- Crear tabla de likes
CREATE TABLE IF NOT EXISTS movie_likes (
    id VARCHAR(20) PRIMARY KEY,           -- IMDb ID (ej: tt0362120)
    likes INTEGER NOT NULL DEFAULT 0,     -- Cantidad de likes
    CONSTRAINT likes_positive CHECK (likes >= 0)  -- No permitir likes negativos
);

-- Insertar datos de prueba (opcional)
INSERT INTO movie_likes (id, likes) VALUES
    ('tt0362120', 42),      -- Scary Movie 4
    ('tt3387520', 128),     -- Scary Stories to Tell in the Dark
    ('tt0795461', 35),      -- Scary Movie 5
    ('tt9654108', 15),      -- The Scary House
    ('tt1833879', 8)        -- Scary or Die
ON CONFLICT (id) DO NOTHING;

-- Crear índice para búsquedas rápidas (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_movie_likes_id ON movie_likes(id);

-- Comentarios para documentación
COMMENT ON TABLE movie_likes IS 'Tabla simple para almacenar likes de películas';
COMMENT ON COLUMN movie_likes.id IS 'IMDb ID único de la película';
COMMENT ON COLUMN movie_likes.likes IS 'Cantidad total de likes de la película';
