# ❤ Full Finanças - Controle Financeiro Pessoal Completo

Transforme suas finanças com o sistema de controle financeiro mais completo e intuitivo da web! Gerencie suas rendas, despesas, cartões de crédito, orçamentos e objetivos em um só lugar, com uma interface moderna e responsiva.

## 🚀 Principais Funcionalidades

### 📊 Dashboard Inteligente
- **Resumo Financeiro Completo**: Visualize saldo total, receitas, despesas e economia mensal
- **Gráfico Interativo**: Acompanhe sua evolução financeira com gráficos dinâmicos
- **Transações Recentes**: Acesso rápido às últimas movimentações
- **Visão Geral de Orçamentos**: Acompanhe o progresso dos seus limites de gastos
- **Métricas em Tempo Real**: Saldos atualizados instantaneamente

### 💳 Gestão de Contas e Cartões
- **Múltiplas Contas**: Gerencie contas correntes, poupança, investimentos e mais
- **Cartões de Crédito**: Controle faturas, limites e datas de vencimento
- **Pagamento de Faturas**: Sistema integrado para pagar faturas de cartão
- **Cálculo Automático de Saldos**: Atualização em tempo real dos valores
- **Tipos de Conta Flexíveis**: Conta corrente, poupança, investimento, cartão de crédito

### 💰 Controle de Transações
- **Receitas e Despesas**: Registre todas as suas movimentações financeiras
- **Transações Recorrentes**: Configure pagamentos fixos mensais
- **Transações Parceladas**: Divida compras em múltiplas parcelas
- **Anexo de Comprovantes**: Salve comprovantes de pagamento (imagens e PDFs)
- **Categorização Inteligente**: Organize transações por categorias
- **Status de Pagamento**: Controle transações pagas e pendentes
- **Associação a Contas**: Vincule transações a contas específicas

### 📋 Contas a Pagar e Receber
- **Gestão de Contas a Pagar**: Controle despesas futuras e vencimentos
- **Gestão de Contas a Receber**: Acompanhe receitas pendentes
- **Status de Pagamento**: Marque como pago/recebido
- **Filtros por Status**: Visualize pendentes, pagos e vencidos
- **Integração com Transações**: Conversão automática em transações

### 📈 Orçamentos e Metas
- **Orçamentos Mensais**: Defina limites de gastos por categoria
- **Barras de Progresso**: Acompanhe visualmente o uso do orçamento
- **Metas Financeiras**: Crie e acompanhe objetivos de economia
- **Alertas de Limite**: Notificações quando aproximar do limite
- **Cálculo Automático**: Baseado em transações reais

### 📋 Relatórios Avançados
- **Filtros por Período**: Análise por mês, trimestre, semestre ou ano
- **Gráfico de Pizza**: Visualize despesas por categoria
- **Tabela de Resumo**: Dados organizados e ordenados por valor
- **Exportação Completa**: Exporte dados para Excel (.xlsx) e PDF
- **Relatórios Detalhados**: Análise profunda de receitas e despesas

### 🛠️ Ferramentas Financeiras
- **Calculadora de Juros Compostos**: Simule investimentos com aportes mensais
- **Cálculo Preciso**: Resultados detalhados com valor investido, juros e montante final
- **Simulações Avançadas**: Diferentes cenários de investimento

### 👤 Perfil do Usuário
- **Informações Pessoais**: Edite nome e visualize email
- **Segurança**: Alteração de senha com reautenticação
- **Personalização**: Upload de foto de perfil e definição de moeda padrão
- **Moeda Personalizada**: Suporte a BRL, USD e EUR em toda a aplicação
- **Configurações Avançadas**: Preferências personalizadas

### 🎯 Tour Guiado para Novos Usuários
- **Onboarding Intuitivo**: Tour interativo para novos usuários
- **Explicação de Funcionalidades**: Aprenda a usar o sistema passo a passo
- **Experiência Personalizada**: Adaptado para diferentes perfis de usuário

