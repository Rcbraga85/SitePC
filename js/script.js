document.addEventListener('DOMContentLoaded', async function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('data-target');
            if (!target) return;

            e.preventDefault();
            navLinks.forEach((item) => item.classList.remove('active'));
            sections.forEach((section) => section.classList.remove('active'));

            link.classList.add('active');
            const targetSection = document.getElementById(`${target}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    const tierMeta = {
        'pc-do-povo': { image: 'images/1.png', badge: 'Economico', fps: '60+ (Full HD)', costPerFrame: 'R$ 41,66' },
        'pc-basico': { image: 'images/2.png', badge: 'Entrada', fps: '100+ (Full HD)', costPerFrame: 'R$ 38,00' },
        'pc-intermediario': { image: 'images/3.png', badge: 'Equilibrado', fps: '144+ (Full HD)', costPerFrame: 'R$ 38,19' },
        'pc-alto-desempenho': { image: 'images/4.png', badge: 'Performance', fps: '100+ (Quad HD)', costPerFrame: 'R$ 85,00' },
        'pc-top': { image: 'images/5.png', badge: 'Elite', fps: '144+ (Quad HD)', costPerFrame: 'R$ 83,33' },
        'pc-entusiasta': { image: 'images/6.png', badge: 'Ultimate', fps: '120+ (4K)', costPerFrame: 'R$ 208,33' }
    };

    const monitorMeta = {
        'monitor-povo': { image: 'images/11.png' },
        'monitor-basico': { image: 'images/22.png' },
        'monitor-intermediario': { image: 'images/33.png' },
        'monitor-alto': { image: 'images/44.png' },
        'monitor-top': { image: 'images/55.png' },
        'monitor-entusiasta': { image: 'images/66.png' }
    };

    const usedMeta = {
        'usado-ryzen-rtx2060': { image: 'images/111.png' },
        'usado-xeon-1050ti': { image: 'images/222.png' },
        'usado-i7-rtx3070ti': { image: 'images/333.png' }
    };

    let cart = [];
    let pcTiers = {};
    let usedPCs = [];
    let monitors = [];
    let tutorials = [];
    let modalPaymentMode = 'cash';
    let lastModalContext = null;

    function parsePrice(value) {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (value === null || value === undefined || value === '') return 0;

        const normalized = String(value)
            .replace(/\s/g, '')
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.');

        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatCurrency(value) {
        return parsePrice(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function parseCostPerFrameSort(val) {
        if (val == null || val === '' || val === '-') return Number.POSITIVE_INFINITY;
        if (typeof val === 'number' && Number.isFinite(val)) return val;
        const n = parsePrice(val);
        return n > 0 && Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    }

    function padUsedComponentsToNine(components) {
        const TARGET = 9;
        const source = (components || []).map((c) => ({ ...c }));
        const fixedNames = ['Fans', 'Gabinete'];
        const dynamic = source.filter((item) => !fixedNames.includes(String(item.part || '').trim()));
        const list = dynamic.slice(0, Math.max(0, TARGET - fixedNames.length));

        fixedNames.forEach((fixedPart) => {
            const existing = source.find((item) => String(item.part || '').trim() === fixedPart);
            list.push(existing || {
                _placeholder: true,
                part: fixedPart,
                name: '—',
                price: 0,
                installment: 0,
                store: '—',
                link: '',
                linkParcelado: null
            });
        });

        while (list.length < TARGET) {
            list.push({
                _placeholder: true,
                part: '—',
                name: '—',
                price: 0,
                installment: 0,
                store: '—',
                link: '',
                linkParcelado: null
            });
        }

        return list.slice(0, TARGET);
    }

    function refreshShareModalLinks() {
        const pageUrl = window.location.href.split('#')[0];
        const setup = lastModalContext?.data;
        const summary = setup
            ? `${setup.name} — À vista: ${formatCurrency(setup.totalValue)}`
            : 'MyGamerSetup';
        const text = encodeURIComponent(`${summary}\n${pageUrl}`);
        const urlEnc = encodeURIComponent(pageUrl);

        const whats = document.querySelector('#share-modal .share-item.whats-social');
        const face = document.querySelector('#share-modal .share-item.face-social');
        const x = document.querySelector('#share-modal .share-item.x-social');
        if (whats) whats.href = `https://wa.me/?text=${text}`;
        if (face) face.href = `https://www.facebook.com/sharer/sharer.php?u=${urlEnc}`;
        if (x) x.href = `https://twitter.com/intent/tweet?text=${text}`;
    }

    function parseMaintenanceLines(text) {
        if (!text || String(text).trim() === '') return [];
        const out = [];
        String(text)
            .split(/\r?\n/)
            .flatMap((ln) => ln.split(/[,;|]/))
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((line) => out.push(line));
        return out;
    }

    function getParcelTotals(components) {
        if (!components || components.length === 0) {
            return { total: 0, perInstallment: 0 };
        }
        const total = components.reduce((sum, c) => {
            const v = parsePrice(c.price);
            const p = Number(c.installment);
            if (Number.isFinite(p) && p > 0) return sum + p;
            return sum + v;
        }, 0);
        const rounded = Number(total.toFixed(2));
        return {
            total: rounded,
            perInstallment: Number((rounded / 10).toFixed(2))
        };
    }

    function rowPriceLabel(comp, mode) {
        if (mode !== 'installment') {
            return formatCurrency(comp.price);
        }
        const p = Number(comp.installment);
        if (Number.isFinite(p) && p > 0) {
            return formatCurrency(p);
        }
        return `10× ${formatCurrency(parsePrice(comp.price) / 10)}`;
    }

    function rowShopHref(comp, mode) {
        if (mode === 'installment') {
            return safeLink(comp.linkParcelado || comp.link);
        }
        return safeLink(comp.link);
    }

    function formatHeroLastUpdate(lastUpdated) {
        const elements = document.querySelectorAll('.last-update');
        if (!elements.length) return;
        if (!lastUpdated || String(lastUpdated).trim() === '' || lastUpdated === 'Data não informada') {
            elements.forEach((el) => {
                el.textContent = 'Última atualização: —';
            });
            return;
        }
        // Exibe a string exatamente como veio da API (ex.: DD/MM/AAAA), sem parse de Date.
        elements.forEach((el) => {
            el.textContent = `Última atualização: ${String(lastUpdated).trim()}`;
        });
    }

    function safeLink(link) {
        if (!link) return '#';
        if (/^https?:\/\//i.test(link)) return link;
        return `https://${link.replace(/^\/+/, '')}`;
    }

    function imageSrcFromDb(imageName, fallbackName) {
        function normalize(val) {
            const s = String(val || '').trim();
            if (!s) return null;
            if (/^https?:\/\//i.test(s)) return s;
            let n = s.replace(/^\/+/, '');
            if (n.startsWith('images/')) {
                while (n.startsWith('images/images/')) {
                    n = n.slice('images/'.length);
                }
                return n;
            }
            return `images/${n}`;
        }

        return normalize(imageName) || normalize(fallbackName) || 'images/1.png';
    }

    function renderHomeCards() {
        const homeGrid = document.querySelector('.pc-grid');
        if (!homeGrid) return;

        homeGrid.innerHTML = Object.entries(pcTiers).map(([key, tier]) => {
            const parcel = getParcelTotals(tier.components || []);

            return `
                <div class="pc-card" data-tier="${key}">
                    <div class="pc-badge">${tier.badge || 'Setup'}</div>
                    <img src="${tier.image}" alt="${tier.name}">
                    <div class="pc-info">
                        <h3>${tier.name}</h3>
                        <div class="pc-stats">
                            <div class="stat"><span>A Vista:</span> <span style="color: var(--accent-purple); font-weight: 600;">${formatCurrency(tier.totalValue)}</span></div>
                            <div class="stat"><span>Parcelado:</span> <span style="color: var(--accent-purple); font-weight: 600;">10x ${formatCurrency(parcel.perInstallment)}</span></div>
                            <div class="stat"><span>FPS:</span> ${tier.fps || '-'}</div>
                            <div class="stat"><span>Custo/Frame:</span> ${tier.costPerFrame || '-'}</div>
                        </div>
                        <button class="btn-details">Ver Componentes</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderMonitors() {
        const monitorsGrid = document.getElementById('monitors-grid');
        if (!monitorsGrid) return;

        monitorsGrid.innerHTML = monitors.map((monitor) => {
            const parcel = getParcelTotals(monitor.components || []);
            const productLink = safeLink(monitor.link);
            const summary = [
                monitor.inches,
                monitor.resolution,
                monitor.hertz,
                monitor.speed,
                monitor.specs,
                monitor.type,
                monitor.ratio
            ].filter(Boolean).join(' | ');

            return `
                <div class="pc-card">
                    <div class="pc-badge">${monitor.badge || 'Monitor'}</div>
                    <a href="${productLink}" target="_blank" rel="noopener noreferrer" class="card-media-link">
                        <img src="${monitor.image}" alt="${monitor.name}">
                    </a>
                    <div class="pc-info">
                        <h3><a href="${productLink}" target="_blank" rel="noopener noreferrer" class="card-title-link">${monitor.name}</a></h3>
                        <p>${summary || monitor.store || 'Monitor recomendado'}</p>
                        <div class="pc-stats monitor-prices">
                            <div class="stat"><span>A Vista:</span> <span class="price-value" style="font-weight: 600;">${formatCurrency(monitor.totalValue)}</span></div>
                            <div class="stat"><span>Parcelado:</span> <span class="price-value" style="font-weight: 600;">10x ${formatCurrency(parcel.perInstallment)}</span></div>
                        </div>
                        <a href="${productLink}" target="_blank" rel="noopener noreferrer" class="btn-details btn-buy-now" style="text-align: center; display: block;">Comprar Agora</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderUsedPCs(items = usedPCs) {
        const usedGrid = document.getElementById('used-grid');
        if (!usedGrid) return;

        usedGrid.innerHTML = items.map((pc) => {
            const parcel = getParcelTotals(pc.components || []);
            const productLink = safeLink(pc.link);
            return `
                <div class="pc-card" data-tier="${pc.key}">
                    <a href="${productLink}" target="_blank" rel="noopener noreferrer" class="card-media-link">
                        <img src="${pc.image}" alt="${pc.name}" style="transition: transform 0.5s ease;">
                    </a>
                    <div class="pc-info">
                        <h3><a href="${productLink}" target="_blank" rel="noopener noreferrer" class="card-title-link">${pc.name}</a></h3>
                        <div class="pc-stats">
                            <div class="stat"><span>A Vista:</span> <span style="color: var(--accent-purple); font-weight: 600;">${formatCurrency(pc.totalValue)}</span></div>
                            <div class="stat"><span>Parcelado:</span> <span style="color: var(--accent-purple); font-weight: 600;">10x ${formatCurrency(parcel.perInstallment)}</span></div>
                            <div class="stat"><span>FPS:</span> ${pc.fps || '-'}</div>
                            <div class="stat"><span>Custo/Frame:</span> ${pc.costPerFrame || '-'}</div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <button class="btn-details">Ver Componentes</button>
                            <button class="btn-details btn-maintenance" style="background: var(--accent-blue); border-color: var(--accent-blue);">Manutencao</button>
                        </div>
                        <a href="${productLink}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-buy-used btn-buy-now-green" style="display:block; text-align:center;">Comprar Agora</a>
                        <a href="${pc.link}" target="_blank" class="btn-youtube"><i class="fab fa-youtube"></i> Assistir Review</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    function showTierDetails(data, isUsed, opts = {}) {
        const modalContent = document.querySelector('.pc-config-result');
        const modalTitle = document.querySelector('#result-modal h2');
        const resultModal = document.getElementById('result-modal');

        if (opts.paymentMode) {
            modalPaymentMode = opts.paymentMode;
        } else if (!opts.keepPaymentMode) {
            modalPaymentMode = 'cash';
        }

        lastModalContext = { data, isUsed };

        modalTitle.innerHTML = `Componentes: <span>${data.name}</span>`;

        const mode = modalPaymentMode;
        const displayComponents = isUsed ? padUsedComponentsToNine(data.components) : (data.components || []);

        let html = isUsed
            ? `
            <div class="component-list-header component-list-header--used">
                <div>Peca</div>
                <div>Modelo</div>
            </div>
        `
            : `
            <div class="component-list-header">
                <div>Peca</div>
                <div>Modelo</div>
                <div>Valor</div>
                <div>Loja</div>
            </div>
        `;

        displayComponents.forEach((comp) => {
            if (isUsed) {
                html += `
                    <div class="component-row component-row--used${comp._placeholder ? ' component-row--placeholder' : ''}">
                        <div class="comp-part">${comp.part || '-'}</div>
                        <div class="comp-name">${comp.name || '-'}</div>
                    </div>
                `;
                return;
            }
            const shopHref = comp._placeholder ? '#' : rowShopHref(comp, mode);
            const priceLabel = comp._placeholder ? '—' : rowPriceLabel(comp, mode);
            html += `
                <div class="component-row${comp._placeholder ? ' component-row--placeholder' : ''}">
                    <div class="comp-part">${comp.part || '-'}</div>
                    <div class="comp-name">${comp.name || '-'}</div>
                    <div class="comp-price">${priceLabel}</div>
                    <div>${comp._placeholder ? '—' : `<a href="${shopHref}" target="_blank" rel="noopener noreferrer" class="shop-link">${comp.store || '-'}</a>`}</div>
                </div>
            `;
        });

        if (!isUsed) {
            html += `
                <div class="modal-components-toolbar">
                    <div class="payment-toggle-group" role="group" aria-label="Forma de pagamento na tabela">
                        <button type="button" class="payment-segment${mode === 'cash' ? ' active' : ''}" data-mode="cash">À vista</button>
                        <button type="button" class="payment-segment${mode === 'installment' ? ' active' : ''}" data-mode="installment">Parcelado</button>
                    </div>
                    <button type="button" class="btn-open-all" id="btn-open-all-links">Abrir Todos</button>
                </div>
            `;
        }
        resultModal.setAttribute('data-active-tier', data.key);
        resultModal.setAttribute('data-is-used', isUsed ? '1' : '0');

        modalContent.innerHTML = html;

        const parcel = getParcelTotals(data.components || []);
        document.querySelector('.price-cash p').innerHTML = `<span>${formatCurrency(data.totalValue)}</span>`;
        document.querySelector('.price-installment').innerHTML = `
            <h3>Parcelado</h3>
            <div class="price-installment-details">
                <span class="total-installment">${formatCurrency(parcel.total)}</span><br>
                <span class="per-installment">10x ${formatCurrency(parcel.perInstallment)}</span>
            </div>
        `;

        resultModal.style.display = 'block';
    }

    function showMaintenance(pc) {
        const maintenanceModal = document.getElementById('maintenance-modal');
        const content = document.getElementById('maintenance-content');
        const lines = parseMaintenanceLines(pc.maintenance);
        const items = lines.length > 0 ? lines : ['Sem historico cadastrado'];

        content.innerHTML = items.map((item) => `
            <div class="maintenance-item"><i class="fas fa-check-circle" style="color: var(--accent-purple); margin-right: 10px;"></i>${item}</div>
        `).join('');

        maintenanceModal.style.display = 'block';
    }

    async function loadPCTiers() {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SITE_DATA}/home`);
        formatHeroLastUpdate(response.lastUpdated);

        pcTiers = Object.fromEntries((response.data || []).map((tier) => {
            const meta = tierMeta[tier.key] || {};
            return [tier.key, {
                ...tier,
                image: imageSrcFromDb(tier.imagem || tier.image, meta.image || '1.png'),
                badge: tier.badge || meta.badge,
                fps: tier.fps || tier.fps_medio || meta.fps,
                costPerFrame: tier.costPerFrame || '-',
                totalValue: parsePrice(tier.totalValue),
                components: (tier.components || []).map((comp) => ({
                    ...comp,
                    price: parsePrice(comp.price),
                    installment: parsePrice(comp.installment),
                    linkParcelado: comp.linkParcelado || null
                }))
            }];
        }));

        renderHomeCards();
    }

    async function loadMonitors() {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SITE_DATA}/monitores`);
        formatHeroLastUpdate(response.lastUpdated);
        monitors = (response.data || []).map((item) => {
            const meta = monitorMeta[item.key] || {};
            return {
                ...item,
                image: imageSrcFromDb(item.imagem || item.image, meta.image || '11.png'),
                totalValue: parsePrice(item.totalValue),
                components: (item.components || []).map((c) => ({
                    ...c,
                    price: parsePrice(c.price),
                    installment: parsePrice(c.installment),
                    linkParcelado: c.linkParcelado || null
                }))
            };
        });

        renderMonitors();
    }

    async function loadUsedPCs() {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SITE_DATA}/pcs-usados`);
        formatHeroLastUpdate(response.lastUpdated);
        usedPCs = (response.data || []).map((item) => {
            const meta = usedMeta[item.key] || {};
            const fpsValue = Number(item.fps || item.fps_medio);
            const totalValue = parsePrice(item.totalValue);
            return {
                ...item,
                image: imageSrcFromDb(item.imagem || item.image, meta.image || '111.png'),
                totalValue,
                fps: item.fps || item.fps_medio || '-',
                link_youtube: item.link_youtube || item.linkYoutube || '',
                costPerFrame: Number.isFinite(fpsValue) && fpsValue > 0 ? formatCurrency(totalValue / fpsValue) : '-',
                components: (item.components || []).map((comp) => ({
                    ...comp,
                    price: parsePrice(comp.price),
                    installment: parsePrice(comp.installment),
                    linkParcelado: comp.linkParcelado || null
                }))
            };
        });

        renderUsedPCs();
    }

    function renderTutorials(items = tutorials) {
        const tutorialsGrid = document.getElementById('tutorials-grid');
        if (!tutorialsGrid) return;
        tutorialsGrid.innerHTML = items.map((item) => `
            <article class="video-card">
                <a href="${safeLink(item.linkVideo)}" target="_blank" rel="noopener noreferrer" class="card-media-link">
                    <img src="${imageSrcFromDb(item.imagem, '11.png')}" alt="${item.titulo}" class="tutorial-thumb">
                </a>
                <h3 style="margin-top: 1rem;">${item.titulo}</h3>
                <a href="${safeLink(item.linkVideo)}" target="_blank" rel="noopener noreferrer" class="btn-details btn-buy-now" style="text-align: center; display: block;">Assistir Vídeo</a>
            </article>
        `).join('');
    }

    async function loadTutorials() {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SITE_DATA}/tutorials`);
        tutorials = (response.data || []).map((item) => ({
            titulo: item.titulo || item.Titulo || 'Tutorial',
            linkVideo: item.link_video || item.linkVideo || '#',
            imagem: item.imagem || item.Imagem || '11.png'
        }));
        renderTutorials();
    }

    async function handleCepLookup() {
        const cep = String(document.getElementById('cep-input')?.value || '').replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) return;

            const streetInput = document.getElementById('address-street');
            const neighborhoodInput = document.getElementById('address-neighborhood');
            const cityStateInput = document.getElementById('address-city-state');
            if (streetInput) streetInput.value = data.logradouro || '';
            if (neighborhoodInput) neighborhoodInput.value = data.bairro || '';
            if (cityStateInput) cityStateInput.value = `${data.localidade || ''}/${data.uf || ''}`.trim();
        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
        }
    }

    function handleFinalizeOrder() {
        if (cart.length === 0) {
            alert('Adicione itens no carrinho antes de finalizar.');
            return;
        }

        const customerName = document.getElementById('checkout-name')?.value?.trim() || '-';
        const customerEmail = document.getElementById('checkout-email')?.value?.trim() || '-';
        const phone = document.getElementById('checkout-phone')?.value?.trim() || '-';
        const payment = document.querySelector('input[name="payment"]:checked')?.value || 'pix';
        const total = cart.reduce((sum, item) => sum + parsePrice(item.totalValue), 0);
        const lines = [
            'Resumo do pedido',
            '',
            `Nome: ${customerName}`,
            `E-mail: ${customerEmail}`,
            `Telefone: ${phone}`,
            '',
            'Itens:'
        ];

        cart.forEach((item) => {
            lines.push(`- ${item.name} | ${formatCurrency(item.totalValue)} | ${safeLink(item.link || '')}`);
        });
        lines.push('', `Total: ${formatCurrency(total)}`, `Pagamento: ${payment === 'pix' ? 'PIX' : 'Cartão de Crédito'}`);

        const subject = encodeURIComponent('Novo pedido - MyGamerSetup');
        const body = encodeURIComponent(lines.join('\n'));
        window.location.href = `mailto:contato@mygamersetup.com?subject=${subject}&body=${body}`;

        const redirectTarget = payment === 'pix' ? 'pix-payment.html' : 'card-processing.html';
        setTimeout(() => {
            window.location.href = redirectTarget;
        }, 200);
    }

    function addToCart(pc) {
        if (!cart.find((item) => item.key === pc.key)) {
            cart.push(pc);
            renderCart();
        }
    }

    function removeFromCart(id) {
        cart = cart.filter((item) => item.key !== id);
        renderCart();
    }

    window.removeFromCart = removeFromCart;

    function updateSummary(total) {
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');

        if (subtotalEl) subtotalEl.textContent = formatCurrency(total);
        if (totalEl) totalEl.textContent = formatCurrency(total);
    }

    function renderCart() {
        const list = document.getElementById('cart-items-list');
        if (!list) return;

        if (cart.length === 0) {
            list.innerHTML = "<p style='text-align: center; padding: 2rem; color: var(--text-secondary);'>Seu carrinho esta vazio.</p>";
            updateSummary(0);
            return;
        }

        list.innerHTML = cart.map((item) => `
            <div class="cart-item" data-id="${item.key}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>PC Gamer Revisado</p>
                    <button class="btn-remove-item" onclick="removeFromCart('${item.key}')">
                        <i class="fas fa-trash"></i> Excluir Item
                    </button>
                </div>
                <div class="cart-item-price">${formatCurrency(item.totalValue)}</div>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + parsePrice(item.totalValue), 0);
        updateSummary(subtotal);
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-details') && !e.target.classList.contains('btn-maintenance')) {
            const card = e.target.closest('.pc-card');
            if (!card) return;

            const tierKey = card.getAttribute('data-tier');
            const isUsed = !!card.closest('#used-grid');
            const data = isUsed ? usedPCs.find((pc) => pc.key === tierKey) : pcTiers[tierKey];
            if (data) showTierDetails(data, isUsed);
        }

        if (e.target.classList.contains('btn-maintenance')) {
            const card = e.target.closest('.pc-card');
            if (!card) return;
            const id = card.getAttribute('data-tier');
            const pc = usedPCs.find((item) => item.key === id);
            if (pc) showMaintenance(pc);
        }

        if (e.target.classList.contains('btn-buy-used')) {
            e.preventDefault();
            const card = e.target.closest('.pc-card');
            if (!card) return;
            const id = card.getAttribute('data-tier');
            const pc = usedPCs.find((item) => item.key === id);
            if (pc) {
                addToCart(pc);
                document.getElementById('cart-nav-link').click();
            }
        }

        const paymentSeg = e.target.closest('.payment-segment');
        if (paymentSeg && lastModalContext) {
            const mode = paymentSeg.getAttribute('data-mode');
            if (mode === 'cash' || mode === 'installment') {
                e.preventDefault();
                showTierDetails(lastModalContext.data, lastModalContext.isUsed, {
                    keepPaymentMode: true,
                    paymentMode: mode
                });
            }
        }

        if (e.target.id === 'btn-open-all-links' || e.target.closest('#btn-open-all-links')) {
            const resultModal = document.getElementById('result-modal');
            const tierKey = resultModal.getAttribute('data-active-tier');
            const isUsedModal = resultModal.getAttribute('data-is-used') === '1';
            const data = isUsedModal ? usedPCs.find((p) => p.key === tierKey) : pcTiers[tierKey];
            if (!data) return;

            const mode = modalPaymentMode;
            const hrefs = [];
            data.components.forEach((comp) => {
                if (comp._placeholder) return;
                const href = rowShopHref(comp, mode);
                if (href && href !== '#') hrefs.push(href);
            });
            hrefs.forEach((href) => {
                window.open(href, '_blank', 'noopener,noreferrer');
            });
        }

        if (e.target.classList.contains('close-modal')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
        }

        if (e.target.id === 'btn-share-modal') {
            refreshShareModalLinks();
            document.getElementById('share-modal').style.display = 'block';
        }

        if (e.target.id === 'btn-email-modal') {
            document.getElementById('email-modal').style.display = 'block';
        }

        if (e.target.id === 'cancel-email') {
            document.getElementById('email-modal').style.display = 'none';
        }
    });

    document.getElementById('share-modal')?.addEventListener('click', (e) => {
        const t = e.target.closest('#share-insta-copy');
        if (!t) return;
        e.preventDefault();
        const pageUrl = window.location.href.split('#')[0];
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pageUrl).then(() => {
                alert('Link da página copiado. Cole no app do Instagram.');
            }).catch(() => {
                window.prompt('Copie o link:', pageUrl);
            });
        } else {
            window.prompt('Copie o link:', pageUrl);
        }
    });

    const modalEmailForm = document.getElementById('modal-email-form');
    if (modalEmailForm) {
        modalEmailForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            if (!lastModalContext?.data) {
                alert('Abra "Ver Componentes" de um setup antes de enviar.');
                return;
            }
            const toInput = modalEmailForm.querySelector('input[type="email"]');
            const to = toInput?.value?.trim();
            if (!to) return;
            const { data } = lastModalContext;
            const mode = modalPaymentMode;
            const lines = [`Configuração: ${data.name}`, ''];
            (data.components || []).forEach((c) => {
                if (c._placeholder) return;
                const pv = rowPriceLabel(c, mode);
                lines.push(`${c.part || '-'}: ${c.name || '-'} | ${pv} | ${c.store || '-'}`);
            });
            const parcel = getParcelTotals(data.components || []);
            lines.push('', `Total a vista: ${formatCurrency(data.totalValue)}`);
            lines.push(`Parcelado (10x): ${formatCurrency(parcel.perInstallment)}`);
            lines.push('', window.location.href.split('#')[0]);
            const subject = encodeURIComponent(`MyGamerSetup - ${data.name}`);
            let bodyEnc = encodeURIComponent(lines.join('\n'));
            let mailto = `mailto:${to}?subject=${subject}&body=${bodyEnc}`;
            if (mailto.length > 2000) {
                const shortLines = [
                    `Configuração: ${data.name}`,
                    `Total a vista: ${formatCurrency(data.totalValue)}`,
                    '',
                    window.location.href.split('#')[0]
                ];
                bodyEnc = encodeURIComponent(shortLines.join('\n'));
                mailto = `mailto:${to}?subject=${subject}&body=${bodyEnc}`;
            }
            window.location.href = mailto;
        });
    }

    const usedSort = document.getElementById('used-sort');
    if (usedSort) {
        usedSort.addEventListener('change', () => {
            const sorted = [...usedPCs];
            switch (usedSort.value) {
                case 'price-desc':
                    sorted.sort((a, b) => parsePrice(b.totalValue) - parsePrice(a.totalValue));
                    break;
                case 'fps-desc':
                    sorted.sort((a, b) => parsePrice(b.fps) - parsePrice(a.fps));
                    break;
                case 'cost-frame-asc':
                    sorted.sort(
                        (a, b) => parseCostPerFrameSort(a.costPerFrame) - parseCostPerFrameSort(b.costPerFrame)
                    );
                    break;
                case 'price-asc':
                default:
                    sorted.sort((a, b) => parsePrice(a.totalValue) - parsePrice(b.totalValue));
                    break;
            }
            renderUsedPCs(sorted);
        });
    }

    document.getElementById('cep-input')?.addEventListener('blur', handleCepLookup);
    document.getElementById('finalize-order')?.addEventListener('click', handleFinalizeOrder);
    document.getElementById('contact-form')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const name = document.getElementById('contact-name')?.value?.trim() || '-';
        const email = document.getElementById('contact-email')?.value?.trim() || '-';
        const message = document.getElementById('contact-message')?.value?.trim() || '-';
        const subject = encodeURIComponent(`Contato MyGamerSetup - ${name}`);
        const body = encodeURIComponent([
            'Nova mensagem de contato',
            '',
            `Nome: ${name}`,
            `E-mail: ${email}`,
            '',
            message
        ].join('\n'));
        window.location.href = `mailto:contato@mygamersetup.com?subject=${subject}&body=${body}`;
    });

    try {
        await Promise.all([loadPCTiers(), loadMonitors(), loadUsedPCs(), loadTutorials()]);
    } catch (error) {
        console.error('Erro ao carregar dados do site:', error);
        alert('Nao foi possivel carregar os dados do banco. Verifique se o servidor e o banco estao ativos.');
    }
});
