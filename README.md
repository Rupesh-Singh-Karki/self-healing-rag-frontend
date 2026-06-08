# Eidos — Self-Healing RAG

**Eidos** is an advanced Document Intelligence platform built around a self-healing Retrieval-Augmented Generation (RAG) pipeline. It allows you to upload documents, ask complex questions, and watch as the system fetches context, generates answers, evaluates its own confidence, and automatically re-evaluates if the answer isn't good enough.

## 🌟 What Does This Do?

Typical AI chat applications rely on a simple prompt-and-response flow. However, when working with complex documents, AI models can hallucinate or miss critical context. 

Eidos solves this by implementing a **Self-Healing Pipeline**:
1. **Upload Document**: You upload your PDFs and the system extracts the text.
2. **Chunking**: The extracted text is intelligently broken down into smaller semantic blocks.
3. **Vector Retrieval**: When you ask a question, Eidos uses embeddings to find the most relevant chunks from your documents.
4. **LLM Generation**: An AI model drafts an initial answer based on the retrieved context.
5. **Critique**: The system evaluates its own answer for confidence and accuracy.
6. **Self-Healing Loop**: If the system detects low confidence or missing context, it will automatically loop back, adjust its search strategy, retrieve better context, and generate a new answer.

This guarantees high-accuracy, hallucination-free answers based strictly on the documents you provide.

## 🚀 Features

- **Sleek, Minimalist Interface**: Designed with a high-end, futuristic dark-mode aesthetic (The Kinetic Architect design system).
- **Interactive Chat**: Ask questions and chat with your documents in real-time.
- **Pipeline Visibility**: See exactly what the AI is doing under the hood (Chunking, Retrieval, Generation, Critique).
- **Document Management**: Manage your uploaded documents and see how many chunks have been indexed.
- **Analytics & Profile Drawer**: Track your usage statistics, session confidence, and review the pipeline architecture right from your profile.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Redux Toolkit & RTK Query
- **Fonts**: Bricolage Grotesque, DM Sans, and Geist Mono

## ⚙️ Getting Started

### Prerequisites
Make sure you have Node.js and npm (or yarn/pnpm) installed.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd self-healing-rag-frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts, including authentication routes (`login`, `signup`) and main application routes (`chat`).
- `components/`: Reusable UI components organized by feature:
  - `chat/`: Chat input, chat window, and message bubbles.
  - `layout/`: Main application layouts and sidebar navigation.
  - `panels/`: Deep dive panels including Critic, Sources, and Execution Trace.
  - `profile/`: User profile drawer, document rows, and pipeline information.
  - `sidebar/`: Sidebar session items, profile card, and menus.
  - `ui/`: Core UI elements like Confidence Rings and Empty States.
  - `upload/`: Document upload drawer.
- `store/`: Redux store configuration and RTK Query endpoints:
  - `api/`: API services for auth, documents, sessions, and profile.
  - `slices/`: Global state management for auth and chat.
  - `thunks/`: Async actions like real-time message handling.
- `types/`: Global TypeScript interfaces and types.
- `public/`: Static assets.

## 🎨 Design System
Eidos uses a strict "Void-First" color strategy:
- `bg-root`: `#0A0A0A`
- `bg-surface`: `#111111`
- `accent`: `#2DD4BF` (Electric Teal)

The UI emphasizes depth and atmospheric perspective instead of solid borders, using subtle background color shifts and it glows.
- Rupesh Singh Karki
