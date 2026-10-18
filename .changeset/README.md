# Changesets

This directory is managed by [changesets](https://github.com/changesets/changesets). Version bumps, changelogs, git tags, and GitHub releases are driven from the changeset files here.

Add a changeset in any PR that changes a package:

```bash
bun changeset
```

Pick the affected packages and a bump level (patch/minor/major), then commit the generated markdown file. On merge to `main`, CI opens a "Version Packages" PR; merging that applies the bumps, tags, and triggers the release builds.

All packages are private — nothing is published to npm. Changesets is used purely for versioning, changelogs, tags, and GitHub releases that drive the Docker/desktop/mobile release jobs.

## Breaking changes

If a change stops older versions of the other side from working, start a line in the changeset summary with `BREAKING:`:

```md
---
"@refine/api": minor
---

BREAKING: history items now use numeric ids.
```

`bun run version-packages` uses this to raise the minimum versions in `packages/versions/src/generated.ts`:

- `@refine/api` marked breaking: the server requires the desktop and mobile versions from the same release.
- `@refine/desktop` or `@refine/mobile` marked breaking: that app requires the server version from the same release.

Clients below the minimum get blocked with an update prompt. Never edit `generated.ts` by hand.
