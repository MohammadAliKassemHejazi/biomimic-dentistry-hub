# Project Context
Stack: Next.js + TypeScript (frontend), Node.js + Express (backend)
Age: ~1 year old codebase
Goal: Deep-dive debug, identify root causes, refactor, verify fixes

## Project Structure
- /client  → Next.js + TypeScript
- /server   → Node.js + Express + REST API


## Rules for ALL agents
- Never modify files owned by another agent without messaging them first
- Write findings to .claude/reports/[agent-name]-report.md
- Always check .claude/reports/_registry.md before starting work
- Use TypeScript strict mode assumptions
- Follow SOLID principles in all fixes