import {
  useEffect,
  useRef,
  useState,
} from "react";

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

const baseRoulette = [
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
];

const rouletteResults = Array(10)
  .fill(baseRoulette)
  .flat();

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [balance, setBalance] = useState(1000);

  const [selectedItem, setSelectedItem] =
    useState(items[3]);

  const [targetItem, setTargetItem] =
    useState(items[5]);

  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const rouletteRef = useRef(null);
  const trackRef = useRef(null);

  // =========================
  // AUTH
  // =========================

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();

        console.log(
          "AUTH RESPONSE:",
          data
        );

        if (data.loggedIn) {
          setUser(data.user);

          // Берём баланс из базы
          setBalance(
            Number(data.user.balance)
          );
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error(
          "AUTH ERROR:",
          error
        );
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // =========================
  // CHANCE
  // =========================

  const chance = Math.min(
    100,
    (selectedItem.price /
      targetItem.price) *
      100
  );

  // =========================
  // UPGRADE
  // =========================

  const upgrade = () => {
    if (spinning) return;

    if (
      selectedItem.price >
      balance
    ) {
      setResult(
        "NOT ENOUGH MONEY"
      );

      return;
    }

    setResult(null);
    setSpinning(true);

    const win =
      Math.random() * 100 <
      chance;

    const finalResult = win
      ? "YES"
      : "NO";

    // Списываем ставку
    setBalance(
      (prev) =>
        prev -
        selectedItem.price
    );

    const possibleIndexes = [];

    rouletteResults.forEach(
      (value, index) => {
        if (
          value ===
          finalResult
        ) {
          possibleIndexes.push(
            index
          );
        }
      }
    );

    const targetIndex =
      possibleIndexes[
        Math.floor(
          Math.random() *
            possibleIndexes.length
        )
      ];

    const itemWidth = 150;
    const gap = 12;
    const step =
      itemWidth + gap;

    const containerWidth =
      rouletteRef.current
        ?.offsetWidth || 1000;

    const targetPosition =
      targetIndex * step +
      itemWidth / 2 -
      containerWidth / 2;

    // Начальная позиция
    if (trackRef.current) {
      trackRef.current.style.transition =
        "none";

      trackRef.current.style.transform =
        "translate3d(0, 0, 0)";
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (
          !trackRef.current
        ) {
          return;
        }

        trackRef.current.style.transition =
          "transform 5s cubic-bezier(0.12, 0.7, 0.15, 1)";

        trackRef.current.style.transform =
          `translate3d(${-targetPosition}px, 0, 0)`;
      });
    });

    // Конец вращения
    setTimeout(() => {
      if (win) {
        setBalance(
          (prev) =>
            prev +
            targetItem.price
        );

        setResult("WIN");
      } else {
        setResult("LOSE");
      }

      setSpinning(false);
    }, 5100);
  };

  // =========================
  // HEADER
  // =========================

  const renderHeader = () => {
    if (authLoading) {
      return (
        <div className="header-right">
          <span className="auth-loading">
            LOADING...
          </span>
        </div>
      );
    }

    // Не авторизован
    if (!user) {
      return (
        <div className="header-right">
          <a
            className="steam-login"
            href="/api/auth/steam"
          >
            🎮 ВОЙТИ ЧЕРЕЗ STEAM
          </a>
        </div>
      );
    }

    // Авторизован
    return (
      <div className="header-right">

        <div className="steam-user">

          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Steam avatar"
              className="steam-avatar"
            />
          ) : (
            <div className="steam-avatar-placeholder">
              👤
            </div>
          )}

          <div className="steam-user-info">

            <strong>
              {user.steam_name}
            </strong>

            <span>
              💰 $
              {Number(
                balance
              ).toLocaleString()}
            </span>

          </div>

        </div>

        {user.is_admin && (
          <button
            className="admin-button"
            onClick={() => {
              window.location.href =
                "/admin";
            }}
          >
            ⚙ ADMIN
          </button>
        )}

      </div>
    );
  };

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="app">

      <header>

        <div className="logo">
          ⛏{" "}
          <span>Mine</span>
          Grade
        </div>

        {renderHeader()}

      </header>

      <main>

        <div className="title">

          <h1>
            UPGRADER
          </h1>

          <p>
            Risk it. Upgrade it.
            Win it.
          </p>

        </div>

        {/* =========================
            ROULETTE
        ========================== */}

        <section
          className="roulette"
          ref={rouletteRef}
        >

          <div className="pointer">
            ▼
          </div>

          <div className="roulette-window">

            <div
              className="roulette-track"
              ref={trackRef}
            >

              {rouletteResults.map(
                (
                  value,
                  index
                ) => (
                  <div
                    className={`roulette-result ${
                      value ===
                      "YES"
                        ? "yes"
                        : "no"
                    }`}
                    key={index}
                  >
                    {value}
                  </div>
                )
              )}

            </div>

          </div>

        </section>

        {/* =========================
            ITEMS
        ========================== */}

        <section className="upgrade-panel">

          <div className="item-section">

            <span className="label">
              YOUR ITEM
            </span>

            <div className="item-card">

              <div className="item-icon">
                {
                  selectedItem.icon
                }
              </div>

              <h2>
                {
                  selectedItem.name
                }
              </h2>

              <span>
                $
                {selectedItem.price.toLocaleString()}
              </span>

            </div>

            <select
              value={
                selectedItem.name
              }
              disabled={
                spinning
              }
              onChange={(e) => {
                const item =
                  items.find(
                    (item) =>
                      item.name ===
                      e.target.value
                  );

                setSelectedItem(
                  item
                );
              }}
            >

              {items.map(
                (item) => (
                  <option
                    key={
                      item.name
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                )
              )}

            </select>

          </div>

          <div className="arrow">
            →
          </div>

          <div className="item-section">

            <span className="label">
              TARGET
            </span>

            <div className="item-card target">

              <div className="item-icon">
                {
                  targetItem.icon
                }
              </div>

              <h2>
                {
                  targetItem.name
                }
              </h2>

              <span>
                $
                {targetItem.price.toLocaleString()}
              </span>

            </div>

            <select
              value={
                targetItem.name
              }
              disabled={
                spinning
              }
              onChange={(e) => {
                const item =
                  items.find(
                    (item) =>
                      item.name ===
                      e.target.value
                  );

                setTargetItem(
                  item
                );
              }}
            >

              {items.map(
                (item) => (
                  <option
                    key={
                      item.name
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                )
              )}

            </select>

          </div>

        </section>

        {/* =========================
            STATS
        ========================== */}

        <section className="chance-panel">

          <div>

            <span>
              UPGRADE CHANCE
            </span>

            <strong>
              {chance.toFixed(1)}%
            </strong>

          </div>

          <div>

            <span>
              POTENTIAL WIN
            </span>

            <strong>
              $
              {targetItem.price.toLocaleString()}
            </strong>

          </div>

        </section>

        {/* =========================
            RESULT
        ========================== */}

        {result && (
          <div
            className={`result ${
              result ===
              "WIN"
                ? "win"
                : "lose"
            }`}
          >

            {result ===
            "WIN"
              ? "🎉 WIN!"
              : result ===
                "LOSE"
              ? "💀 LOSE"
              : result}

          </div>
        )}

        {/* =========================
            BUTTON
        ========================== */}

        <button
          className="upgrade-button"
          onClick={upgrade}
          disabled={
            spinning
          }
        >
          {spinning
            ? "⚡ SPINNING..."
            : "⚡ UPGRADE"}
        </button>

      </main>

      <footer>
        MineGrade © 2026 · Minecraft Upgrade Simulator
      </footer>

    </div>
  );
}

export default App;