### 🔧 Painel de Administração
- **Dashboard Admin**: Métricas em tempo real do sistema
- **Gerenciamento de Usuários**: Visualize, edite e delete usuários
- **Suporte Ativo**: Acesso direto aos dados dos usuários
- **Ajuste de Saldos**: Correção manual de saldos de contas
- **Edição de Transações**: Modificação de transações dos usuários
- **Exclusão em Cascata**: Remoção completa de dados de usuários
- **Redefinição de Senhas**: Envio de emails de recuperação
- **Métricas do Sistema**: Total de usuários, transações e feedbacks

### 💬 Sistema de Feedback
- **Canal de Comunicação**: Usuários podem enviar feedback diretamente
- **Categorização**: Bug, sugestão, dúvida ou elogio
- **Acompanhamento**: Admin visualiza todos os feedbacks
- **Resposta Rápida**: Sistema integrado para suporte

### 📱 Interface Responsiva
- **Design Mobile-First**: Funciona perfeitamente em smartphones e tablets
- **Menu Lateral**: Navegação intuitiva com menu hambúrguer em dispositivos móveis
- **Interface Moderna**: Design limpo e profissional
- **Navegação por Abas**: Sistema de abas organizado
- **Modais Interativos**: Interface moderna para ações importantes

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Gráficos**: Chart.js
- **Exportação**: jsPDF, html2pdf.js, SheetJS
- **Arquitetura**: Serverless com hospedagem estática
- **Segurança**: Regras de segurança do Firestore
- **Autenticação**: Firebase Auth com verificação de UID

## ⚙️ Como Executar

Este projeto foi desenhado para ser extremamente simples de rodar.

### 1. Clone o repositório
```bash
git clone https://github.com/Jottaaa12/full-finan-as.git
cd full-finan-as
```

### 2. Configure o Firebase
- O arquivo `firebase-config.js` já vem com as chaves de configuração de exemplo
- **Importante**: Para que o sistema funcione, você deve:
  - Ir ao seu [Console do Firebase](https://console.firebase.google.com/)
  - Na seção **Authentication → Sign-in method**
  - Habilitar o provedor **Email/Password**
  - Configurar as regras de segurança do **Firestore** e **Storage** para permitir leitura/escrita para usuários autenticados
  - **Configurar UID do Admin**: No arquivo `admin/script.js`, substitua o `ADMIN_UID` pelo seu UID de administrador

### 3. Execute o projeto
- Abra o arquivo `index.html` no seu navegador
- Para acessar o painel admin: `admin/index.html`
- Ou hospede a pasta inteira no GitHub Pages

## 📊 Status do Projeto

**Versão Atual**: BETA 2 (Estável) ✅

### ✅ Funcionalidades Implementadas
- Sistema completo de autenticação
- Dashboard com métricas em tempo real
- Gestão completa de contas e transações
- Sistema de orçamentos e metas
- Relatórios avançados com exportação
- Painel de administração completo
- Sistema de feedback integrado
- Contas a pagar e receber
- Tour guiado para novos usuários
- Interface responsiva e moderna

### 🚧 Próximos Passos (Roteiro Pós-BETA 2)
- **Relatório de Fluxo de Caixa Projetado**: Previsão de receitas e despesas futuras
- **Melhorias de Usabilidade**: Busca global e divisão de transações
- **Conciliação Bancária via CSV**: Importação e conciliação automática

## ✨ Criado por

**Jotta** (@jottaaa0)

📸 **Instagram**: [@jottaaa0](https://instagram.com/jottaaa0)

---

## ❤️ Apoie o Projeto

Se você gostou do **Full Finanças** e quer apoiar seu desenvolvimento contínuo, considere fazer uma doação. Sua contribuição ajuda a manter o projeto ativo e a desenvolver novas funcionalidades.

### 💰 Doação via PIX

**Nome:** João Pedro Carvalho Torres  
**Chave PIX:** `88988229312`

### 🎯 Como sua doação ajuda:

- **Desenvolvimento de novas funcionalidades**
- **Melhorias na interface e experiência do usuário**
- **Manutenção e atualizações de segurança**
- **Hospedagem e infraestrutura do projeto**

---

*Desenvolvido com ❤️ para transformar a gestão financeira pessoal*
