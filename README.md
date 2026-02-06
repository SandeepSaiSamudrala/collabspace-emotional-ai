# Collabspace Emotional AI

## Description

Collabspace Emotional AI is a comprehensive web application designed to help users track, understand, and manage their emotional well-being. It provides individuals and teams with a private, insightful, and proactive way to maintain mental well-being, fostering a more balanced and productive environment. The application leverages AI-powered insights to provide personalized guidance, mood trend analysis, and a collaborative environment for task management and team interaction.

## Key Features

*   **Emotional AI Insights:** Personalized insights and suggestions based on mood patterns and energy levels, delivered through a dynamic dashboard card.
*   **AI Chat/Guidance:** Interact with an AI assistant for personal emotional support and advice in a conversational interface.
*   **Mood Tracking:** Log daily moods with a simple, intuitive modal to build a comprehensive emotional history.
*   **Mood Trend Analysis:** A dedicated AI page visualizes emotional trends over time with custom charts and key performance indicators (KPIs) like Mood Score, Stability, Stress, and Energy levels.
*   **Task Management:** Organize and track tasks with a Kanban-style board, providing a clear view of your workflow.
*   **Team Collaboration:** Manage team members and facilitate communication within a shared space.
*   **Calendar Integration:** A calendar view to keep track of events, tasks, and potentially correlate them with mood entries.
*   **Notifications:** Stay updated with real-time alerts for recent activities and important events.
*   **User Authentication:** Secure login and signup functionality powered by Firebase, with protected routes for user-specific data.
*   **Responsive UI:** A fully responsive interface that adapts seamlessly across various devices (mobile, tablet, desktop).

## Technologies Used

*   **Frontend:**
    *   **React.js:** A JavaScript library for building user interfaces.
    *   **Vite:** A fast build tool chosen for its exceptional developer experience and optimized builds.
    *   **Tailwind CSS:** A utility-first CSS framework utilized for rapid, consistent, and responsive UI development.
    *   **Zustand:** A lightweight state-management solution chosen for its simplicity and scalability, avoiding boilerplate.
    *   **Lucide React:** A clean and modern icon library.
    *   **React Router DOM:** For declarative routing and enabling code-splitting.
*   **Backend & Database:**
    *   **Firebase:** Google's backend-as-a-service platform.
        *   **Firebase Authentication:** For user authentication.
        *   **Firestore:** A NoSQL cloud database for storing and syncing application data in real-time.
*   **Tooling:**
    *   **ESLint:** To enforce code quality and maintain consistent coding standards.

## Architecture & Development Philosophy

This project is built with a strong emphasis on maintainability, scalability, and performance.

*   **Code Organization:** A clear and logical directory structure separates concerns into `components`, `pages`, `services`, and `store`, making the codebase easy to navigate and understand.
*   **Modular & Reusable:** The architecture promotes the "Don't Repeat Yourself" (DRY) principle. Shared logic (e.g., in `aiService.js`) and UI components (e.g., `MoodCheckInModal`) are centralized for easy reuse and maintenance.
*   **Performance First:** The application is optimized for a fast user experience. It implements route-based **code-splitting (lazy loading)** using `React.lazy()` and `Suspense`, ensuring users only download the code they need for the initial page view.
*   **Separation of Concerns:** A dedicated services layer (`src/services`) handles all backend communication and business logic, decoupling the UI from data-fetching implementations.

## Leveraging Gemini CLI for Development

The development workflow for this project can be significantly accelerated and enhanced by using the Gemini CLI.

*   **Code Analysis:** Use `gemini analyze <file_path>` to quickly understand complex code segments or identify potential improvements.
*   **Refactoring:** Get suggestions for improving code structure, extracting components, or simplifying logic.
*   **Feature Development:** Leverage the CLI to scaffold new components, pages, or services according to established project conventions.
*   **Debugging:** Use Gemini CLI to explain error messages from the console or suggest debugging strategies.
*   **Documentation:** Assist in generating documentation, such as creating comprehensive README files or explaining a component's props and purpose.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or Yarn

### Installation

1.  **Clone the repository:** `git clone [repository-url]`
2.  **Navigate to the project directory:** `cd collabspace-emotional-ai`
3.  **Install dependencies:** `npm install`

### Environment Configuration

1.  Create a `.env` file in the root of the project.
2.  Go to the [Firebase Console](https://console.firebase.google.com/), create a project, register a web app, and get your configuration.
3.  Add your Firebase configuration to the `.env` file. **It is critical to also set up Firestore Security Rules in the Firebase console to protect user data.**
    ```env
    VITE_FIREBASE_API_KEY="YOUR_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    # ... and other Firebase variables
    ```

### Running the Project

*   **Development:** `npm run dev`
*   **Production Build:** `npm run build`

## Future Enhancements

*   **Automated Testing:** Implement a comprehensive testing suite with Vitest and React Testing Library for unit and component testing.
*   **Error Handling:** Enhance robustness with global error boundaries and more granular UI feedback for failed operations.
*   **Accessibility (a11y):** Conduct a full accessibility audit to ensure WCAG compliance, especially around focus management in modals and ARIA attributes.
*   **Internationalization (i18n):** Add support for multiple languages.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
