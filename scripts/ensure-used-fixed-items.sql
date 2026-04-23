-- Garante as linhas fixas "Fans" e "Gabinete" em cada grupo da tabela Pcs_Usados.
-- Execute este script no pgAdmin (Query Tool).

WITH grupos AS (
  SELECT
    grupo_slug,
    MAX(grupo) AS grupo,
    MAX(grupo_ordem) AS grupo_ordem,
    MAX(COALESCE(link, '')) AS link,
    MAX(COALESCE(link_parcelado, '')) AS link_parcelado,
    MAX(COALESCE(loja, '')) AS loja
  FROM "Pcs_Usados"
  GROUP BY grupo_slug
),
itens_fixos AS (
  SELECT 'Fans'::text AS peca, 'A definir'::text AS modelo, 8 AS ordem
  UNION ALL
  SELECT 'Gabinete'::text AS peca, 'A definir'::text AS modelo, 9 AS ordem
)
INSERT INTO "Pcs_Usados" (
  grupo_slug,
  grupo,
  grupo_ordem,
  ordem,
  peca,
  modelo,
  valor,
  parcelado,
  loja,
  link,
  link_parcelado,
  manutencao
)
SELECT
  g.grupo_slug,
  g.grupo,
  g.grupo_ordem,
  f.ordem,
  f.peca,
  f.modelo,
  0,
  0,
  g.loja,
  g.link,
  g.link_parcelado,
  ''
FROM grupos g
CROSS JOIN itens_fixos f
WHERE NOT EXISTS (
  SELECT 1
  FROM "Pcs_Usados" p
  WHERE p.grupo_slug = g.grupo_slug
    AND p.peca = f.peca
);
