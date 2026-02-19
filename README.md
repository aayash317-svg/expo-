# NFC-Based Digital Health Identity System

A dual-component system featuring a Next.js medical portal and a Flask-based NFC/QR health engine.

## 🚀 How to Run the Project

### 1. Frontend: Medical Portal (`medical-system`)
**Tech Stack**: Next.js 15, Tailwind CSS, Supabase.

1. **Navigate to the directory**:
   ```bash
   cd medical-system
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Access at `http://localhost:3000`.

---

### 2. Backend: NFC Health Engine (`nfc-health-system`)
**Tech Stack**: Flask, Python 3.x, SQLite/Supabase.

1. **Navigate to the directory**:
   ```bash
   cd nfc-health-system
   ```
2. **Set up Virtual Environment**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or source .venv/bin/activate # Linux/Mac
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Initialize Database** (First time only):
   ```bash
   python init_db.py
   ```
5. **Run the Server**:
   ```bash
   python app.py
   ```
   Access at `http://localhost:5000`.

---

## 📂 Project Structure
- **/medical-system**: Next.js application for admin, hospital, and patient dashboards.
- **/nfc-health-system**: Flask API for NFC tag management, QR generation, and health record synchronization.
- **check_policies.sql**: Database security configurations.

## 🛠️ Full Plan & Roadmap
See [PLAN.md](./PLAN.md) for the detailed development roadmap and future features.