# chaosgen

Chaos & Conquest character generator. The TypeScript migration is in progress;
the current interface is a local PDF-only CLI.

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
granted by their backgrounds. The browser interface, deployment, and removal of
the legacy Python/Discord implementation are remaining migration work.

## License

Chaos & Conquest was created by Alex Gomez and licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
