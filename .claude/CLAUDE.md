# Project Context
Stack: Next.js + TypeScript (frontend), Node.js + Express (backend)
Age: ~1 year old codebase
Goal: Deep-dive debug, identify root causes, refactor, verify fixes

## Project Structure
- /frontend  → Next.js + TypeScript
- /backend   → Node.js + Express + REST API
- /tests     → Jest test suites

## Rules for ALL agents
- Never modify files owned by another agent without messaging them first
- Write findings to .claude/reports/[agent-name]-report.md
- Always check .claude/reports/_registry.md before starting work
- Use TypeScript strict mode assumptions
- Follow SOLID principles in all fixes