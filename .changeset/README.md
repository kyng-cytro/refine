# Changesets

This directory is managed by [changesets](https://github.com/changesets/changesets). Version bumps, changelogs, git tags, and GitHub releases are driven from the changeset files here.

Add a changeset in any PR that changes a package:

```bash
bun changeset
```

Pick the affected packages and a bump level (patch/minor/major), then commit the generated markdown file. On merge to `main`, CI opens a "Version Packages" PR; merging that applies the bumps, tags, and triggers the release builds.

All packages are private — nothing is published to npm. Changesets is used purely for versioning, changelogs, tags, and GitHub releases that drive the Docker/desktop/mobile release jobs.
