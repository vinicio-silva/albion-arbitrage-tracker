# Albion Arbitrage Tracker 💰

🌍 **Live Demo:** [albion-arbitrage-tracker.vercel.app](https://albion-arbitrage-tracker.vercel.app/)

An advanced, real-time market arbitrage scanner and analytics tool for **Albion Online**. Built with React and TypeScript, this application interacts directly with the [Albion Online Data Project API](https://www.albion-online-data.com/) to find the most profitable item flips and trade routes across the Royal Continent and the Black Market.

![App Preview](https://github.com/user-attachments/assets/6dc1a58a-5394-4b7d-8254-b14a0fd5e8ff)

## ✨ Features

- 🚀 **Live Global Scanner**
  Systematically iterates through all 11,000+ tradable items in Albion Online to surface the highest-profit arbitrage flips across all major cities, simultaneously.

- 🗺️ **Targeted Route Scanner (LOC A ➔ LOC B)**
  Focus on a specific trade route! Choose your exact "Buy in" and "Sell to" cities. The system will rank items strictly based on the profitability of that specific transport route (e.g., Lymhurst ➔ Black Market).

- 📊 **Single Item Analytics**
  Deep-dive into specific items. View real-time pricing charts across all cities, with smart outliers and stale data filtering.

- 💰 **Accurate Tax Deductions & ROI**
  Unlike basic scanners, this tool calculates actual net profits by automatically deducting the in-game market taxes. It displays side-by-side comparisons for:
  - **Premium (-4% tax)**
  - **No Premium (-8% tax)**
  - Displays the exact **Return on Investment (ROI %)** for every opportunity.

- 🧠 **Smart Sorting & Filtering**
  - **Sort by:** Net Profit Amount or ROI Percentage.
  - **Filter by:** Item Quality (Normal to Masterpiece).
  - **Max Stale Time:** Ignore listings older than your specified threshold (5 minutes to 24 hours).
  - **Fake Order / Outlier Protection:** Configurable 'xBid' multiplier to ignore blatantly fake or manipulated orders.

- ⏱️ **API Rate-Limit Compliant**
  Intelligently throttles API requests (approx. 1 request per second) to strictly respect the Albion Data Project's rate limit of 300 requests per 5 minutes, ensuring your IP doesn't get banned.

## 🛠️ Tech Stack

- **Frontend Framework:** React 18, TypeScript, Vite
- **Styling:** Custom CSS with Modern Glassmorphism UI
- **Icons:** Lucide React
- **Data Source:** [Albion Online Data API](https://www.albion-online-data.com/)
- **AI Assisted:** Built with **Antigravity** powered by **Gemini 3.1 Pro (High)**.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vinicio-silva/albion-arbitrage-tracker.git
   cd albion-arbitrage-tracker
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local server URL (usually `http://localhost:5173`).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/vinicio-silva/albion-arbitrage-tracker/issues) if you want to contribute.

## ⚠️ Disclaimer

This application relies entirely on community-driven data provided by the Albion Online Data Project. Market prices belong to players running the data client in the background, meaning that low-activity items might have outdated or missing data. 

These tools are not affiliated with Albion Online or Sandbox Interactive GmbH.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
