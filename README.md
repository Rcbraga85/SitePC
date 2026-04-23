# BuildMyRig - Backend

API para montagem de configurações de PC gamer com consulta de preços em tempo real.

## Sobre o Projeto

BuildMyRig é uma API RESTful desenvolvida em Node.js que permite montar configurações de PC gamer com base no orçamento e preferências do usuário, consultando preços em tempo real de diversas lojas brasileiras.

## Tecnologias Utilizadas

- Node.js (v18+)
- Express.js
- Axios
- Cheerio (para web scraping)
- Node-Cache
- Winston (para logs)
- Dotenv

## Estrutura do Projeto

```
/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares do Express
│   ├── routes/          # Rotas da API
│   ├── scrapers/        # Módulos de scraping para cada loja
│   ├── services/        # Serviços de negócio
│   ├── utils/           # Utilitários
│   └── server.js        # Ponto de entrada da aplicação
├── .env                 # Variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── package.json         # Dependências e scripts
└── README.md            # Documentação
```

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/buildmyrig.git
cd buildmyrig
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
# Modo de desenvolvimento
npm run dev

# Modo de produção
npm start
```

## Endpoints da API

### Montar Configuração
```
POST /api/build
```
Recebe o orçamento e preferências do usuário e retorna a melhor configuração possível.

**Corpo da requisição:**
```json
{
  "budget": 6000,
  "usage": "games e edição de vídeo",
  "preferences": {
    "brand_cpu": "AMD",
    "brand_gpu": "NVIDIA"
  }
}
```

**Resposta:**
```json
{
  "total": 5987.40,
  "components": [
    {
      "category": "CPU",
      "name": "AMD Ryzen 5 5600",
      "price": 899.90,
      "store": "TerabyteShop",
      "url": "https://www.terabyteshop.com.br/produto/12345",
      "image": "https://cdn.terabyteshop.com.br/img/ryzen5600.jpg"
    },
    {
      "category": "GPU",
      "name": "NVIDIA RTX 3060 12GB",
      "price": 1899.00,
      "store": "Pichau",
      "url": "https://www.pichau.com.br/produto/67890"
    }
    // Outros componentes...
  ]
}
```

### Listar Categorias
```
GET /api/components
```
Retorna todas as categorias de componentes disponíveis.

### Buscar Componentes por Categoria
```
GET /api/components/:category
```
Retorna componentes de uma categoria específica.

### Pesquisar Componentes
```
GET /api/search?q=rtx
```
Pesquisa componentes por termo.

### Comparar Preços
```
GET /api/prices/:componentId
```
Compara preços de um componente em diferentes lojas.

### Recomendações de Upgrade
```
GET /api/recommendations
```
Retorna recomendações de upgrade para uma configuração existente.

### Status do Servidor
```
GET /api/health
```
Verifica o status do servidor.

## Lojas Suportadas

- TerabyteShop
- Pichau
- Amazon (em desenvolvimento)
- Kabum (em desenvolvimento)
- Mercado Livre (em desenvolvimento)
- Alligator Shop (em desenvolvimento)
- Patoloco (em desenvolvimento)

## Funcionalidades

- Distribuição inteligente de orçamento entre componentes
- Consulta de preços em tempo real
- Cache para otimizar requisições repetidas
- Tratamento de erros e logs detalhados
- Suporte a preferências de marca

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.