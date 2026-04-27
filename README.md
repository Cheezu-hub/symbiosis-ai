# ♻️ Symbiosis AI — Industrial Symbiosis Platform

> **Transforming Industrial Waste into Sustainable Resources.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Symbiosis%20AI-blue?style=for-the-badge&logo=vercel)](https://symbiosis-ai.vercel.app/)

Symbiosis AI is a cutting-edge digital platform designed to facilitate **Industrial Symbiosis** (IS). It empowers businesses to list their waste products and discover other industries that can utilize those by-products as raw materials. By closing the loop on industrial processes, Symbiosis AI reduces landfill waste, lowers carbon emissions, and creates new economic value through a circular economy.

---

## 🌟 Key Features

### 1. **Resource Marketplace**
*   **Waste Listings:** Post detailed information about available by-products, including material type, quantity, and location.
*   **Resource Requests:** Specify raw material requirements to discover potential matches from other industries.
*   **Categorization:** Support for plastic, metal, organic waste, energy (heat/steam), water, and more.

### 2. **AI-Driven Matchmaking**
*   **Intelligent Scoring:** Automatically matches waste listings with resource requests based on material compatibility and geographic proximity.
*   **Predictive Insights:** AI-driven recommendations for potential symbiosis opportunities.
*   **Real-time Alerts:** Notifications when a new compatible partner is found.

### 3. **Dynamic Network Visualization**
*   **Resource Flow Graph:** Interactive force-directed graph showing real-time resource exchange relationships between industries.
*   **Spatial Analysis:** Visualize nearby industries to optimize local clusters and minimize transport costs.

### 4. **Logistics & Supply Chain Optimization**
*   **Route Optimization:** Calculate the most efficient transport routes for resource exchanges.
*   **Distance Tracking:** Automated calculation of transport distances to estimate logistics costs and carbon footprint.

### 5. **Sustainability & Impact Analytics**
*   **CO2 Reduction Tracking:** Real-time metrics on carbon emissions saved through material reuse.
*   **Waste Diversion:** Monitor the total tonnage of waste diverted from landfills.
*   **CSR Reporting:** Generate automated sustainability reports for corporate responsibility initiatives.

---

## 🚀 Core Modules

| Module | Description |
| :--- | :--- |
| **Dashboard** | Centralized view of recent trades, matches, and environmental impact. |
| **Marketplace** | The hub for browsing and posting waste/resource listings. |
| **Network** | A visual map of industrial connections and resource flows. |
| **Logistics** | Tools for planning and optimizing the transport of materials. |
| **Impact** | Detailed analytics on sustainability goals and performance. |
| **Transactions** | A secure ledger for managing trade requests and completed exchanges. |

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Lucide Icons, Recharts, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **AI Engine** | Python (Scikit-learn, Pandas) |
| **Authentication** | JSON Web Tokens (JWT) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📂 Project Structure

```text
ism_pg/
├── ai-engine/        # Python AI matching logic and impact analytics
├── backend/          # Node.js + Express API server
│   ├── routes/       # API route definitions (Waste, Resources, Trades, etc.)
│   ├── services/     # Business logic and Database interactions
│   └── server.js     # Server entry point
├── database/         # SQL Schema, migrations, and seed data
├── frontend/         # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI components (Modals, Charts, Layout)
│   │   ├── pages/      # Feature-specific page views
│   │   └── services/   # Frontend API client
└── README.md         # Project documentation
```

---

## ⚙️ Getting Started (Local Setup)

### 1. Prerequisites
*   **Node.js** (v18+)
*   **PostgreSQL** (v14+)
*   **Python** (v3.8+) — *Required for AI Engine features*

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env file with PostgreSQL credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> The app will be available at **http://localhost:5173** (if using Vite) or **http://localhost:3000**.

### 4. AI Engine Setup
```bash
cd ai-engine
pip install -r requirements.txt
python matching.py
```

---

## 🌍 The Impact of Industrial Symbiosis

Industrial symbiosis is a primary pillar of the **Circular Economy**. Traditionally, waste disposal is a cost center. Symbiosis AI turns it into a profit center by:
1.  **Reducing Disposal Costs:** Diverting waste from expensive landfills.
2.  **Lowering Raw Material Costs:** Sourcing repurposed materials at a lower cost than virgin ones.
3.  **Cutting CO2 Emissions:** Reducing the environmental footprint of long-distance logistics and raw material extraction.

---

## 📄 License

This project is licensed under the MIT License.
