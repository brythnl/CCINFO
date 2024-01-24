<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<div align="center">
  <h1 align="center">Customer Centric Investment Forecast</h3>

  <p align="center">
    A finance app to calculate investment plans.
    <br />
    Developed for <a href="https://https://www.aixigo.com">aixigo AG</a>. Powered by the <a href="https://portal.aixigo.com/docs/finance-math-api#">BLOXX Finance Math API</a>.
    <br />
    <br />
    <a href="https://ccinfo.vercel.app">Check it out!</a> (You have to register first if you don't have an account)
    <br />
    <br />
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project
This project is created in collaboration with aixigo AG in order to solve problems concerning 2 target groups: end users and internal users (sales, bankers, etc.).
- For end users, they are able to choose an investment plan, whether it be saving, withdrawing or a combination of the two and calculate the results. They can choose on aspect they wish to calculate (e.g. saving rate) and receive the results for the whole plan, visualized through different mediums.
- For internal users, to get the results from the API they had to go through multiple steps to get the data (form) they need. Now this can be done with a single tool.

Below is a screenshot of a calculation of a combination plan compared to a previous calculation in the graph with the API visualization shown.

[![CCINFO Kombiplan Screenshot][kombiplan-screenshot]](https://ccinfo.vercel.app)

### Features
- Calculate a saving or withdrawing plan, or even a combination of the two.
- Choose a specific aspect to calculate (e.g. start investments, saving rate, interest rate, etc.)
- Visualize and represent data through:
  - A graph of the data with details for each year.
  - A natural language statement that explains the result of the calculated aspect.
  - A series table, also with details for each year.
- Store the latest 2 calculations, which can be compared in:
  - The graph, which the user can also choose to hide/show the calculation(s).
  - The comparison table, to directly compare any changes made to the input and the result difference.
- Show a visualization of the API response and request that also enables highlighting for the API endpoints or properties - for developers, bankers or other interested groups. (It is hidden by default)

### Technology
* [![Nuxt][Nuxt.js]][Nuxt-url]
* [![Vue][Vue.js]][Vue-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![TailwindCSS][TailwindCSS]][TailwindCSS-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started (Development)
### Installation
1. Clone the repository
```bash
git clone git@github.com:brythnl/CCINFO.git
```

#### Without Docker
2. Install npm packages
```bash
npm i
```

3. Run development server on http://localhost:3000
```bash
npm run dev
```

#### With Docker:
Make sure to already have Docker Engine and Docker Compose installed.

2. Start the local development environment
```bash
docker compose up
```

3. Access local development server on http://localhost:3000

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/brythnl/CCINFO.svg?style=for-the-badge
[contributors-url]: https://github.com/brythnl/CCINFO/graphs/contributors
[issues-shield]: https://img.shields.io/github/issues/brythnl/CCINFO.svg?style=for-the-badge
[issues-url]: https://github.com/brythnl/CCINFO/issues
[kombiplan-screenshot]: images/ccinfo_ss.png
[Nuxt.js]: https://img.shields.io/badge/Nuxt-002E3B?style=for-the-badge&logo=nuxtdotjs&logoColor=#00DC82
[Nuxt-url]: https://nuxt.com
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com
