document.addEventListener('DOMContentLoaded', function() {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if (!target) return;

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            const matchingNavLink = document.querySelector(`.nav-link[data-target="${target}"]`);
            if (matchingNavLink) matchingNavLink.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${target}-section`) {
                    section.classList.add('active');
                }
            });

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Global Data
    let cart = [];

    // PC Tiers Data
    const pcTiers = {
        povo: {
            name: "PC do Povo",
            badge: "Econômico",
            image: "images/1.png",
            fps: "60+ (Full HD)",
            costPerFrame: "R$ 41,66",
            components: [
                { part: "Processador (CPU)", name: "Ryzen 5 4600G", price: 650.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa-Mãe", name: "A520M-E", price: 450.00, store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Placa de Video (GPU)", name: "Vídeo Integrado Radeon", price: 0.00, store: "N/A", link: "#" },
                { part: "Memória Ram", name: "8GB DDR4 3200MHz", price: 180.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Armazenamento (SSD)", name: "240GB SATA III", price: 150.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Fonte", name: "400W 80 Plus", price: 250.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Cooler", name: "Stock Cooler", price: 0.00, store: "N/A", link: "#" },
                { part: "Fans", name: "1x 120mm Inclusa", price: 0.00, store: "N/A", link: "#" },
                { part: "Gabinete", name: "Básico Office", price: 820.00, store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        basico: {
            name: "PC Básico",
            badge: "Entrada",
            image: "images/2.png",
            fps: "100+ (Full HD)",
            costPerFrame: "R$ 38,00",
            components: [
                { part: "Processador (CPU)", name: "Ryzen 5 5500", price: 750.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa-Mãe", name: "B450M-DS3H", price: 550.00, store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Placa de Video (GPU)", name: "GTX 1650 4GB", price: 950.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Memória Ram", name: "16GB (2x8) 3200MHz", price: 350.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Armazenamento (SSD)", name: "500GB NVMe M.2", price: 250.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "500W 80 Plus Bronze", price: 320.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Cooler", name: "Stock Cooler", price: 0.00, store: "N/A", link: "#" },
                { part: "Fans", name: "3x 120mm RGB", price: 150.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Gabinete", name: "Gamer RGB Vidro", price: 480.00, store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        intermediario: {
            name: "PC Intermediário",
            badge: "Equilibrado",
            image: "images/3.png",
            fps: "144+ (Full HD)",
            costPerFrame: "R$ 38,19",
            components: [
                { part: "Processador (CPU)", name: "Ryzen 5 5600", price: 900.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa-Mãe", name: "B550M-PLUS", price: 850.00, store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Placa de Video (GPU)", name: "RTX 3060 12GB", price: 1900.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Memória Ram", name: "16GB (2x8) 3600MHz", price: 450.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Armazenamento (SSD)", name: "1TB NVMe M.2 Gen4", price: 500.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "650W 80 Plus Gold", price: 550.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Cooler", name: "Air Cooler DeepCool", price: 180.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Fans", name: "3x 120mm ARGB", price: 200.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Gabinete", name: "Corsair 4000D Airflow", price: 970.00, store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        alto: {
            name: "PC Alto Desempenho",
            badge: "Performance",
            image: "images/4.png",
            fps: "100+ (Quad HD)",
            costPerFrame: "R$ 85,00",
            components: [
                { part: "Processador (CPU)", name: "Core i5-13600K", price: 1800.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa-Mãe", name: "Z790M Gaming", price: 1200.00, store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Placa de Video (GPU)", name: "RTX 4070 12GB", price: 3800.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Memória Ram", name: "32GB (2x16) DDR5", price: 950.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Armazenamento (SSD)", name: "1TB NVMe Gen4", price: 650.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "750W 80 Plus Gold", price: 750.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Cooler", name: "Water Cooler 240mm", price: 450.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Fans", name: "6x 120mm ARGB Kit", price: 350.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Gabinete", name: "Corsair iCUE 5000X", price: 1050.00, store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        top: {
            name: "PC Top",
            badge: "Elite",
            image: "images/5.png",
            fps: "144+ (Quad HD)",
            costPerFrame: "R$ 83,33",
            components: [
                { part: "Processador (CPU)", name: "Ryzen 7 7800X3D", price: 2500.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa-Mãe", name: "X670E Gaming WIFI", price: 2200.00, store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Placa de Video (GPU)", name: "RTX 4070 Ti Super", price: 5500.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Memória Ram", name: "32GB (2x16) DDR5 6000MHz", price: 1100.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Armazenamento (SSD)", name: "2TB NVMe Gen5", price: 1500.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "850W 80 Plus Platinum", price: 1200.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Cooler", name: "Corsair H150i iCUE", price: 1800.00, store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Fans", name: "iCUE QX120 RGB Kit", price: 900.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Gabinete", name: "Lian Li O11 Dynamic", price: 300.00, store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        entusiasta: {
            name: "PC Entusiasta",
            badge: "Ultimate",
            image: "images/6.png",
            fps: "120+ (4K)",
            costPerFrame: "R$ 208,33",
            components: [
                { part: "Processador (CPU)", name: "Core i9-14900KS", price: 4500.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa-Mãe", name: "ROG Maximus Z790 Dark Hero", price: 5500.00, store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Placa de Video (GPU)", name: "RTX 4090 24GB", price: 13500.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Memória Ram", name: "64GB (2x32) DDR5 7200MHz", price: 2800.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Armazenamento (SSD)", name: "4TB NVMe Gen5 Raid 0", price: 4500.00, store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "1200W 80 Plus Titanium", price: 3500.00, store: "Kabum", link: "https://kabum.com.br" },
                { part: "Cooler", name: "Custom Loop Water Cooling", price: 5000.00, store: "Custom", link: "#" },
                { part: "Fans", name: "10x Corsair LL120", price: 2500.00, store: "Amazon", link: "https://amazon.com.br" },
                { part: "Gabinete", name: "Corsair Obsidian 1000D", price: 3200.00, store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        }
    };

    // Render Home Cards
    const homeGrid = document.querySelector('.pc-grid');
    if (homeGrid) {
        homeGrid.innerHTML = Object.entries(pcTiers).map(([key, tier]) => {
            const total = tier.components.reduce((sum, comp) => sum + comp.price, 0);
            tier.totalValue = total;
            const installmentValue = total * 1.15;
            const perInstallment = installmentValue / 10;
            return `
                <div class="pc-card" data-tier="${key}">
                    <div class="pc-badge">${tier.badge}</div>
                    <img src="${tier.image}" alt="${tier.name}">
                    <div class="pc-info">
                        <h3>${tier.name}</h3>
                        <div class="pc-stats">
                            <div class="stat"><span>À Vista:</span> <span style="color: var(--accent-purple); font-weight: 600;">R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                            <div class="stat"><span>Parcelado:</span> <span style="color: var(--accent-purple); font-weight: 600;">10x R$ ${perInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                            <div class="stat"><span>FPS:</span> ${tier.fps}</div>
                            <div class="stat"><span>Custo/Frame:</span> ${tier.costPerFrame}</div>
                        </div>
                        <button class="btn-details">Ver Componentes</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal Logic
    const resultModal = document.getElementById('result-modal');
    const maintenanceModal = document.getElementById('maintenance-modal');
    const shareModal = document.getElementById('share-modal');
    const emailModal = document.getElementById('email-modal');

    document.addEventListener('click', (e) => {
        // Ver Componentes (Home ou Usados)
        if (e.target.classList.contains('btn-details') && !e.target.classList.contains('btn-maintenance')) {
            const card = e.target.closest('.pc-card');
            const tierKey = card.getAttribute('data-tier');
            const isUsed = card.closest('#used-grid');
            
            const data = isUsed ? usedPCs.find(p => p.id === tierKey) : pcTiers[tierKey];
            showTierDetails(data, isUsed);
        }

        // Manutenção (Apenas Usados)
        if (e.target.classList.contains('btn-maintenance')) {
            const id = e.target.closest('.pc-card').getAttribute('data-tier');
            const pc = usedPCs.find(p => p.id === id);
            showMaintenance(pc);
        }

        // Comprar Agora (Usados -> Carrinho)
        if (e.target.classList.contains('btn-buy-used')) {
            const id = e.target.closest('.pc-card').getAttribute('data-tier');
            const pc = usedPCs.find(p => p.id === id);
            addToCart(pc);
            document.getElementById('cart-nav-link').click();
        }

        // Abrir Todos (Modal Home)
        if (e.target.id === 'btn-open-all-links') {
            const tierKey = resultModal.getAttribute('data-active-tier');
            const data = pcTiers[tierKey];
            data.components.forEach((comp, index) => {
                if (comp.link && comp.link !== '#') {
                    setTimeout(() => window.open(comp.link, '_blank'), index * 300);
                }
            });
        }

        // Modal Close Triggers (X button)
        if (e.target.classList.contains('close-modal')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
        }

        // Modais Triggers
        if (e.target.id === 'btn-share-modal') shareModal.style.display = 'block';
        if (e.target.id === 'btn-email-modal') emailModal.style.display = 'block';
        if (e.target.id === 'cancel-email') emailModal.style.display = 'none';
    });

    function showTierDetails(data, isUsed) {
        const modalContent = document.querySelector('.pc-config-result');
        const modalTitle = resultModal.querySelector('h2');
        
        if (!isUsed) {
            const tierKey = Object.keys(pcTiers).find(key => pcTiers[key].name === data.name);
            resultModal.setAttribute('data-active-tier', tierKey);
        }

        modalTitle.innerHTML = `Componentes: <span>${data.name}</span>`;

        let html = `
            <div class="component-list-header" style="${isUsed ? 'grid-template-columns: 1fr 1fr; text-align: center;' : ''}">
                <div>Peça</div>
                <div style="${isUsed ? 'text-align: center;' : ''}">Modelo</div>
                ${!isUsed ? '<div>Valor</div>' : ''}
                ${!isUsed ? '<div>Loja</div>' : ''}
            </div>
        `;

        data.components.forEach(comp => {
            html += `
                <div class="component-row" style="${isUsed ? 'grid-template-columns: 1fr 1fr; text-align: center; padding: 15px;' : ''}">
                    <div class="comp-part" style="${isUsed ? 'font-weight: 700; color: white;' : ''}">${comp.part}</div>
                    <div class="comp-name" style="${isUsed ? 'text-align: center;' : ''}">${comp.name}</div>
                    ${!isUsed ? `<div class="comp-price">R$ ${comp.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>` : ''}
                    ${!!isUsed ? '' : `<div><a href="${comp.link}" target="_blank" class="shop-link">${comp.store}</a></div>`}
                </div>
            `;
        });

        if (!isUsed) {
            html += `<button class="btn-open-all" id="btn-open-all-links">Abrir Todos</button>`;
        }

        modalContent.innerHTML = html;

        const total = isUsed ? data.price : data.totalValue;
        const installment = total * 1.15;
        const perInst = installment / 10;

        document.querySelector('.price-cash p').innerHTML = `<span>R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>`;
        document.querySelector('.price-installment').innerHTML = `
            <h3>Parcelado</h3>
            <div class="price-installment-details">
                <span class="total-installment">R$ ${installment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> <br>
                <span class="per-installment">10x R$ ${perInst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
        `;

        resultModal.style.display = 'block';
    }

    function showMaintenance(pc) {
        const content = document.getElementById('maintenance-content');
        content.innerHTML = pc.maintenance.split(',').map(item => `
            <div class="maintenance-item"><i class="fas fa-check-circle" style="color: var(--accent-purple); margin-right: 10px;"></i> ${item.trim()}</div>
        `).join('');
        maintenanceModal.style.display = 'block';
    }

    // Monitors Page Logic
    const monitorRecommendations = {
        povo: { name: "1080p 60Hz IPS", setup: "PC do Povo", res: "FHD (1080p)", type: "Plana", ratio: "16:9", specs: "Frequência: 60Hz | Painel: IPS | Tempo: 5ms", price: 600.00, image: "images/11.png", link: "https://www.amazon.com.br" },
        basico: { name: "1080p 75Hz Gamer", setup: "PC Básico", res: "FHD (1080p)", type: "Plana", ratio: "16:9", specs: "Frequência: 75Hz | Painel: VA | Tempo: 1ms", price: 850.00, image: "images/22.png", link: "https://www.pichau.com.br" },
        intermediario: { name: "1080p 144Hz Pro", setup: "PC Intermediário", res: "FHD (1080p)", type: "Plana", ratio: "16:9", specs: "Frequência: 144Hz | Painel: IPS | Tempo: 1ms", price: 1200.00, image: "images/33.png", link: "https://www.terabyteshop.com.br" },
        alto: { name: "Quad HD 144Hz Elite", setup: "PC Alto Desempenho", res: "QHD (1440p)", type: "Curva", ratio: "16:9", specs: "Frequência: 144Hz | Tempo: 0.5ms", price: 2500.00, image: "images/44.png", link: "https://www.mercadolivre.com.br" },
        top: { name: "Quad HD 240Hz Ultra", setup: "PC Top", res: "QHD (1440p)", type: "Plana", ratio: "21:9", specs: "Frequência: 240Hz | Painel: OLED", price: 4500.00, image: "images/55.png", link: "https://www.kabum.com.br" },
        entusiasta: { name: "4K 144Hz OLED Ultimate", setup: "PC Entusiasta", res: "4K (2160p)", type: "Curva", ratio: "32:9", specs: "Resolução: 4K | Frequência: 144Hz | Painel: OLED", price: 7500.00, image: "images/66.png", link: "https://patoloco.com.br" }
    };

    const monitorsGrid = document.getElementById('monitors-grid');
    if (monitorsGrid) {
        monitorsGrid.innerHTML = Object.values(monitorRecommendations).map(mon => {
            const perInst = (mon.price * 1.15) / 10;
            return `
                <div class="pc-card">
                    <div class="pc-badge">Ideal para ${mon.setup}</div>
                    <img src="${mon.image}" alt="${mon.name}">
                    <div class="pc-info">
                        <h3>${mon.name}</h3>
                        <p>${mon.specs}<br>Resolução: ${mon.res} | ${mon.type} | ${mon.ratio}</p>
                        <div class="pc-stats monitor-prices">
                            <div class="stat"><span>À Vista:</span> <span class="price-value" style="color: var(--accent-purple); font-weight: 600;">R$ ${mon.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                            <div class="stat"><span>Parcelado:</span> <span class="price-value" style="color: var(--accent-purple); font-weight: 600;">10x R$ ${perInst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                        </div>
                        <a href="${mon.link}" target="_blank" class="btn-details btn-buy-now" style="text-align: center; display: block; text-decoration: none;">Comprar Agora</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Used PCs Logic
    let usedPCs = [
        { id: "u1", name: "PC Gamer Ryzen 5 3600 + RTX 2060", image: "images/111.png", maintenance: "Limpeza profunda, troca de fans, pasta térmica Thermal Grizzly", price: 2800.00, fps: "120 FPS", costFrame: "R$ 23,33", components: [
            { part: "Processador (CPU)", name: "Ryzen 5 3600", price: 500 }, 
            { part: "Placa-Mãe", name: "Gigabyte B450M DS3H", price: 400 }, 
            { part: "Placa de Video (GPU)", name: "EVGA RTX 2060 6GB", price: 1200 }, 
            { part: "Memória Ram", name: "16GB (2x8) DDR4 3200MHz", price: 300 }, 
            { part: "Armazenamento (SSD)", name: "500GB NVMe M.2", price: 200 }, 
            { part: "Fonte", name: "Corsair CV550 80 Plus", price: 200 },
            { part: "Cooler", name: "AMD Wraith Stealth", price: 0 },
            { part: "Fans", name: "3x 120mm RGB Inclusas", price: 0 },
            { part: "Gabinete", name: "Redragon Wheel Jack", price: 0 }
        ]},
        { id: "u2", name: "Workstation Xeon E5-2670 v3", image: "images/222.png", maintenance: "Revisão de VRM, upgrade de BIOS, limpeza de contatos", price: 1500.00, fps: "45 FPS", costFrame: "R$ 33,33", components: [
            { part: "Processador (CPU)", name: "Intel Xeon E5-2670 v3", price: 300 }, 
            { part: "Placa-Mãe", name: "Atermiter X99 Turbo", price: 400 }, 
            { part: "Placa de Video (GPU)", name: "Zotac GTX 1050 Ti 4GB", price: 400 }, 
            { part: "Memória Ram", name: "32GB (4x8) DDR4 ECC", price: 200 }, 
            { part: "Armazenamento (SSD)", name: "240GB SATA III", price: 100 }, 
            { part: "Fonte", name: "500W 80 Plus White", price: 100 },
            { part: "Cooler", name: "Air Cooler Dual Fan", price: 0 },
            { part: "Fans", name: "2x 120mm Pretas", price: 0 },
            { part: "Gabinete", name: "Gabinete Mid Tower Office", price: 0 }
        ]},
        { id: "u3", name: "PC Gamer i7-10700K + RTX 3070 Ti", image: "images/333.png", maintenance: "Recuperação de GPU, troca de thermalpads, stress test 48h", price: 5200.00, fps: "200 FPS", costFrame: "R$ 26,00", components: [
            { part: "Processador (CPU)", name: "Core i7-10700K", price: 1200 }, 
            { part: "Placa-Mãe", name: "ASUS Prime Z490-P", price: 800 }, 
            { part: "Placa de Video (GPU)", name: "Gigabyte RTX 3070 Ti Gaming OC", price: 2200 }, 
            { part: "Memória Ram", name: "16GB (2x8) DDR4 3600MHz RGB", price: 400 }, 
            { part: "Armazenamento (SSD)", name: "1TB NVMe Gen3", price: 400 }, 
            { part: "Fonte", name: "XPG Core Reactor 750W Gold", price: 200 },
            { part: "Cooler", name: "Water Cooler 240mm ARGB", price: 0 },
            { part: "Fans", name: "6x 120mm ARGB Kit", price: 0 },
            { part: "Gabinete", name: "Lian Li Lancool II Mesh", price: 0 }
        ]}
    ];

    const usedGrid = document.getElementById('used-grid');
    if (usedGrid) {
        usedGrid.innerHTML = usedPCs.map(pc => {
            const installmentValue = pc.price * 1.15;
            const perInstallment = installmentValue / 10;
            return `
                <div class="pc-card" data-tier="${pc.id}">
                    <img src="${pc.image}" alt="${pc.name}" style="transition: transform 0.5s ease;">
                    <div class="pc-info">
                        <h3>${pc.name}</h3>
                        <div class="pc-stats">
                            <div class="stat"><span>À Vista:</span> <span style="color: var(--accent-purple); font-weight: 600;">R$ ${pc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                            <div class="stat"><span>Parcelado:</span> <span style="color: var(--accent-purple); font-weight: 600;">10x R$ ${perInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                            <div class="stat"><span>FPS:</span> ${pc.fps}</div>
                            <div class="stat"><span>Custo/Frame:</span> ${pc.costFrame}</div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <button class="btn-details">Ver Componentes</button>
                            <button class="btn-details btn-maintenance" style="background: var(--accent-blue); border-color: var(--accent-blue);">Manutenção</button>
                        </div>
                        <button class="btn-primary btn-buy-used btn-buy-now-green">Comprar Agora</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Cart Logic
    function addToCart(pc) {
        // Verifica se o item já está no carrinho para não duplicar
        if (!cart.find(item => item.id === pc.id)) {
            cart.push(pc);
            renderCart();
        }
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        renderCart();
    }

    function renderCart() {
        const list = document.getElementById('cart-items-list');
        if (!list) return;
        
        if (cart.length === 0) {
            list.innerHTML = "<p style='text-align: center; padding: 2rem; color: var(--text-secondary);'>Seu carrinho está vazio.</p>";
            updateSummary(0);
            return;
        }

        list.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>PC Gamer Revisado</p>
                    <button class="btn-remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i> Excluir Item
                    </button>
                </div>
                <div class="cart-item-price">R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
        `).join('');

        const subtotal = cart.reduce((s, i) => s + i.price, 0);
        updateSummary(subtotal);
    }

    function updateSummary(total) {
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');
        
        if (subtotalEl) subtotalEl.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        if (totalEl) totalEl.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    // Tornar removeFromCart global para o onclick
    window.removeFromCart = removeFromCart;

    // Tutorials & Forms (Mantidos conforme anterior)
    const tutorialItems = [
        { title: "Processador (CPU)", icon: "fas fa-microchip" }, { title: "Placa-Mãe", icon: "fas fa-columns" }, { title: "Placa de Video (GPU)", icon: "fas fa-vr-cardboard" },
        { title: "Memória Ram", icon: "fas fa-memory" }, { title: "Armazenamento (SSD)", icon: "fas fa-hdd" }, { title: "Fonte", icon: "fas fa-plug" },
        { title: "Cooler", icon: "fas fa-fan" }, { title: "Fans", icon: "fas fa-wind" }, { title: "Gabinete", icon: "fas fa-box" },
        { title: "Monitor", icon: "fas fa-desktop" }, { title: "Teclado", icon: "fas fa-keyboard" }, { title: "Mouse", icon: "fas fa-mouse" }, { title: "Fone", icon: "fas fa-headphones" }
    ];

    const tutorialsGrid = document.getElementById('tutorials-grid');
    if (tutorialsGrid) {
        tutorialsGrid.innerHTML = tutorialItems.map((item, index) => `
            <div class="video-card">
                <div class="video-placeholder"><i class="fab fa-youtube"></i><span>Vídeo: ${item.title}</span></div>
                <h3>${index + 1}. ${item.title}</h3>
                <p>Guia completo sobre como escolher o melhor ${item.title}.</p>
            </div>
        `).join('');
    }

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });
});
