# GLOBAL AGENT RULE — AUTOMATIC SKILL DISCOVERY & TASK-BASED SKILL USAGE

This is a permanent development rule for the **Skill Exchange** project.

## Core Requirement
A set of agent skills has already been installed in this project.
From this point onward, **DO NOT wait for me to explicitly tell you which skill to use.**
For **every task**, you must automatically determine whether one or more installed skills are relevant to that task.

If a relevant skill exists:
1. Identify the relevant skill.
2. Inspect/read that skill's `SKILL.md` and its instructions before implementing the task.
3. Follow the skill's recommendations where applicable.
4. Use multiple relevant skills when a task spans multiple areas.
5. Do not use irrelevant skills.
6. Do not pretend a skill exists if it is unavailable.
7. Do not reinstall a skill that is already available unless necessary.
8. Do not ask me to choose the skill manually when the appropriate installed skill can be determined from the task.

## TASK → SKILL ROUTING
Use this as the default routing policy.

### UI / UX / Design System Tasks
→ Inspect and use: `ui-ux-pro-max`

### React / Component Tasks
→ Inspect and use: `react`
Also use the frontend skill when the task involves production frontend implementation.

### Frontend Implementation Tasks
→ Inspect and use: `frontend-ui`
Combine with `react` when React-specific implementation is involved.

### Accessibility Tasks
→ Inspect and use: `check-fix-accessibility`
This skill should also be used automatically during significant UI implementation when accessibility is materially relevant.

### Testing / Verification Tasks
→ Inspect and use: `webapp-testing`
Do not declare a task complete without performing appropriate verification.

### Debugging Tasks
→ First inspect the currently available installed skills and determine whether a relevant debugging skill exists.
If a suitable debugging skill exists:
1. Read its instructions.
2. Apply its debugging workflow.
3. Reproduce the issue before changing code.
4. Fix the root cause.
5. Re-test the affected flow.
If no suitable debugging skill exists, use standard systematic debugging practices and clearly report that no dedicated debugging skill was available. Never invent or claim to use a missing skill.

### shadcn/ui Tasks
If `shadcn-ui` is actually installed and available:
→ Inspect and use it for shadcn/ui-related tasks.
If it is unavailable:
→ Do not pretend it is installed. Do not depend on it. Use the existing project stack instead.

## MULTI-SKILL TASKS
Some tasks require multiple skills. Inspect all relevant skills before implementation and combine their guidance. Do NOT use every installed skill automatically. Use only the skills relevant to the actual task.

## SKILL PRIORITY
When several skills overlap:
1. Follow task-specific guidance first.
2. Use the UI/UX skill for design decisions.
3. Use React skill for React architecture and component implementation.
4. Use frontend skill for general production frontend implementation.
5. Use accessibility skill for accessibility concerns.
6. Use testing skill for verification.
7. Use debugging guidance when fixing problems.
Do not allow one skill to unnecessarily override another skill's specialized guidance. Resolve conflicts by choosing the most task-specific guidance.

## BEFORE IMPLEMENTATION
For every meaningful development task, silently perform this process:
1. Understand the requested task
2. Identify the task category
3. Identify relevant installed skills
4. Inspect/read their SKILL.md instructions
5. Determine how those instructions apply
6. Implement the task
7. Verify the result
Do not skip step 3 or step 4 when a relevant installed skill exists.

## DO NOT OVERUSE SKILLS
Skills are guidance, not mandatory decoration. Do not invoke unrelated skills, read every installed skill for every task, add unnecessary dependencies because a skill mentions them, change architecture solely because a skill recommends another stack, over-engineer the application, or introduce unnecessary libraries. Keep the project simple and hackathon-friendly.

## TRANSPARENCY
At the end of each meaningful task, include a short section titled `## Skills Used` detailing which installed skills were used and their purpose, or explicitly stating if no installed skill was directly relevant.
