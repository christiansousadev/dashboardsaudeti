# 🚀 ITSM Health Dashboard: Visibilidade e Governança de TI
<img width="1206" height="846" alt="dashboard-hero" src="https://github.com/user-attachments/assets/1c11bbdc-3a1f-4255-8a2f-9c3163e42d1a" />


Este projeto consiste em uma plataforma de **Business Intelligence e Data Engineering** voltada para a gestão de serviços de TI (ITSM). O foco principal é fornecer visibilidade em tempo real sobre a saúde da operação, monitorando conformidade de SLA, satisfação do usuário (NPS) e o impacto financeiro (ROI) causado por incidentes críticos.

## 🛠️ Arquitetura e Fluxo de Dados
<img width="355" height="282" alt="arquitetura-pastas" src="https://github.com/user-attachments/assets/b7caba6b-eac1-4138-8251-0849de631ee4" />

O ecossistema é modular e segue as melhores práticas de governança, separando a camada de processamento da camada de apresentação:

1. **Banco de Dados (PostgreSQL):** Modelagem relacional estruturada com dimensões de técnicos e categorias.
2. **Camada de Ingestão (Python/Seed):** Script gerador de dados sintéticos que simula a volumetria de uma fintech real para testes de estresse e visualização.
3. **Backend (FastAPI):** API RESTful de alta performance que abstrai a lógica de negócios e cálculos de KPI.
4. **Frontend Customizado (React/Vite):** Dashboard reativo construído com Tailwind CSS e Recharts para monitoramento operacional em tempo real.
5. **Camada de BI (Metabase):** Integração direta com o banco para auditoria e relatórios executivos ad-hoc.

---

## 🎯 Diferenciais Estratégicos para Governança

Este projeto não é apenas um dashboard, mas uma estrutura de **Data-Driven Governance**:

* **Geração Automática de KPIs:** Eliminação de processos manuais de coleta, garantindo que o KPI de SLA e ROI seja calculado na origem (banco de dados).
* **Foco em Incidentes Críticos:** Implementação de visão de curto prazo para atuação imediata em falhas que impactam a operação (Top 5 Fora do SLA).
* **Visão de Fintech:** Dados gerados e processados simulando volumetria real, tratando o custo de downtime como perda direta de receita (ROI).
* **Rastreabilidade e Auditoria:** Arquitetura modular que permite auditar cada etapa do dado, desde a abertura do ticket até o cálculo financeiro final.


## 📊 Modelagem de Dados e Governança
<img width="1903" height="569" alt="banco-metabase" src="https://github.com/user-attachments/assets/0a9fe572-35de-463b-a34e-d905dbaa8edb" />

A inteligência do projeto reside na **Camada Ouro (View SQL)**, que consolida múltiplos relacionamentos para gerar insights automáticos.


### Estrutura do Banco

* `tickets_suporte`: Tabela fato contendo o ciclo de vida do atendimento.
* `incidentes_financeiros`: Relacionamento 1:1 para cálculo de impacto de downtime (ROI).
* `dim_categorias` & `dim_tecnicos`: Dimensões que permitem a análise de causa raiz e performance individual.
* `config_sla`: Tabela de parâmetros que define as metas de atendimento por prioridade.

### A "Golden View": `view_saude_ti_pro`

Esta visão analítica automatiza cálculos complexos, como:

* **Tempo de Resolução:** Diferença entre abertura e fechamento (ou `NOW()` para chamados abertos).
* **Status de SLA:** Flag automática baseada na tabela de configuração para identificar violações em tempo real.

---

## 📈 KPIs Estratégicos Monitorados

| KPI | Objetivo | Benefício para a Governança |
| --- | --- | --- |
| **ROI (Custo Total)** | Mensurar o impacto financeiro das falhas. | Priorização de investimentos em infraestrutura. |
| **Conformidade SLA** | % de chamados atendidos no prazo. | Garantia de cumprimento de contratos e metas. |
| **NPS Médio** | Qualidade percebida pelo usuário final. | Identificação de gaps de treinamento ou processos. |
| **Heatmap de Prioridade** | Entender a severidade do backlog. | Otimização da alocação de recursos (Staffing). |

---

## 🚀 Tecnologias Utilizadas

* **Linguagem:** Python 3.13 (FastAPI, Pydantic, Psycopg2).
* **Banco de Dados:** PostgreSQL 17.
* **Frontend:** React (Vite, Tailwind CSS, Recharts, Lucide Icons).
* **DevOps/Infra:** Docker (para execução do Metabase) e Variáveis de Ambiente (.env).
* **Simulação:** Faker library para geração de 1000+ registros sintéticos.

---

## ⚙️ Como Executar o Projeto

1. **Configurar Banco:** Execute o script DDL no PostgreSQL para criar as tabelas e a View analítica.
2. **Ambiente Virtual:**
```bash
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn psycopg2-binary faker python-dotenv

```


3. **Popular Dados:** `python seed.py`
4. **Subir Backend:** `uvicorn main:app --reload`
5. **Subir Frontend:**
```bash
cd frontend
npm install
npm run dev

```



---

## 🎯 Diferenciais do Projeto

* **Rastreabilidade:** Implementação de logs e tratamento de erros robusto em toda a stack.
* **Escalabilidade:** Separação clara entre backend e frontend (Decoupled Architecture).
* **Visão de Negócio:** Foco em métricas financeiras e de conformidade, não apenas métricas técnicas ("vibe" de governança).

---

<div align="center">
  <sub>Projeto arquitetado e desenvolvido por</sub>
  <h3>Christian Sousa</h3>
  <p><b>Software Engineering | IT Governance | Data Automation</b></p>
  
  <p>
    <a href="https://linkedin.com/in/christiansousasilva">
      <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
    </a>
    <a href="https://github.com/christiansousadev">
      <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
  </p>
</div>

---
