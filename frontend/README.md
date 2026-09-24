# Maternal Risk Prediction — React Frontend Application

A modern, responsive, clinical web application for **Maternal Health Risk Prediction**, built with **React 18**, **Vite 5**, **TypeScript**, and **Tailwind CSS**.

The frontend provides an intuitive clinical interface for healthcare professionals and researchers to assess maternal health risk levels (**Low Risk**, **Mid Risk**, or **High Risk**) using single-patient parameters or bulk spreadsheet uploads, as well as exploring machine learning performance and model explainability.

---

## 1. Features & User Experience

- **Single Patient Risk Assessment**:
  - Validated clinical form with pre-configured physiological bounds for 6 healthcare parameters.
  - Interactive model selector supporting all 8 backend estimators.
  - Redesigned **Prediction Result** dashboard featuring:
    - High-contrast **Risk Level Badge** (`Low Risk`, `Mid Risk`, `High Risk`) with contextual clinical notes.
    - Zero-overlap **Model Confidence Dial Gauge** with animated progress arc, scale markers (`0%`, `50%`, `100%`), dual-ring pivot hub, and confidence tier badges.
    - **Structured Parameter Cards** in a responsive 2-column grid with dedicated clinical icons, reference ranges, and separate colored unit pills (`mmHg`, `mmol/L`, `years`, `°F`, `bpm`).
- **Bulk Spreadsheet Prediction**:
  - Drag-and-drop file uploader supporting `.csv`, `.xls`, and `.xlsx` files up to 10 MB.
  - Interactive summary metrics (Total, Low Risk, Mid Risk, High Risk counts).
  - Risk distribution bar and proportion charts powered by Recharts.
  - Searchable, risk-filterable tabular results with single-click CSV export.
- **Model Performance Benchmarks**:
  - Comparative bar charts evaluating all 8 machine learning models with gold star highlighting for the top-performing model (**Random Forest: 85.25%**).
- **Model Explainability & Feature Importance**:
  - Impurity-based feature importance visualization displaying contribution weights and clinical descriptions.
- **Pipeline Component Ablation Study**:
  - Step-by-step ablation comparison (No Scaling, Scaling Alone, Reduced Features, Full Pipeline).
- **Full-Stack Resilience**:
  - Live backend status monitoring in the navigation header.
  - Seamless fallback to canonical research metrics when backend is in configuration or offline mode.

---

## 2. Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom medical color palette and animations
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts 3](https://recharts.org/)
- **Spreadsheet Processing**: [PapaParse](https://www.papaparse.com/) & [XLSX](https://sheetjs.com/)

---

## 3. Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChartCard.tsx               # Wrapper for Recharts visualizations
│   │   ├── DataTable.tsx               # Filterable bulk prediction table
│   │   ├── Disclaimer.tsx              # Ethical & clinical disclaimer banner
│   │   ├── ErrorMessage.tsx            # Standardized alert error component
│   │   ├── FeatureCard.tsx             # Interactive dashboard navigation cards
│   │   ├── FileUpload.tsx              # Drag-and-drop CSV/Excel uploader
│   │   ├── Footer.tsx                  # Application footer with disclaimers
│   │   ├── LoadingSpinner.tsx          # Accessible animated loading indicator
│   │   ├── Navbar.tsx                  # Header navigation with live status dot
│   │   ├── PredictionForm.tsx          # 6-parameter form with input validation
│   │   ├── ResultCard.tsx              # Detailed prediction result & parameter grid
│   │   ├── RiskBadge.tsx               # Color-coded risk status badge
│   │   ├── RiskGauge.tsx               # Semicircular confidence dial meter
│   │   └── StatCard.tsx                # Dashboard numerical stat display
│   │
│   ├── data/
│   │   └── projectData.ts              # Physiological metadata & research baselines
│   │
│   ├── pages/
│   │   ├── AblationStudy.tsx           # Pipeline ablation experiments page
│   │   ├── About.tsx                   # Project methodology & problem statement
│   │   ├── BulkPrediction.tsx          # Batch file upload and analysis workflow
│   │   ├── FeatureImportance.tsx       # Explainability & feature weights page
│   │   ├── Home.tsx                    # Landing page with health check & stats
│   │   ├── ModelPerformance.tsx        # Comparative model benchmark charts
│   │   ├── Prediction.tsx              # Single patient prediction form view
│   │   └── PredictionResult.tsx        # Diagnostic result & breakdown view
│   │
│   ├── services/
│   │   └── api.ts                      # Centralized typed API client
│   │
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces for API & models
│   │
│   ├── App.tsx                         # Router configuration
│   ├── index.css                       # Tailwind layers & custom utilities
│   └── main.tsx                        # React application entrypoint
│
├── index.html                          # HTML template
├── package.json                        # Dependencies and scripts
├── tailwind.config.js                  # Tailwind theme and medical colors
├── tsconfig.app.json                   # TypeScript compiler options
└── vite.config.ts                      # Vite configuration with path aliases (@/*)
```

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   Create a `.env` file in `frontend/` if connecting to a custom backend address:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:5000
   ```
   *(Defaults to `http://127.0.0.1:5000` if omitted).*

---

## 5. Development & Build Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server with HMR at `http://localhost:5173`. |
| `npm run build` | Typechecks and compiles production bundle to `frontend/dist/`. |
| `npm run typecheck` | Runs `tsc --noEmit` to verify TypeScript types without building. |
| `npm run preview` | Locally serves the production `dist/` build for verification. |
| `npm run lint` | Runs ESLint across the codebase. |

---

## 6. Integration with Flask Backend

The frontend communicates with the Flask REST API via [`src/services/api.ts`](file:///c:/Users/omkar/OneDrive/Desktop/MaternalRisk_Prediction/frontend/src/services/api.ts):

| API Endpoint | HTTP Method | Frontend Function | Used On Page |
| :--- | :--- | :--- | :--- |
| `GET /` | `GET` | `getSystemStatus()` | Header & Home page |
| `GET /models` | `GET` | `getPredictionModels()` | Single & Bulk Prediction forms |
| `POST /predict` | `POST` | `predictMaternalRisk()` | Single Prediction page |
| `POST /bulk-predict` | `POST` | `bulkPredict()` | JSON batch prediction |
| `POST /predict-bulk` | `POST` | `bulkPredictFile()` | Bulk Prediction file upload |
| `GET /model-performance` | `GET` | `getModelPerformance()` | Model Performance comparison |
| `GET /feature-importance` | `GET` | `getFeatureImportance()` | Feature Importance page |
| `GET /ablation-study` | `GET` | `getAblationStudy()` | Pipeline Ablation Study page |
