-- Adiciona coluna link_youtube em PCs usados (vídeo do produto).
-- Execute uma vez em bancos já existentes.

ALTER TABLE "Pcs_Usados" ADD COLUMN IF NOT EXISTS link_youtube TEXT;
