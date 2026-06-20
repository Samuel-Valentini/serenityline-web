# SerenityLine Web

Frontend web application for **SerenityLine**, a deployed personal finance forecasting SaaS that helps users project future liquidity, manage recurring transactions, and compare alternative financial scenarios before making important decisions.

The frontend is built with **React**, **TypeScript**, and **Vite**, and communicates with the SerenityLine backend API.

## Links

* Live application: [serenityline.me](https://serenityline.me/)
* Backend repository: [serenityline-api](https://github.com/Samuel-Valentini/serenityline-api)
* Author GitHub profile: [Samuel-Valentini](https://github.com/Samuel-Valentini)

A short demo video is available in the [How it works](https://serenityline.me/come-funziona#tutorial-serenityline) section of the live application.

Registration is required to access the authenticated application area.

## Project overview

SerenityLine helps users understand their future financial situation by turning recurring income and expenses into a forward-looking liquidity projection.

SerenityLine is not just a budgeting interface. Its purpose is to help users answer a practical question:

> “Can I afford this decision without compromising my financial peace of mind over the coming months?”

The application allows users to:

* manage accounts and financial data;
* define recurring income and expenses;
* visualize future liquidity trends;
* simulate alternative financial decisions;
* compare current and simulated scenarios;
* organize financial flows through categories and financial priorities;
* interact with a user interface designed around clarity, trust, and practical decision-making.

The frontend was developed as part of my Full-Stack Development capstone project.

The goal was to build a production-oriented MVP frontend: not only a functional interface, but a deployed web application designed with realistic concerns in mind, including usability, state management, API integration, routing, data visualization, testing, maintainability, internationalization, responsive design, and deployment.

## What this project demonstrates

This repository is intended to demonstrate frontend and full-stack development skills in a realistic application context, including:

* React and TypeScript application development;
* component-based UI architecture;
* client-side routing with protected and guest routes;
* global state management with Redux Toolkit;
* integration with a Spring Boot REST API;
* authentication-aware frontend flows;
* in-memory access-token handling;
* cookie-based refresh-token flow integration with the backend API;
* chart-based data visualization;
* form handling and validation-oriented user flows;
* reusable UI components;
* responsive layout implementation;
* internationalized UI content;
* frontend testing with Vitest and Testing Library;
* deployment of a production frontend on Netlify;
* product-oriented thinking and attention to user experience.

## Frontend scope

This repository contains the React frontend of SerenityLine.

Main responsibilities:

* user interface implementation;
* public landing pages;
* authenticated application layout;
* application routing;
* protected and guest route handling;
* API integration with the backend;
* authentication-aware frontend flows;
* state management;
* charts and data visualization;
* responsive layout;
* form handling;
* reusable components;
* internationalization;
* frontend testing;
* Netlify deployment.

## Main features

* Landing page and product explanation
* Demo/tutorial section
* Security, privacy, terms, and contact pages
* Authentication-related user flows
* Email verification flow
* Password reset flow
* Email change confirmation flow
* Invitation acceptance flow
* Email-based 2FA login flow
* Dashboard-oriented user experience
* Account and financial data interaction
* Credit card management
* Category and financial-priority interaction
* Recurring transaction management
* Transaction management
* Calendar-based financial view
* Scenario and simulation visualization
* Bucket/portfolio-style liquidity allocation views
* Chart-based representation of the SerenityLine
* Balance visualization
* Settings and administration areas
* API-based data fetching
* Reusable UI components
* Responsive layout
* Frontend test suite

## Tech stack

* React
* TypeScript
* Vite
* Redux Toolkit
* React Router
* Bootstrap
* SCSS / Sass
* Recharts
* i18next / react-i18next
* Vitest
* Testing Library

## Architecture notes

### Routing

The application uses client-side routing with separate areas for:

* public pages;
* authentication pages;
* authenticated application pages.

Authenticated pages are protected through route-level checks based on the current authentication state.

### State management

Redux Toolkit is used for application-level state management and API-related state.

The frontend keeps sensitive financial data primarily in application memory rather than persisting it permanently in browser storage.

### Authentication flow

The frontend uses an in-memory access token for authenticated API requests.

Refresh-token handling is integrated with the backend through cookie-based flows. The frontend HTTP client can retry authenticated requests after a successful session refresh when appropriate.

### Internationalization

The user interface supports Italian and English content through i18next/react-i18next.

The MVP uses Italian routes while allowing translated UI text, labels, tooltips, validation messages, and page content.

### Data visualization

Recharts is used for SerenityLine and finance-related visualizations.

The charts are designed to support financial planning and decision-making rather than trading-style analysis.

## Deployment

The frontend is deployed on **Netlify**.

The production frontend communicates with the deployed backend API hosted on **Railway**.

## Testing

The frontend includes more than **300 automated tests**.

The test suite was created to support confidence in the main frontend flows, component behavior, state management, routing, and API-related interactions.

Typical test command:

```bash
npm test
```

Depending on the configured package scripts, the following command may also be available:

```bash
npm run test
```

## Requirements

This project requires Node.js and npm compatible with the configuration defined in `package.json`.

## Local setup

1. Clone the repository:

```bash
git clone https://github.com/Samuel-Valentini/serenityline-web.git
cd serenityline-web
```

2. Install dependencies:

```bash
npm install
```

3. Configure the required environment variables.

Environment-specific configuration values are intentionally not committed to the repository.

Typical required configuration includes:

| Variable            | Description                              |
| ------------------- | ---------------------------------------- |
| `VITE_API_BASE_URL` | Base URL of the SerenityLine backend API |

Authentication uses an in-memory access token on the frontend and cookie-based refresh-token flows handled through the backend API.

4. Start the development server:

```bash
npm run dev
```

5. Run tests:

```bash
npm test
```

Or, depending on the configured scripts:

```bash
npm run test
```

## Backend

The backend API is available here:

[serenityline-api](https://github.com/Samuel-Valentini/serenityline-api)

## Notes for reviewers

This project is publicly visible as part of my developer portfolio.

The live application is deployed and usable, but it requires registration. A demo video is available inside the landing page under [How it works](https://serenityline.me/come-funziona#tutorial-serenityline).

The project is intended to demonstrate full-stack development skills, including frontend architecture, API integration, state management, routing, authentication-aware flows, testing, deployment, and product-oriented thinking.

## License / Copyright

Copyright (c) 2026 Samuel Valentini. All rights reserved.

This project is proprietary and publicly visible only as part of the author's portfolio.

Recruiters, hiring managers, instructors, examiners, and authorized reviewers may view, clone, download, run, and test this software solely for professional recruitment evaluation, academic evaluation, or portfolio review, as described in `LICENSE.md`.

No permission is granted to copy, modify, distribute, publish, sublicense, or use this code for any other purpose without prior written permission.

See `LICENSE.md` for details.
