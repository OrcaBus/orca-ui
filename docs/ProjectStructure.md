# Project Structure and Naming Convention

## Project Structure

```text
/src
|-- /api                    # API functions
|   |-- userApi.ts
|   |-- workflowApi.ts
|-- /assets                 # Static files like images and fonts
|   |-- /images
|   |   |-- logo.png
|   |   |-- banner.jpg
|   |-- /icons
|   |   |-- Spinner.tsx
|-- /components             # Reusable UI components
|   |-- /common             # Generic reusable UI components
|   |   |-- Button.tsx
|   |   |-- InputField.tsx
|   |-- /layout             # Layout-related components
|   |   |-- Container.tsx
|   |   |-- Grid.tsx
|   |-- /navigation         # navigation-related components
|   |   |-- NavBar.tsx
|   |   |-- Header.tsx
|   |-- /modals             # For modal-related components
|   |   |-- SideModal.tsx
|   |   |-- ConfirmationModal.tsx
|   |-- /tabs               # Components related to tab functionalities
|   |   |-- PopupTabView.tsx
|   |   |-- DetailedTabView.tsx
|-- /context                # React contexts for state management
|   |-- UserContext.tsx
|   |-- ThemeContext.tsx
|-- /hooks                  # Custom React hooks
|   |-- useAuth.ts
|   |-- useDialog.ts
|-- /modules                  # Route-specific components
|   |-- /runs
|   |   |-- index.tsx       # router for thsi modules
|   |   |-- /Pages
|   |       |-- WorkflowRuns.tsx  # Page section of the ModulesPage
|   |   |-- /components
|   |       |-- WorkflowTable.tsx  # components section of the HomePage
|-- /router                 # react routes
|   |-- index.ts
|   |-- modules.ts            # modules routers collections defined in system
|-- /types                  # TypeScript type definitions
|   |-- commonTypes.d.ts
|   |-- vite-env.d.ts
|-- /stories                # storybook store
|   |-- assets
|   |-- Button.stories.tsx
|-- /utils                  # Utility functions
|   |-- formatDate.ts
|   |-- calculateTotal.ts
|-- App.tsx                 # Root component
|-- main.tsx                # Entry point of the application
|-- index.css               # Global styles
```

### general guide

- Folders: Use lowercase to avoid case sensitivity issues across different operating systems.
- Page folder: Use PascalCase to immediately recognize it as a component, with an index file defined inside.
- Files:
  - React Components: Use PascalCase for files that define React components (e.g., UserProfile.tsx).
  - TypeScript Files: Use camelCase for other files (e.g., userApi.ts).

### components

- /common: Contains universally reusable UI components like Button.tsx and InputField.tsx.
- /layout: Includes components that are part of the website’s layout, such as Container.tsx

### others

- Index Files: Use index.ts files within directories to re-export components, simplifying imports across the application.
