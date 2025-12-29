# InkPad

A beautiful, seamless blend of Markdown writing and freehand drawing. Capture your thoughts in text, illustrate them with sketches, and customize your writing environment to match your flow.

## 🚀 Live Demo

**[Try InkPad Live Here](https://inkwell-thoughts-95.lovable.app/)**

## ✨ Features

*   **Markdown Editor**: Write with a clean, distraction-free Markdown editor.
*   **Creative Drawing Tools**: Sketch, annotate, and highlight directly over your notes using the pen and highlighter tools.
*   **Flexible Layouts**:
    *   **Write Mode**: Focus purely on your text.
    *   **Split Mode**: See your code and preview side-by-side.
    *   **Preview Mode**: View your final document with drawings overlay.
*   **Customizable Themes**: Switch between **Light**, **Dark**, and the soothing **Nightlight** theme.
*   **Local Auto-Save**: Your work is automatically saved to your browser's local storage (IndexedDB), so you never lose a thought.
*   **Import & Export**:
    *   Export notes as `.md` files (drawings are preserved as metadata!).
    *   Import existing Markdown files to continue working.

## 🛠️ Tech Stack

This project is built with a modern frontend stack:

*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [shadcn/ui](https://ui.shadcn.com/)
*   [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via `idb`)

## 💻 Getting Started

Follow these steps to run InkPad locally on your machine.

### Prerequisites

*   Node.js & npm installed (Recommended: Use [nvm](https://github.com/nvm-sh/nvm))

### Installation

1.  **Clone the repository**
    ```bash
    git clone <YOUR_GIT_URL>
    ```

2.  **Navigate to the project directory**
    ```bash
    cd <YOUR_PROJECT_NAME>
    ```

3.  **Install dependencies**
    ```bash
    npm install
    ```

4.  **Start the development server**
    ```bash
    npm run dev
    ```

## ⌨️ Keyboard Shortcuts

Streamline your workflow with these shortcuts:

*   **Switch Views**:
    *   `Ctrl` + `Alt` + `1` (or `Cmd` + `Alt` + `1`): **Write View**
    *   `Ctrl` + `Alt` + `2` (or `Cmd` + `Alt` + `2`): **Split View**
    *   `Ctrl` + `Alt` + `3` (or `Cmd` + `Alt` + `3`): **Preview View**
*   `Escape`: Return to Split View (from other views)

## 🤝 Contributing

Feel free to fork this repository and submit pull requests. Whether it's fixing bugs, improving documentation, or adding new features, contributions are welcome!
