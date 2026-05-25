CREATE TABLE IF NOT EXISTS core.director_evaluaciones (
  id SERIAL PRIMARY KEY,
  director_id INT,
  rating INT NOT NULL,
  comentario VARCHAR(500),
  created_at TIMESTAMP(6) DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_director_evaluaciones_director ON core.director_evaluaciones(director_id);
