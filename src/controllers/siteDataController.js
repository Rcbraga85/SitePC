const db = require('../database');

function formatBRL(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function computeCostPerFrame(totalValue, fpsMedio, fallbackText, opts = {}) {
  const fps = Number(fpsMedio);
  if (Number.isFinite(fps) && fps > 0 && Number.isFinite(totalValue) && totalValue >= 0) {
    return formatBRL(totalValue / fps);
  }
  if (opts.strictFpsOnly) return '-';
  if (fallbackText != null && String(fallbackText).trim() !== '') {
    return String(fallbackText);
  }
  return '-';
}

async function fetchLastUpdated() {
  const { rows } = await db.query(`
    SELECT MAX(m) AS last_updated
    FROM (
      SELECT MAX(data_atualizacao) AS m FROM "Home"
      UNION ALL
      SELECT MAX(data_atualizacao) FROM "Monitores"
      UNION ALL
      SELECT MAX(data_atualizacao) FROM "Pcs_Usados"
    ) s
  `);
  const raw = rows[0]?.last_updated;
  if (raw == null) return null;
  const s = String(raw).trim();
  return s ? s : null;
}

function groupRows(rows, extras = () => ({}), options = {}) {
  const groups = new Map();

  for (const row of rows) {
    if (!groups.has(row.grupo_slug)) {
      groups.set(row.grupo_slug, {
        key: row.grupo_slug,
        name: row.grupo,
        badge: row.badge,
        imagem: row.imagem,
        image: row.imagem,
        fps: row.fps,
        costPerFrame: row.custo_frame,
        fpsMedio: null,
        fps_medio: null,
        specs: row.specs,
        inches: row.polegadas,
        resolution: row.resolucao,
        hertz: row.hertz,
        speed: row.velocidade,
        type: row.tipo,
        ratio: row.proporcao,
        maintenance: '',
        maintenanceLines: [],
        linkYoutube:
          row.link_youtube != null && String(row.link_youtube).trim() !== ''
            ? String(row.link_youtube).trim()
            : null,
        link_youtube:
          row.link_youtube != null && String(row.link_youtube).trim() !== ''
            ? String(row.link_youtube).trim()
            : null,
        store: row.loja,
        link: row.link,
        linkParcelado: row.link_parcelado,
        totalValue: 0,
        components: []
      });
    }

    const group = groups.get(row.grupo_slug);
    const price = Number(row.valor) || 0;
    const parceladoVal = Number(row.parcelado) || 0;
    group.totalValue += price;

    const rowFpsMedio = row.fps_medio != null ? Number(row.fps_medio) : null;
    if (rowFpsMedio != null && Number.isFinite(rowFpsMedio) && rowFpsMedio > 0) {
      if (group.fpsMedio == null || !Number.isFinite(group.fpsMedio) || group.fpsMedio <= 0) {
        group.fpsMedio = rowFpsMedio;
        group.fps_medio = rowFpsMedio;
      } else {
        group.fpsMedio = Math.max(group.fpsMedio, rowFpsMedio);
        group.fps_medio = group.fpsMedio;
      }
    }

    if (row.manutencao != null && String(row.manutencao).trim() !== '') {
      String(row.manutencao)
        .split(/\r?\n/)
        .flatMap((ln) => ln.split(/[,;|]/))
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((line) => group.maintenanceLines.push(line));
    }

    if (row.link_youtube != null && String(row.link_youtube).trim() !== '') {
      const y = String(row.link_youtube).trim();
      group.linkYoutube = group.linkYoutube || y;
      group.link_youtube = group.link_youtube || y;
    }

    group.link = group.link || row.link;
    group.linkParcelado = group.linkParcelado || row.link_parcelado;
    group.store = group.store || row.loja;

    group.components.push({
      part: row.peca,
      name: row.modelo,
      price,
      installment: parceladoVal,
      store: row.loja,
      link: row.link,
      linkParcelado: row.link_parcelado
    });
  }

  const enrich = typeof extras === 'function' ? extras : () => ({});
  return Array.from(groups.values()).map((item, index) => {
    const totalValue = Number(item.totalValue.toFixed(2));
    const maintenance =
      item.maintenanceLines && item.maintenanceLines.length > 0
        ? item.maintenanceLines.join('\n')
        : '';
    const { maintenanceLines, ...rest } = item;
    const computedCost = options.strictCostPerFrame
      ? computeCostPerFrame(totalValue, rest.fpsMedio, null, { strictFpsOnly: true })
      : computeCostPerFrame(totalValue, rest.fpsMedio, rest.costPerFrame);
    return {
      ...enrich(rest, index),
      ...rest,
      maintenance,
      totalValue,
      costPerFrame: computedCost
    };
  });
}

exports.getHome = async (req, res, next) => {
  try {
    const [{ rows }, lastUpdated] = await Promise.all([
      db.query(`
        SELECT *
        FROM "Home"
        ORDER BY grupo_ordem ASC, ordem ASC
      `),
      fetchLastUpdated()
    ]);

    return res.status(200).json({
      success: true,
      lastUpdated: lastUpdated || 'Data não informada',
      data: groupRows(rows)
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonitors = async (req, res, next) => {
  try {
    const [{ rows }, lastUpdated] = await Promise.all([
      db.query(`
        SELECT *
        FROM "Monitores"
        ORDER BY grupo_ordem ASC, ordem ASC
      `),
      fetchLastUpdated()
    ]);

    return res.status(200).json({
      success: true,
      lastUpdated: lastUpdated || 'Data não informada',
      data: groupRows(rows)
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsedPcs = async (req, res, next) => {
  try {
    const [{ rows }, lastUpdated] = await Promise.all([
      db.query(`
        SELECT *
        FROM "Pcs_Usados"
        ORDER BY grupo_ordem ASC, ordem ASC
      `),
      fetchLastUpdated()
    ]);

    return res.status(200).json({
      success: true,
      lastUpdated: lastUpdated || 'Data não informada',
      data: groupRows(rows, () => ({}), { strictCostPerFrame: true })
    });
  } catch (error) {
    next(error);
  }
};

exports.getTutorials = async (req, res, next) => {
  try {
    const query = `
      SELECT titulo, link_video, imagem
      FROM "Tutoriais"
      ORDER BY id ASC
    `;
    const { rows } = await db.query(query);

    return res.status(200).json({
      success: true,
      data: rows.map((row) => ({
        titulo: row.titulo,
        link_video: row.link_video,
        imagem: row.imagem
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.adminUpdateUsedMetrics = async (req, res, next) => {
  try {
    const { updates } = req.body || {};
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Envie um array "updates" com ao menos um item.'
      });
    }

    const results = [];
    for (const item of updates) {
      const grupoSlug = String(item.grupo_slug || '').trim();
      if (!grupoSlug) continue;

      const valor = Number(item.valor);
      const fpsMedio = Number(item.fps_medio);
      const hasValor = Number.isFinite(valor);
      const hasFps = Number.isFinite(fpsMedio);
      if (!hasValor && !hasFps) continue;

      const fields = [];
      const values = [];
      let idx = 1;
      if (hasValor) {
        fields.push(`valor = $${idx++}`);
        values.push(valor);
      }
      if (hasFps) {
        fields.push(`fps_medio = $${idx++}`);
        values.push(fpsMedio);
      }
      values.push(grupoSlug);

      const query = `
        UPDATE "Pcs_Usados"
        SET ${fields.join(', ')}
        WHERE grupo_slug = $${idx}
      `;
      const result = await db.query(query, values);
      results.push({ grupo_slug: grupoSlug, updated_rows: result.rowCount });
    }

    return res.status(200).json({
      success: true,
      message: 'Atualização rápida concluída.',
      data: results
    });
  } catch (error) {
    next(error);
  }
};
