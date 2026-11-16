# MCP feature

The MCP integration lives in this folder. It exposes two deliberately separate servers:

- `servers/reader/` contains public, read-only tools.
- `servers/admin/` contains owner authoring tools and the GitHub approval flow.
- `client/` contains the browser-side connection check used by the guide.
- `setup/` contains installation links and configuration for supported assistant clients.
- `vite/` discovers each server's tool files and generates its import registry.

## Add a tool

Add one default-exported `defineTool(...)` file to the appropriate `servers/<reader-or-admin>/tools/` folder. The Vite registry plugin discovers the file and includes it in that server; no central tool list needs editing.

Public tools belong only in `reader/tools/`. Keep writes in `admin/tools/`, and use the shared owner authorization helpers before any GitHub mutation. Do not accept caller identity or privileged credentials as tool input.

Each server remains independently configured in `vite.config.ts` because their endpoints and access behavior differ. The SDK generates the corresponding function files during the Vite build; those generated files are not the source of truth.