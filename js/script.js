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
            // Support for banners or other elements that might not be in the nav
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

    // PC Tiers Data
    const pcTiers = {
        povo: {
            name: "PC do Povo",
            badge: "Econômico",
            image: "https://images.unsplash.com/photo-1587202377425-8b6033052194?auto=format&fit=crop&q=80&w=400",
            fps: "60+ (Full HD)",
            costPerFrame: "R$ 41,66",
            monitor: "1080p 60Hz",
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
            image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=400",
            fps: "100+ (Full HD)",
            costPerFrame: "R$ 38,00",
            monitor: "1080p 75Hz",
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
            image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=400",
            fps: "144+ (Full HD)",
            costPerFrame: "R$ 38,19",
            monitor: "1080p 144Hz",
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
            image: "https://images.unsplash.com/photo-1625842268584-8f3bf9ff16a0?auto=format&fit=crop&q=80&w=400",
            fps: "100+ (Quad HD)",
            costPerFrame: "R$ 85,00",
            monitor: "1440p 144Hz",
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
            image: "https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&q=80&w=400",
            fps: "144+ (Quad HD)",
            costPerFrame: "R$ 83,33",
            monitor: "1440p 240Hz",
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
            image: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&q=80&w=400",
            fps: "120+ (4K)",
            costPerFrame: "R$ 208,33",
            monitor: "4K 144Hz OLED",
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

    // Calculate Totals and Render Home Cards
    const homeGrid = document.querySelector('.pc-grid');
    if (homeGrid) {
        homeGrid.innerHTML = Object.entries(pcTiers).map(([key, tier]) => {
            const total = tier.components.reduce((sum, comp) => sum + comp.price, 0);
            tier.totalValue = total; // Store calculated total
            return `
                <div class="pc-card" data-tier="${key}">
                    <div class="pc-badge">${tier.badge}</div>
                    <img src="${tier.image}" alt="${tier.name}">
                    <div class="pc-info">
                        <h3>${tier.name}</h3>
                        <div class="pc-stats">
                            <div class="stat"><span>Valor Total:</span> R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div class="stat"><span>FPS:</span> ${tier.fps}</div>
                            <div class="stat"><span>Custo/Frame:</span> ${tier.costPerFrame}</div>
                            <div class="stat"><span>Monitor:</span> ${tier.monitor}</div>
                        </div>
                        <button class="btn-details">Ver Componentes</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal Logic
    const resultModal = document.getElementById('result-modal');
    const closeModal = document.querySelector('.close-modal');
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-details')) {
            const tierKey = e.target.closest('.pc-card').getAttribute('data-tier');
            const data = pcTiers[tierKey];
            showTierDetails(data);
        }
    });

    function showTierDetails(data) {
        const modalContent = document.querySelector('.pc-config-result');
        const modalTitle = resultModal.querySelector('h2');
        modalTitle.innerHTML = `Componentes: <span>${data.name}</span>`;

        let html = `
            <div class="component-list-header">
                <div>Peça</div>
                <div>Modelo</div>
                <div>Valor</div>
                <div>Loja</div>
            </div>
        `;

        data.components.forEach(comp => {
            html += `
                <div class="component-row">
                    <div class="comp-part">${comp.part}</div>
                    <div class="comp-name">${comp.name}</div>
                    <div class="comp-price">R$ ${comp.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div><a href="${comp.link}" target="_blank" class="shop-link">${comp.store}</a></div>
                </div>
            `;
        });

        modalContent.innerHTML = html;

        // Total Price Update
        document.querySelector('.price-cash p').textContent = `R$ ${data.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const installmentValue = data.totalValue * 1.15;
        document.querySelector('.price-installment p').textContent = `R$ ${installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

        resultModal.style.display = 'block';
    }

    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            resultModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            resultModal.style.display = 'none';
        }
    });

    // Monitors Page Logic
    const monitorRecommendations = {
        povo: { name: "1080p 60Hz IPS", setup: "PC do Povo", specs: "Frequência: 60Hz | Painel: IPS | Tempo: 5ms", price: "R$ 600,00", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400" },
        basico: { name: "1080p 75Hz Gamer", setup: "PC Básico", specs: "Frequência: 75Hz | Painel: VA | Tempo: 1ms", price: "R$ 850,00", image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&q=80&w=400" },
        intermediario: { name: "1080p 144Hz Pro", setup: "PC Intermediário", specs: "Frequência: 144Hz | Painel: IPS | Tempo: 1ms", price: "R$ 1.200,00", image: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&q=80&w=400" },
        alto: { name: "Quad HD 144Hz Elite", setup: "PC Alto Desempenho", specs: "Frequência: 144Hz | Resolução: 1440p | Tempo: 0.5ms", price: "R$ 2.500,00", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=400" },
        top: { name: "Quad HD 240Hz Ultra", setup: "PC Top", specs: "Frequência: 240Hz | Resolução: 1440p | Painel: OLED", price: "R$ 4.500,00", image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=400" },
        entusiasta: { name: "4K 144Hz OLED Ultimate", setup: "PC Entusiasta", specs: "Resolução: 4K | Frequência: 144Hz | Painel: OLED 42\"", price: "R$ 7.500,00", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400" }
    };

    const monitorsGrid = document.getElementById('monitors-grid');
    if (monitorsGrid) {
        monitorsGrid.innerHTML = Object.values(monitorRecommendations).map(mon => `
            <div class="pc-card">
                <div class="pc-badge">Ideal para ${mon.setup}</div>
                <img src="${mon.image}" alt="${mon.name}">
                <div class="pc-info">
                    <h3>${mon.name}</h3>
                    <p>${mon.specs}</p>
                    <div class="used-price">${mon.price}</div>
                    <button class="btn-primary">Comprar Agora</button>
                </div>
            </div>
        `).join('');
    }

    // Used PCs Logic with Sorting
    let usedPCs = [
        { name: "PC Gamer Ryzen 5 3600 + RTX 2060", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=400", maintenance: "Limpeza profunda, troca de fans e pasta térmica Thermal Grizzly.", price: 2800.00, fps: 120, costFrame: 23.33 },
        { name: "Workstation Xeon E5-2670 v3", image: "https://images.unsplash.com/photo-1587202377425-8b6033052194?auto=format&fit=crop&q=80&w=400", maintenance: "Revisão de VRM, upgrade de BIOS e limpeza de contatos.", price: 1500.00, fps: 45, costFrame: 33.33 },
        { name: "PC Gamer i7-10700K + RTX 3070 Ti", image: "https://images.unsplash.com/photo-1625842268584-8f3bf9ff16a0?auto=format&fit=crop&q=80&w=400", maintenance: "Recuperação de GPU, troca de thermalpads e stress test de 48h.", price: 5200.00, fps: 200, costFrame: 26.00 }
    ];

    const usedGrid = document.getElementById('used-grid');
    const usedSort = document.getElementById('used-sort');

    function renderUsedPCs() {
        if (!usedGrid) return;
        usedGrid.innerHTML = usedPCs.map(pc => `
            <div class="used-card">
                <img src="${pc.image}" alt="${pc.name}">
                <div class="used-info">
                    <h3>${pc.name}</h3>
                    <p><strong>Manutenção:</strong> ${pc.maintenance}</p>
                    <div class="used-price">R$ ${pc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="stat"><span>FPS:</span> ${pc.fps} | <span>C/F:</span> R$ ${pc.costFrame.toFixed(2)}</div>
                    <button class="btn-primary">Ver Detalhes</button>
                </div>
            </div>
        `).join('');
    }

    if (usedSort) {
        usedSort.addEventListener('change', () => {
            const val = usedSort.value;
            if (val === 'price-asc') usedPCs.sort((a, b) => a.price - b.price);
            else if (val === 'price-desc') usedPCs.sort((a, b) => b.price - a.price);
            else if (val === 'fps-desc') usedPCs.sort((a, b) => b.fps - a.fps);
            else if (val === 'cost-frame-asc') usedPCs.sort((a, b) => a.costFrame - b.costFrame);
            renderUsedPCs();
        });
    }

    renderUsedPCs();

    // Tutorials Expansion
    const tutorialItems = [
        { title: "Processador (CPU)", icon: "fas fa-microchip" },
        { title: "Placa-Mãe", icon: "fas fa-columns" },
        { title: "Placa de Video (GPU)", icon: "fas fa-vr-cardboard" },
        { title: "Memória Ram", icon: "fas fa-memory" },
        { title: "Armazenamento (SSD)", icon: "fas fa-hdd" },
        { title: "Fonte", icon: "fas fa-plug" },
        { title: "Cooler", icon: "fas fa-fan" },
        { title: "Fans", icon: "fas fa-wind" },
        { title: "Gabinete", icon: "fas fa-box" },
        { title: "Monitor", icon: "fas fa-desktop" },
        { title: "Teclado", icon: "fas fa-keyboard" },
        { title: "Mouse", icon: "fas fa-mouse" },
        { title: "Fone", icon: "fas fa-headphones" }
    ];

    const tutorialsGrid = document.getElementById('tutorials-grid');
    if (tutorialsGrid) {
        tutorialsGrid.innerHTML = tutorialItems.map((item, index) => `
            <div class="video-card">
                <div class="video-placeholder">
                    <i class="fab fa-youtube"></i>
                    <span>Vídeo em Breve: ${item.title}</span>
                </div>
                <h3>${index + 1}. ${item.title}</h3>
                <p>Guia completo sobre como escolher o melhor ${item.title} para o seu uso.</p>
            </div>
        `).join('');
    }

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
            contactForm.reset();
        });
    }
});
