# CCINFO Development

## Development Environment Setup
Make sure to already have Docker Engine and Docker Compose installed.

1. Clone the repository
```bash
git clone git@github.com:brythnl/CCINFO.git
```

2. Start the local development environment
```bash
docker compose up
```

3. Access local development server on http://localhost:3000

## Linting and Formatting
- Check for errors. This will not effect in any changes.
```bash
npm run lint
```

- Fix errors. This will save any formatting changes.
```bash
npm run lintfix
```

- Check `scripts` in the `package.json` file for more details.



