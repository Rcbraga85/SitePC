DROP TABLE IF EXISTS "Pcs_Usados";
DROP TABLE IF EXISTS "Monitores";
DROP TABLE IF EXISTS "Home";

CREATE TABLE "Home" (
    id SERIAL PRIMARY KEY,
    grupo TEXT NOT NULL,
    grupo_slug TEXT NOT NULL,
    grupo_ordem INTEGER NOT NULL,
    badge TEXT,
    imagem TEXT,
    fps TEXT,
    custo_frame TEXT,
    ordem INTEGER NOT NULL,
    peca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
    parcelado DECIMAL(10, 2) NOT NULL DEFAULT 0,
    loja TEXT,
    link TEXT,
    link_parcelado TEXT,
    fps_medio NUMERIC(12, 4),
    data_atualizacao TIMESTAMPTZ
);

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

CREATE TABLE "Pcs_Usados" (
    id SERIAL PRIMARY KEY,
    grupo TEXT NOT NULL,
    grupo_slug TEXT NOT NULL,
    grupo_ordem INTEGER NOT NULL,
    badge TEXT,
    imagem TEXT,
    manutencao TEXT,
    fps TEXT,
    custo_frame TEXT,
    ordem INTEGER NOT NULL,
    peca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
    parcelado DECIMAL(10, 2) NOT NULL DEFAULT 0,
    loja TEXT,
    link TEXT,
    link_parcelado TEXT,
    link_youtube TEXT,
    fps_medio NUMERIC(12, 4),
    data_atualizacao TIMESTAMPTZ
);

CREATE INDEX idx_home_grupo_slug ON "Home" (grupo_slug, ordem);
CREATE INDEX idx_monitores_grupo_slug ON "Monitores" (grupo_slug, ordem);
CREATE INDEX idx_pcs_usados_grupo_slug ON "Pcs_Usados" (grupo_slug, ordem);
