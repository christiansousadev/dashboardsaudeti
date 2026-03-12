# Guia de Contribuição - Dashboard Saúde TI 🚀

Este projeto segue diretrizes rígidas de **Governança de TI** e **Engenharia de Software** para garantir a rastreabilidade e a qualidade do código. Se você deseja contribuir, siga os padrões abaixo.

## 📌 Padrões de Commit (Conventional Commits)

Utilizamos o padrão de commits semânticos para manter um histórico limpo e facilitar a geração de logs:

- `feat:` Novas funcionalidades.
- `fix:` Correção de bugs.
- `docs:` Alterações em documentações.
- `style:` Formatação e ajustes visuais (não altera lógica).
- `refactor:` Mudança no código que não altera comportamento final.
- `test:` Adição ou correção de testes.

*Exemplo: `feat: implementa calculo de ROI para incidentes criticos`*

## 🌿 Fluxo de Git

1. **Main Branch:** Protegida. Commits diretos são proibidos.
2. **Feature Branches:** Use o prefixo `feature/` ou `fix/` seguido do nome curto (ex: `feature/ajusta-log-api`).
3. **Pull Requests:** Devem conter uma descrição clara do que foi alterado e por quê.

## 🛠️ Diretrizes de Desenvolvimento

Para manter a conformidade com as boas práticas de governança:

- **Segurança:** Nunca suba credenciais ou `.env` para o repositório. Utilize variáveis de ambiente.
- **Rastreabilidade:** Implemente logs claros em processos críticos, especialmente na camada de ingestão de dados e backend.
- **Tratamento de Erros:** Todo endpoint ou função de processamento deve possuir blocos `try/catch` robustos para evitar falhas silenciosas.
- **Clean Code:** Comentários devem ser breves, diretos e explicar o "porquê", não o "o quê".

## 🚀 Como Contribuir

1. Faça um Fork do projeto.
2. Crie sua branch: `git checkout -b feature/minha-melhoria`.
3. Commite suas mudanças seguindo os padrões acima.
4. Faça o push para a branch: `git push origin feature/minha-melhoria`.
5. Abra um Pull Request detalhando sua contribuição.

---
*Este guia visa garantir que a evolução do Dashboard Saúde TI mantenha sua integridade arquitetural e foco em dados estratégicos.*