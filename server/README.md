# Skill Exchange API Backend

This is the Node.js + Express backend foundation for the Skill Exchange application. It provides the API layer used by the Next.js frontend.

## Stack
- **Node.js** (v18+)
- **Express**
- **JavaScript (ES Modules)**

## Development

1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server (auto-restarts on changes):
   ```bash
   npm run dev
   ```

## Production

Start the server normally:
```bash
npm start
```

## Architecture
- `src/app.js`: Express configuration and middleware setup.
- `src/server.js`: Server entry point and shutdown logic.
- `src/routes/`: API route definitions.
- `src/middleware/`: Custom Express middlewares (logging, errors, 404).
- `src/config/`: Configuration and environment validation.
