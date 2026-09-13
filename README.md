# chaosgen

Chaos & Conquest character generator. The TypeScript migration is in progress;
the current interfaces are a local browser application and PDF CLI.

## Requirements

- Node.js 24.x
- npm 11.x

Install the pinned dependencies from the repository root:

```sh
npm ci
```

## CLI

Run the CLI from the repository root:

```sh
npm run chaosgen -- --background knight --seed example --output knight.pdf
npm run chaosgen -- --count 5 --seed batch-example --output-dir output/
npm run chaosgen -- --all --seed roster-example --output-dir output/
```

With no options it generates one random character into the current directory.
`--background` accepts a background ID such as `wizards-apprentice` or its
display name. `--output` is for exactly one character and refuses to overwrite
an existing file. Use `--output-dir` for batches; generated filenames are
sanitized and gain numeric suffixes when necessary to avoid overwriting files.

`--seed` makes an individual result reproducible. Seeded batches derive a
separate stable seed for every character, so their results are reproducible but
not identical. The CLI resolves its fillable PDF templates relative to its own
entry point, rather than the current directory.

Current limits: output text must be representable by Helvetica, completed PDFs
remain editable, and generation covers only new characters plus companions
granted by their backgrounds.

## Browser application

Start the local application from the repository root:

```sh
npm run dev
```

Choose a background or leave it random, generate a character, then edit its
name, age, faction, traits, starting spell, or one attribute swap. The review
updates derived values without rerolling unrelated data. `Download PDF` creates
an editable PDF locally in the browser; no account, backend, or external runtime
service is required.

## GitHub Pages

The repository includes a GitHub Actions workflow that tests, builds, and uploads
the static site on pull requests, then deploys the `main` branch artifact to
GitHub Pages. In repository settings, set **Pages** to **GitHub Actions** as the
source before the first deployment. The application uses relative asset URLs, so
the generated PDFs load at the root site URL and under a repository project path.

Preview the production build locally with:

```sh
npm run build
npm run preview
```

## License

The generator code is licensed under [GPL-3.0](LICENSE). The adapted Chaos &
Conquest rules data is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); credit
Alexander Gomez and The Chaos Consortium. See [data/README.md](data/README.md)
for data provenance and attribution.
