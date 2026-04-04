document.addEventListener('DOMContentLoaded', function() {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

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
            value: "R$ 2.500,00",
            fps: "60+ FPS",
            resolution: "Full HD (1080p)",
            costPerFrame: "R$ 41,66",
            monitor: "1080p 60Hz",
            components: [
                { part: "Processador", name: "Ryzen 5 4600G", price: "R$ 650,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa-mãe", name: "A520M-E", price: "R$ 450,00", store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Memória RAM", name: "8GB DDR4 3200MHz", price: "R$ 180,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "SSD", name: "240GB SATA III", price: "R$ 150,00", store: "Amazon", link: "https://amazon.com.br" },
                { part: "Fonte", name: "400W 80 Plus", price: "R$ 250,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Gabinete", name: "Básico Office", price: "R$ 180,00", store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        basico: {
            name: "PC Básico",
            value: "R$ 3.800,00",
            fps: "100+ FPS",
            resolution: "Full HD (1080p)",
            costPerFrame: "R$ 38,00",
            monitor: "1080p 75Hz",
            components: [
                { part: "Processador", name: "Ryzen 5 5500", price: "R$ 750,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa de Vídeo", name: "GTX 1650 4GB", price: "R$ 950,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa-mãe", name: "B450M-DS3H", price: "R$ 550,00", store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Memória RAM", name: "16GB (2x8) 3200MHz", price: "R$ 350,00", store: "Amazon", link: "https://amazon.com.br" },
                { part: "SSD", name: "500GB NVMe M.2", price: "R$ 250,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "500W 80 Plus Bronze", price: "R$ 320,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Gabinete", name: "Gamer RGB", price: "R$ 280,00", store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        intermediario: {
            name: "PC Intermediário",
            value: "R$ 5.500,00",
            fps: "144+ FPS",
            resolution: "Full HD (1080p)",
            costPerFrame: "R$ 38,19",
            monitor: "1080p 144Hz",
            components: [
                { part: "Processador", name: "Ryzen 5 5600", price: "R$ 900,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa de Vídeo", name: "RTX 3060 12GB", price: "R$ 1.900,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa-mãe", name: "B550M-PLUS", price: "R$ 850,00", store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Memória RAM", name: "16GB (2x8) 3600MHz", price: "R$ 450,00", store: "Amazon", link: "https://amazon.com.br" },
                { part: "SSD", name: "1TB NVMe M.2 Gen4", price: "R$ 500,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "650W 80 Plus Gold", price: "R$ 550,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Gabinete", name: "Corsair 4000D", price: "R$ 650,00", store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        alto: {
            name: "PC Alto Desempenho",
            value: "R$ 8.500,00",
            fps: "100+ FPS",
            resolution: "Quad HD (1440p)",
            costPerFrame: "R$ 85,00",
            monitor: "1440p 144Hz",
            components: [
                { part: "Processador", name: "Core i5-13600K", price: "R$ 1.800,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa de Vídeo", name: "RTX 4070 12GB", price: "R$ 3.800,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa-mãe", name: "Z790M Gaming", price: "R$ 1.200,00", store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Memória RAM", name: "32GB (2x16) DDR5", price: "R$ 950,00", store: "Amazon", link: "https://amazon.com.br" },
                { part: "SSD", name: "1TB NVMe Gen4 High Speed", price: "R$ 650,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "750W 80 Plus Gold", price: "R$ 750,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Gabinete", name: "Corsair iCUE 5000X", price: "R$ 1.200,00", store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        top: {
            name: "PC Top",
            value: "R$ 12.000,00",
            fps: "144+ FPS",
            resolution: "Quad HD (1440p)",
            costPerFrame: "R$ 83,33",
            monitor: "1440p 240Hz",
            components: [
                { part: "Processador", name: "Ryzen 7 7800X3D", price: "R$ 2.500,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa de Vídeo", name: "RTX 4070 Ti Super", price: "R$ 5.500,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa-mãe", name: "X670E Gaming WIFI", price: "R$ 2.200,00", store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Memória RAM", name: "32GB (2x16) DDR5 6000MHz", price: "R$ 1.100,00", store: "Amazon", link: "https://amazon.com.br" },
                { part: "SSD", name: "2TB NVMe Gen5", price: "R$ 1.500,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "850W 80 Plus Platinum", price: "R$ 1.200,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Gabinete", name: "Lian Li O11 Dynamic", price: "R$ 1.500,00", store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        },
        entusiasta: {
            name: "PC Entusiasta",
            value: "R$ 25.000,00",
            fps: "120+ FPS",
            resolution: "Ultra HD (4K)",
            costPerFrame: "R$ 208,33",
            monitor: "4K 144Hz OLED",
            components: [
                { part: "Processador", name: "Core i9-14900KS", price: "R$ 4.500,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Placa de Vídeo", name: "RTX 4090 24GB", price: "R$ 13.500,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Placa-mãe", name: "ROG Maximus Z790 Dark Hero", price: "R$ 5.500,00", store: "Terabyte", link: "https://terabyteshop.com.br" },
                { part: "Memória RAM", name: "64GB (2x32) DDR5 7200MHz", price: "R$ 2.800,00", store: "Amazon", link: "https://amazon.com.br" },
                { part: "SSD", name: "4TB NVMe Gen5 Raid 0", price: "R$ 4.500,00", store: "Pichau", link: "https://pichau.com.br" },
                { part: "Fonte", name: "1200W 80 Plus Titanium", price: "R$ 3.500,00", store: "Kabum", link: "https://kabum.com.br" },
                { part: "Gabinete", name: "Corsair Obsidian 1000D", price: "R$ 4.500,00", store: "Terabyte", link: "https://terabyteshop.com.br" }
            ]
        }
    };

    // Modal Logic
    const resultModal = document.getElementById('result-modal');
    const closeModal = document.querySelector('.close-modal');
    const detailsButtons = document.querySelectorAll('.btn-details');

    detailsButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tier = btn.closest('.pc-card').getAttribute('data-tier');
            const data = pcTiers[tier];
            
            showTierDetails(data);
        });
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
                    <div class="comp-price">${comp.price}</div>
                    <div><a href="${comp.link}" target="_blank" class="shop-link">${comp.store}</a></div>
                </div>
            `;
        });

        modalContent.innerHTML = html;

        // Total Price Update
        document.querySelector('.price-cash p').textContent = data.value;
        const installmentValue = parseFloat(data.value.replace('R$ ', '').replace('.', '').replace(',', '.')) * 1.15;
        document.querySelector('.price-installment p').textContent = `R$ ${installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

        resultModal.style.display = 'block';
    }

    // Close Modal
    closeModal.addEventListener('click', () => {
        resultModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            resultModal.style.display = 'none';
        }
    });

    // Used PCs Logic (Mock data)
    const usedPCs = [
        {
            name: "PC Gamer Ryzen 5 3600 + RTX 2060",
            image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=400",
            maintenance: "Limpeza profunda, troca de fans e pasta térmica Thermal Grizzly.",
            price: "R$ 2.800,00"
        },
        {
            name: "Workstation Xeon E5-2670 v3",
            image: "https://images.unsplash.com/photo-1587202377425-8b6033052194?auto=format&fit=crop&q=80&w=400",
            maintenance: "Revisão de VRM, upgrade de BIOS e limpeza de contatos.",
            price: "R$ 1.500,00"
        },
        {
            name: "PC Gamer i7-10700K + RTX 3070 Ti",
            image: "https://images.unsplash.com/photo-1625842268584-8f3bf9ff16a0?auto=format&fit=crop&q=80&w=400",
            maintenance: "Recuperação de GPU, troca de thermalpads e stress test de 48h.",
            price: "R$ 5.200,00"
        }
    ];

    const usedGrid = document.getElementById('used-grid');
    if (usedGrid) {
        usedGrid.innerHTML = usedPCs.map(pc => `
            <div class="used-card">
                <img src="${pc.image}" alt="${pc.name}">
                <div class="used-info">
                    <h3>${pc.name}</h3>
                    <p><strong>Manutenção:</strong> ${pc.maintenance}</p>
                    <div class="used-price">${pc.price}</div>
                    <button class="btn-primary">Ver Detalhes</button>
                </div>
            </div>
        `).join('');
    }

    // Tutorials Logic
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    videoPlaceholders.forEach(vp => {
        vp.addEventListener('click', () => {
            alert('Em breve: Este link levará para o vídeo tutorial no YouTube ensinando como escolher as melhores peças!');
        });
    });
});
