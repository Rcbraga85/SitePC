-- Migração: colunas para data dinâmica, custo/frame (fps_medio) e links parcelados.
-- Execute uma vez em bancos já criados antes desta alteração.

ALTER TABLE "Home" ADD COLUMN IF NOT EXISTS link_parcelado TEXT;
ALTER TABLE "Home" ADD COLUMN IF NOT EXISTS fps_medio NUMERIC(12, 4);
ALTER TABLE "Home" ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMPTZ;

ALTER TABLE "Monitores" ADD COLUMN IF NOT EXISTS link_parcelado TEXT;
ALTER TABLE "Monitores" ADD COLUMN IF NOT EXISTS fps_medio NUMERIC(12, 4);
ALTER TABLE "Monitores" ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMPTZ;

ALTER TABLE "Pcs_Usados" ADD COLUMN IF NOT EXISTS link_parcelado TEXT;
ALTER TABLE "Pcs_Usados" ADD COLUMN IF NOT EXISTS fps_medio NUMERIC(12, 4);
ALTER TABLE "Pcs_Usados" ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMPTZ;
