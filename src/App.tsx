import { useState, useCallback, useEffect } from "react";
import { Coins, AlertCircle, Info, Search, Rocket, MapPin, TrendingUp } from "lucide-react";
import { FilterSidebar } from "./components/FilterSidebar";
import { PriceChart } from "./components/PriceChart";
import { StatsCards } from "./components/StatsCards";
import { ArbitrageScanner } from "./components/ArbitrageScanner";
import { RouteScanner } from "./components/RouteScanner";
import {
  fetchPrices,
  FetchPricesParams,
  AlbionPriceData,
} from "./services/api";
import "./index.css";

function App() {
  const [data, setData] = useState<AlbionPriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"single" | "route" | "scanner">("scanner");

  const handleSearch = useCallback(async (params: FetchPricesParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPrices(params);
      setData(result);
      if (result.length === 0) {
        setError("No data found for the given parameters.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="app-container">
      <aside
        className="sidebar-container glass-panel"
        style={{ padding: "24px" }}
      >
        <h1 className="header-title" style={{ fontSize: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Coins size={24} />
              <h1>AAT</h1>
            </div>
            <span>Albion Arbitrage Tracker</span>
          </div>
        </h1>

        {activeTab === "single" ? (
          <div style={{ marginTop: "32px" }}>
            <FilterSidebar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        ) : (
          <div style={{ marginTop: "32px", color: "var(--text-secondary)" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>
              {activeTab === "route" ? "Route Scanner Mode" : "Global Scanner Mode"}
            </h3>
            <p
              style={{
                marginTop: "8px",
                fontSize: "0.9rem",
                lineHeight: "1.5",
              }}
            >
              {activeTab === "route"
                ? "The Route Scanner systematically checks every single item between two specific cities. You control the scan rules from the main panel."
                : "The Live Global Scanner systematically checks every single item across the Albion API. You control the scan rules from the main panel."}
            </p>
          </div>
        )}
      </aside>

      <main className="main-content">
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "16px",
          }}
        >
          <button
            onClick={() => setActiveTab("scanner")}
            className={`tab-button ${activeTab === 'scanner' ? 'active' : ''}`}
          >
            <Rocket size={18} /> Live Global Scanner
          </button>
          <button
            onClick={() => setActiveTab("route")}
            className={`tab-button ${activeTab === 'route' ? 'active' : ''}`}
          >
            <MapPin size={18} /> LOC A ➔ LOC B
          </button>
          <button
            onClick={() => setActiveTab("single")}
            className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
          >
            <TrendingUp size={18} /> Single Item Analytics
          </button>
        </div>

        {activeTab === "single" && (
          <>
            <section
              className="glass-panel"
              style={{
                padding: "24px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
                  Market Pricing by City
                </h2>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Info size={14} /> Smart Filters Active: Outliers and stale data are ignored based on your sidebar settings.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid var(--danger)",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <AlertCircle size={18} color="var(--danger)" />
                  <span style={{ fontSize: "0.9rem" }}>{error}</span>
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {isLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--bg-glass)",
                      zIndex: 10,
                      backdropFilter: "blur(2px)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--accent-primary)",
                        fontWeight: 600,
                      }}
                    >
                      Fetching live market data...
                    </div>
                  </div>
                )}
                <PriceChart data={data} />
              </div>
            </section>
            <StatsCards data={data} />
          </>
        )}

        {activeTab === "scanner" && <ArbitrageScanner />}
        {activeTab === "route" && <RouteScanner />}

        <footer style={{ marginTop: 'auto', paddingTop: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <p>These tools are not affiliated with Albion Online or Sandbox Interactive GmbH.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
