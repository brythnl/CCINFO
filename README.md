# Customer Centric Investment Forecast
> A finance planner app to calculate investments

## Installation
### Without Docker:
1. Install npm packages
```bash
npm i
```

2. Run development server
```bash
npm run dev
```

### With Docker:
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

## Git Commit Messages
```bash
<type>: <description>
```
Use lowercase. Use English for the description and **always** start with a verb.

### Types:
- feat – a new feature is introduced with the changes
- fix – a bug fix has occurred
- chore – changes that do not relate to a fix or feature and don't modify src or test files (for example updating dependencies)
- refactor – refactored code that neither fixes a bug nor adds a feature
- docs – updates to documentation such as a the README or other markdown files
- style – changes that do not affect the meaning of the code, likely related to code formatting such as white-space, missing semi-colons, and so on.
- test – including new or correcting previous tests
- perf – performance improvements
- ci – continuous integration related
- build – changes that affect the build system or external dependencies
- revert – reverts a previous commit



