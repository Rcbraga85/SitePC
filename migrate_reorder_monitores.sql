-- Migração: reorganiza a ordem física das colunas da tabela "Monitores".
-- Estratégia: renomear tabela antiga, criar nova com ordem correta, copiar dados e remover antiga.
-- Execute esta migração com o banco fora de manutenção concorrente.

BEGIN;

ALTER TABLE "Monitores" RENAME TO "Monitores_old";

CREATE TABLE "Monitores" (
    id SERIAL PRIMARY KEY,
    peca TEXT NOT NULL,
    imagem TEXT,
    polegadas TEXT,
    resolucao TEXT,
    hertz TEXT,
    velocidade TEXT,
    specs TEXT,
    tipo TEXT,
    proporcao TEXT,
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
    link TEXT,
    loja TEXT,
    modelo TEXT NOT NULL,
    parcelado DECIMAL(10, 2) NOT NULL DEFAULT 0,
    link_parcelado TEXT,
    fps_medio NUMERIC(12, 4),
    data_atualizacao TIMESTAMPTZ,
    grupo TEXT NOT NULL,
    grupo_slug TEXT NOT NULL,
    grupo_ordem INTEGER NOT NULL,
    badge TEXT,
    ordem INTEGER NOT NULL
);

INSERT INTO "Monitores" (
    id,
    peca,
    imagem,
    polegadas,
    resolucao,
    hertz,
    velocidade,
    specs,
    tipo,
    proporcao,
    valor,
    link,
    loja,
    modelo,
    parcelado,
    link_parcelado,
    fps_medio,
    data_atualizacao,
    grupo,
    grupo_slug,
    grupo_ordem,
    badge,
    ordem
)
SELECT
    id,
    peca,
    imagem,
    polegadas,
    resolucao,
    hertz,
    velocidade,
    specs,
    tipo,
    proporcao,
    valor,
    link,
    loja,
    modelo,
    parcelado,
    link_parcelado,
    fps_medio,
    data_atualizacao,
    grupo,
    grupo_slug,
    grupo_ordem,
    badge,
    ordem
FROM "Monitores_old";

SELECT setval(pg_get_serial_sequence('"Monitores"', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL)
FROM "Monitores";

DROP TABLE "Monitores_old";

DROP INDEX IF EXISTS idx_monitores_grupo_slug;
CREATE INDEX idx_monitores_grupo_slug ON "Monitores" (grupo_slug, ordem);

COMMIT;
