/**
 * Importa Home.csv, Monitores.csv e Pcs_Usados.csv para PostgreSQL.
 * Formato: linhas "Componentes: ..." definem o grupo; cabeçalhos repetidos são ignorados.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const csv = require('csv-parser');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT = path.join(__dirname, '..');

const CSV_PATHS = {
  Home: process.env.CSV_HOME || path.join(ROOT, 'Home.csv'),
  Monitores: process.env.CSV_MONITORES || path.join(ROOT, 'Monitores.csv'),
  Pcs_Usados: process.env.CSV_PCS_USADOS || path.join(ROOT, 'Pcs_Usados.csv'),
};

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'rodrules',
  database: process.env.DB_NAME || 'SitePC_trae',
});

function foldAccents(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugify(str) {
  const base = foldAccents(str).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return base || 'grupo';
}

function parseMoney(raw) {
  if (raw == null) return 0;
  let s = String(raw).trim();
  if (!s) return 0;
  s = s.replace(/R\$\s*/gi, '').replace(/\s/g, '');
  if (s.includes(',') && /\d{1,3}(\.\d{3})+,\d{2}$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',') && !s.includes('.')) {
    s = s.replace(',', '.');
  } else if (s.includes('.') && !s.includes(',')) {
    /* já em formato 1234.56 */
  } else if (s.includes(',') && s.includes('.')) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLink(link) {
  if (link == null || !String(link).trim()) return null;
  const t = String(link).trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/\//, '')}`;
}

function extractDateText(cols) {
  for (let i = cols.length - 1; i >= 0; i -= 1) {
    const raw = String(cols[i] ?? '').trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      // Mantem exatamente o valor DD/MM/AAAA do CSV.
      return raw;
    }
  }
  return null;
}

function rowToArray(row) {
  const nums = Object.keys(row)
    .filter((k) => /^\d+$/.test(k))
    .map(Number);
  if (nums.length === 0) {
    return Object.values(row).map((v) => String(v ?? '').trim());
  }
  const max = Math.max(...nums);
  const arr = [];
  for (let i = 0; i <= max; i += 1) {
    arr.push(String(row[String(i)] ?? '').trim());
  }
  return arr;
}

function isBlankRow(cols) {
  return cols.every((c) => !c);
}

function isHeaderRow(cols) {
  const b = foldAccents(cols[1] || '').replace(/[^a-z]/g, '');
  const c = foldAccents(cols[2] || '').replace(/[^a-z]/g, '');
  return b === 'modelo' && c === 'valor';
}

function collectRowsFromCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    if (!fs.existsSync(filePath)) {
      reject(new Error(`Arquivo não encontrado: ${filePath}`));
      return;
    }
    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(
        csv({
          separator: ';',
          headers: false,
          skipEmptyLines: false,
        })
      )
      .on('data', (row) => {
        rows.push(rowToArray(row));
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

/**
 * Converte linhas brutas em registros { grupo, grupo_slug, grupo_ordem, ordem, peca, modelo, valor, parcelado, loja, link }
 */
function rowsToRecords(rawRows) {
  let grupoOrdem = 0;
  let currentGrupo = null;
  let itemOrdem = 0;
  const records = [];

  for (const cols of rawRows) {
    if (isBlankRow(cols)) continue;

    const first = cols[0] || '';
    if (/^\s*Componentes:/i.test(first)) {
      grupoOrdem += 1;
      currentGrupo = first.replace(/^\s*Componentes:\s*/i, '').trim();
      itemOrdem = 0;
      continue;
    }

    if (isHeaderRow(cols)) continue;

    if (!currentGrupo) continue;

    const peca = cols[0] || '';
    const modelo = cols[1] || '';
    if (!peca && !modelo) continue;

    if (!peca || !modelo) continue;

    itemOrdem += 1;
    const valor = parseMoney(cols[2]);
    const parcelado = cols[3] !== undefined && cols[3] !== '' ? parseMoney(cols[3]) : valor;
    const loja = cols[4] || null;
    const link = normalizeLink(cols[5]);
    const dataAtualizacao = extractDateText(cols);

    records.push({
      grupo: currentGrupo,
      grupo_slug: slugify(currentGrupo),
      grupo_ordem: grupoOrdem,
      ordem: itemOrdem,
      peca,
      modelo,
      valor,
      parcelado,
      loja,
      link,
      dataAtualizacao
    });
  }

  return records;
}

async function importTable(client, tableName, filePath) {
  const raw = await collectRowsFromCsv(filePath);
  const records = rowsToRecords(raw);
  if (records.length === 0) {
    console.warn(`[${tableName}] Nenhum registro extraído de ${filePath}`);
    return 0;
  }

  let inserted = 0;
  for (const r of records) {
    if (tableName === 'Home') {
      await client.query(
        `INSERT INTO "Home" (
          grupo, grupo_slug, grupo_ordem, badge, imagem, fps, custo_frame,
          ordem, peca, modelo, valor, parcelado, loja, link,
          link_parcelado, fps_medio, data_atualizacao
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          r.grupo,
          r.grupo_slug,
          r.grupo_ordem,
          null,
          null,
          null,
          null,
          r.ordem,
          r.peca,
          r.modelo,
          r.valor,
          r.parcelado,
          r.loja,
          r.link,
          null,
          null,
          r.dataAtualizacao
        ]
      );
    } else if (tableName === 'Monitores') {
      await client.query(
        `INSERT INTO "Monitores" (
          grupo, grupo_slug, grupo_ordem, badge, imagem, specs, resolucao, tipo, proporcao,
          ordem, peca, modelo, valor, parcelado, loja, link,
          link_parcelado, fps_medio, data_atualizacao
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          r.grupo,
          r.grupo_slug,
          r.grupo_ordem,
          null,
          null,
          null,
          null,
          null,
          null,
          r.ordem,
          r.peca,
          r.modelo,
          r.valor,
          r.parcelado,
          r.loja,
          r.link,
          null,
          null,
          r.dataAtualizacao
        ]
      );
    } else if (tableName === 'Pcs_Usados') {
      await client.query(
        `INSERT INTO "Pcs_Usados" (
          grupo, grupo_slug, grupo_ordem, badge, imagem, manutencao, fps, custo_frame,
          ordem, peca, modelo, valor, parcelado, loja, link,
          link_parcelado, fps_medio, data_atualizacao
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          r.grupo,
          r.grupo_slug,
          r.grupo_ordem,
          null,
          null,
          null,
          null,
          null,
          r.ordem,
          r.peca,
          r.modelo,
          r.valor,
          r.parcelado,
          r.loja,
          r.link,
          null,
          null,
          r.dataAtualizacao
        ]
      );
    }
    inserted += 1;
  }
  return inserted;
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE "Home", "Monitores", "Pcs_Usados" RESTART IDENTITY');

    const nHome = await importTable(client, 'Home', CSV_PATHS.Home);
    const nMon = await importTable(client, 'Monitores', CSV_PATHS.Monitores);
    const nPcs = await importTable(client, 'Pcs_Usados', CSV_PATHS.Pcs_Usados);

    await client.query('COMMIT');
    console.log('Importação concluída.');
    console.log(`  Home:       ${nHome} linhas (${CSV_PATHS.Home})`);
    console.log(`  Monitores:  ${nMon} linhas (${CSV_PATHS.Monitores})`);
    console.log(`  Pcs_Usados: ${nPcs} linhas (${CSV_PATHS.Pcs_Usados})`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Falha na importação:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
