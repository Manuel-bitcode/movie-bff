-- ====================================
-- Base de Datos: movie_bff
-- Tabla: movie_likes (versión con persistencia)
-- ====================================

-- Crear tabla de likes con control de timestamps
CREATE TABLE IF NOT EXISTS movie_likes (
    id SERIAL PRIMARY KEY,
    imdb_id VARCHAR(20) UNIQUE NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT likes_count_positive CHECK (likes_count >= 0)
);

-- Crear índice para búsquedas rápidas por imdb_id
CREATE INDEX IF NOT EXISTS idx_movie_likes_imdb_id ON movie_likes(imdb_id);

-- Trigger para actualizar updated_at en cada modificación
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_movie_likes_updated_at ON movie_likes;
CREATE TRIGGER trg_movie_likes_updated_at
BEFORE UPDATE ON movie_likes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
