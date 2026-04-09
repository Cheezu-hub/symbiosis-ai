# SymbioTech — Industrial Symbiosis Platform

**Transforming Industrial Waste into Sustainable Resources.**

SymbioTech is a comprehensive digital platform designed to facilitate **Industrial Symbiosis** (IS). It empowers businesses to list their waste products and find other industries that can use those by-products as raw materials. By closing the loop on industrial processes, SymbioTech reduces landfill waste, lowers carbon emissions, and creates new economic value for businesses.

---

## 🌟 Key Features

### 1. **Resource Marketplace**
*   **Waste Listings:** Post detailed information about available by-products, including material type, quantity, location, and price.
*   **Resource Requests:** Specify raw material requirements to discover potential matches from other industries.
*   **Categories:** Support for plastic, metal, organic waste, energy (heat/steam), water, and more.

### 2. **AI-Driven Matchmaking**
*   **Intelligent Scoring:** Automatically matches waste listings with resource requests based on material compatibility, quantity, and geographic proximity.
*   **Insights:** Provides data-driven recommendations on potential symbiosis opportunities that might not be obvious to human operators.

### 3. **Trade & Transaction Management**
*   **Trade Requests:** Securely negotiate and manage exchange requests between companies.
*   **Financial Ledger:** Track all transactions, pricing, and quantities in a centralized ledger.
*   **Notifications:** Real-time updates on new matches, requested trades, and accepted deals.

### 4. **Environmental Impact Tracking**
*   **Sustainability Score:** Every industry receives a score based on their participation in the circular economy.
*   **Impact Metrics:** Visualize CO2 reduction (tons), waste diverted from landfill (tons), and energy/water savings.
*   **Reports:** Generate automated sustainability reports for corporate social responsibility (CSR) initiatives.

### 5. **Network Visualization**
*   **Interactive Map:** View nearby industries and resource flows to optimize logistics and transport costs.
*   **Industry Profiles:** Manage company details, transport radius, and sustainability preferences.

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via `better-sqlite3`) — *Zero configuration required* |
| **AI Engine** | Python (Scikit-learn, Pandas) |
| **Authentication** | JSON Web Tokens (JWT) |

---

## 📂 Project Structure

```text
ism_pg/
├── frontend/         # React Application (UI + State)
├── backend/          # Node.js + Express API
├── ai-engine/        # Python AI matching logic
├── database/         # SQL Schema and Migration scripts
└── README.md         # Project documentation
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
*   Node.js (v16+)
*   Python (v3.8+) — *Required for the AI Engine*
*   npm or yarn

### 2. Backend Setup
```bash
cd backend
npm install
# Create local .env from example (or use defaults)
cp .env.example .env
npm run dev
```
> The SQLite database will be automatically initialized on the first run.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
> Opens at **http://localhost:3000**

### 4. AI Engine (Optional for Core UI)
```bash
cd ai-engine
pip install -r requirements.txt
python matching.py
```

---

## 📊 Database Overview

The system runs on a relational schema optimized for resource flows:
*   **Industries:** Company profiles and sustainability scores.
*   **Waste Listings / Resource Requests:** The core marketplace entities.
*   **Trade Requests:** The workflow for inter-company negotiations.
*   **Transactions:** Finalized exchanges with recorded environmental impact values.
*   **Impact Metrics:** Temporal data for tracking sustainability gains over time.

---

## 🌍 Why SymbioTech?

Industrial symbiosis is a primary pillar of the **Circular Economy**. Traditionally, waste disposal is a cost center. SymbioTech turns it into a profit center by:
1.  **Reducing Disposal Costs:** Diverting waste from expensive landfills.
2.  **Lowering Raw Material Costs:** Sourcing repurposed materials cheaper than virgin ones.
3.  **Cutting CO2 Emissions:** Reducing the need for long-distance logistics and virgin material extraction.

---

## 📄 License

This project is licensed under the MIT License.
