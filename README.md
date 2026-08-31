# ️ Material Construção - Sistema de Gestão

Sistema ERP completo para gestão de lojas de material de construção, desenvolvido com **Vue.js 3** no frontend e **Node.js + Express + MongoDB** no backend.

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/licença-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

---

##  Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Credenciais de Teste](#-credenciais-de-teste)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

---

##  Sobre o Projeto

O **Material Construção** é um sistema completo de gestão empresarial (ERP) desenvolvido especificamente para lojas de material de construção. O sistema permite o controle total das operações da loja, desde o cadastro de produtos e clientes até a emissão de relatórios financeiros detalhados.

### Principais Diferenciais

- 🛒 **PDV estilo supermercado** com leitor de código de barras
- 📊 **Dashboard interativo** com gráficos em tempo real
- 👥 **Sistema de permissões** baseado em cargos (RBAC)
- 📄 **Relatórios em PDF** profissionais
- 🔐 **Autenticação JWT** segura
- 💰 **Controle de caixa** completo

---

##  Funcionalidades

### 🔐 Autenticação e Segurança
- Login com JWT (JSON Web Token)
- Sistema de cargos e permissões (RBAC)
- Senhas criptografadas com bcrypt
- Sessão expira em 8 horas

###  Dashboard
- Visão geral do negócio
- Gráficos de vendas, produtos e finanças
- Alertas de estoque baixo
- Indicadores de performance (KPIs)

### 🛒 Ponto de Venda (PDV)
- Leitura de código de barras
- Atalhos de teclado (F2, F4, ESC)
- Sons de feedback
- Modo tela cheia
- Múltiplas formas de pagamento
- Cálculo automático de troco
- Geração de comprovante em PDF

### 📦 Gestão de Produtos
- Cadastro completo (código, nome, preço, estoque)
- Controle de estoque mínimo e máximo
- Status automático (Normal/Baixo/Sem estoque)
- Busca por código, nome ou código de barras
- Upload de logo da loja

###  Gestão de Clientes
- Cadastro de clientes
- Histórico de compras
- Relatórios de faturamento por cliente

###  Gestão de Fornecedores
- Cadastro completo de fornecedores
- Vínculo com produtos

### 💰 Controle de Caixa
- Abertura e fechamento de caixa
- Sangrias e suprimentos
- Controle de valores por operador
- Histórico de movimentações

### 📄 Relatórios
- Relatório de Vendas (com filtro de datas e itens)
- Relatório de Estoque
- Relatório Financeiro (DRE simplificado)
- Relatório de Clientes
- Todos os relatórios em PDF

### 👤 Gestão de Usuários
- Criação, edição e exclusão de usuários
- Atribuição de cargos
- Ativação/desativação de contas
- Exclusão permanente com confirmação dupla

### ⚙️ Configurações
- Dados da loja (nome, CNPJ, endereço)
- Upload de logo
- Informações de contato

---

## ️ Tecnologias Utilizadas

### Frontend
- [Vue.js 3](https://vuejs.org/) - Framework JavaScript progressivo
- [Vue Router](https://router.vuejs.org/) - Roteamento oficial
- [Pinia](https://pinia.vuejs.org/) - Gerenciamento de estado
- [Axios](https://axios-http.com/) - Cliente HTTP
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Chart.js](https://www.chartjs.org/) - Gráficos interativos
- [jsPDF](https://github.com/parallax/jsPDF) - Geração de PDFs
- [SweetAlert2](https://sweetalert2.github.io/) - Alertas bonitos
- [date-fns](https://date-fns.org/) - Manipulação de datas

### Backend
- [Node.js](https://nodejs.org/) - Runtime JavaScript
- [Express](https://expressjs.com/) - Framework web
- [MongoDB](https://www.mongodb.com/) - Banco de dados NoSQL
- [Mongoose](https://mongoosejs.com/) - ODM para MongoDB
- [JWT](https://jwt.io/) - Autenticação via token
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Criptografia de senhas
- [Nodemon](https://nodemon.io/) - Auto-reload em desenvolvimento
- [dotenv](https://www.npmjs.com/package/dotenv) - Variáveis de ambiente

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) local ou conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Git](https://git-scm.com/)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Renatodocarmo/material-construcao.git
cd material-construcao