import { useState } from "react";
import "./App.css";

const items = [
  { name: "Oak Log", icon: "🪵", price: 10 },
  { name: "Cobblestone", icon: "🪨", price: 25 },
  { name: "Coal", icon: "⚫", price: 50 },
  { name: "Iron Ingot", icon: "🔩", price: 100 },
  { name: "Gold Ingot", icon: "🟡", price: 250 },
  { name: "Diamond", icon: "💎", price: 1000 },
  { name: "Emerald", icon: "🟢", price: 2500 },
  { name: "Netherite Ingot", icon: "⬛", price: 10000 },
];

function App() {
  const [balance, setBalance] = useState(1000);
  const [selectedItem, setSelectedItem] = useState(items[3]);
  const [targetItem, setTargetItem] = useState(items[5]);

  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const chance = Math.min(
    100,
    (selectedItem.price / targetItem.price) * 100
  );

  const rouletteItems = [
    items[0],
    items[2],
    items[3],
    items[5],
    items[1],
    items[4],
    items[5],
    items[2],
    items[6],
    items[3],
    items[5],
    items[0],
    items[4],
    items[5],
    items[7],
    items[2],
    items[5],
    items[1],
    items[3],
    items[6],
    items[5],
    items[0],
    items[4],
    items[5],
    items[2],
    items[7],
  ];

  const upgrade = () => {
    if (spinning) return;

    if (selectedItem.price > balance) {
      setResult("NOT ENOUGH MONEY");
      return;
    }

    setResult(null);
    setSpinning(true);

    const win = Math.random() * 100 < chance;

    setBalance((prev) => prev - selectedItem.price);

    setTimeout(() => {
      if (win) {
        setBalance((prev) => prev + targetItem.price);
        setResult("WIN");
      } else {
        setResult("LOSE");
      }

      setSpinning(false);
    }, 4500);
  };

  return (
    <div className="app">
      <header>
        <div className="logo">
          ⛏ <span>Mine</span>Grade
        </div>

        <div className="balance">
          💰 ${balance.toLocaleString()}
        </div>
      </header>

      <main>
        <div className="title">
          <h1>UPGRADER</h1>
          <p>Risk it. Upgrade it. Win it.</p>
        </div>

        {/* ROULETTE */}

<section className={`roulette ${spinning ? "spinning" : ""}`}>
  <div className="pointer">▼</div>

  <div className="roulette-window">
    <div className="roulette-track">
      {[
        "NO",
        "YES",
        "NO",
        "NO",
        "YES",
        "NO",
        "YES",
        "NO",
        "NO",
        "YES",
        "NO",
        "YES",
        "NO",
        "NO",
        "YES",
        "NO",
        "YES",
        "NO",
        "NO",
        "YES",
        "NO",
        "YES",
        "NO",
        "NO",
        "YES",
        "NO",
        "YES",
        "NO",
        "NO",
        "YES",
      ].map((result, index) => (
        <div
          className={`roulette-result ${
            result === "YES" ? "yes" : "no"
          }`}
          key={index}
        >
          {result}
        </div>
      ))}
    </div>
  </div>

  <div className="roulette-pointer-bottom">▲</div>
</section>

        {/* ITEMS */}

        <section className="upgrade-panel">
          <div className="item-section">
            <span className="label">YOUR ITEM</span>

            <div className="item-card">
              <div className="item-icon">{selectedItem.icon}</div>

              <h2>{selectedItem.name}</h2>

              <span>
                ${selectedItem.price.toLocaleString()}
              </span>
            </div>

            <select
              value={selectedItem.name}
              disabled={spinning}
              onChange={(e) =>
                setSelectedItem(
                  items.find(
                    (item) => item.name === e.target.value
                  )
                )
              }
            >
              {items.map((item) => (
                <option key={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="arrow">→</div>

          <div className="item-section">
            <span className="label">TARGET</span>

            <div className="item-card target">
              <div className="item-icon">{targetItem.icon}</div>

              <h2>{targetItem.name}</h2>

              <span>
                ${targetItem.price.toLocaleString()}
              </span>
            </div>

            <select
              value={targetItem.name}
              disabled={spinning}
              onChange={(e) =>
                setTargetItem(
                  items.find(
                    (item) => item.name === e.target.value
                  )
                )
              }
            >
              {items.map((item) => (
                <option key={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* STATS */}

        <section className="chance-panel">
          <div>
            <span>UPGRADE CHANCE</span>
            <strong>{chance.toFixed(1)}%</strong>
          </div>

          <div>
            <span>POTENTIAL WIN</span>
            <strong>
              ${targetItem.price.toLocaleString()}
            </strong>
          </div>
        </section>

        {result && (
          <div
            className={`result ${
              result === "WIN" ? "win" : "lose"
            }`}
          >
            {result === "WIN" ? "🎉 WIN!" : "💀 LOSE"}
          </div>
        )}

        <button
          className="upgrade-button"
          onClick={upgrade}
          disabled={spinning}
        >
          {spinning ? "⚡ SPINNING..." : "⚡ UPGRADE"}
        </button>
      </main>

      <footer>
        MineGrade © 2026 · Minecraft Upgrade Simulator
      </footer>
    </div>
  );
}

export default App;
