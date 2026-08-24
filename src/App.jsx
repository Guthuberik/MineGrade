import { useEffect, useRef, useState } from "react";
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

  const [page, setPage] = useState(
    window.location.pathname === "/admin"
      ? "admin"
      : "home"
  );

  const [balance, setBalance] = useState(1000);

  const [selectedItem, setSelectedItem] =
    useState(items[3]);

  const [targetItem, setTargetItem] =
    useState(items[5]);

  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const rouletteRef = useRef(null);
  const trackRef = useRef(null);

  // ==========================================
  // AUTH
  // ==========================================

  const loadUser = async () => {
    try {
      setAuthLoading(true);

      const response = await fetch(
        "/api/auth/me",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("AUTH:", data);

      if (data.loggedIn && data.user) {
        setUser(data.user);
        setBalance(
          Number(data.user.balance) || 0
        );
      } else {
        setUser(null);
        setBalance(0);

        // Если мы на админке, но не авторизованы
        if (
          window.location.pathname === "/admin"
        ) {
          window.history.replaceState(
            {},
            "",
            "/"
          );

          setPage("home");
        }
      }
    } catch (error) {
      console.error(
        "AUTH ERROR:",
        error
      );

      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const goHome = () => {
    window.history.pushState(
      {},
      "",
      "/"
    );

    setPage("home");
  };

  const goAdmin = () => {
    if (!user?.is_admin) {
      return;
    }

    window.history.pushState(
      {},
      "",
      "/admin"
    );

    setPage("admin");
  };

  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname === "/admin"
      ) {
        setPage("admin");
      } else {
        setPage("home");
      }
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  // ==========================================
  // ADMIN PAGE
  // ==========================================

  if (
    !authLoading &&
    page === "admin"
  ) {
    if (!user) {
      window.history.replaceState(
        {},
        "",
        "/"
      );

      return (
        <div className="app">
          <main>
            <div className="title">
              <h1>AUTHORIZATION REQUIRED</h1>

              <p>
                Please login through Steam.
              </p>

              <a
                className="steam-login"
                href="/api/auth/steam"
              >
                🎮 ВОЙТИ ЧЕРЕЗ STEAM
              </a>
            </div>
          </main>
        </div>
      );
    }

    if (!user.is_admin) {
      return (
        <div className="app">
          <header>
            <div className="logo">
              ⛏ <span>Mine</span>Grade
            </div>
          </header>

          <main>
            <div className="title">
              <h1>ACCESS DENIED</h1>

              <p>
                У тебя нет доступа к
                админ-панели.
              </p>

              <button
                className="upgrade-button"
                onClick={goHome}
              >
                ← BACK TO MINEGRADE
              </button>
            </div>
          </main>
        </div>
      );
    }

    return (
      <AdminPage
        user={user}
        goHome={goHome}
      />
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (authLoading) {
    return (
      <div className="app">
        <header>
          <div className="logo">
            ⛏ <span>Mine</span>Grade
          </div>
        </header>

        <main>
          <div className="title">
            <h1>LOADING...</h1>
            <p>
              Checking Steam
              authorization
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // UPGRADE CHANCE
  // ==========================================

  const chance = Math.min(
    100,
    (selectedItem.price /
      targetItem.price) *
      100
  );

  // ==========================================
  // UPGRADE
  // ==========================================

  const upgrade = () => {
    if (
      spinning ||
      !user
    ) {
      return;
    }

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

    const finalResult =
      win ? "YES" : "NO";

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
      targetIndex *
        step +
      itemWidth / 2 -
      containerWidth / 2;

    if (trackRef.current) {
      trackRef.current.style.transition =
        "none";

      trackRef.current.style.transform =
        "translate3d(0,0,0)";
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
          `translate3d(${-targetPosition}px,0,0)`;
      });
    });

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

  // ==========================================
  // HEADER
  // ==========================================

  const renderHeader = () => {
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
            onClick={goAdmin}
          >
            ⚙ ADMIN
          </button>
        )}

      </div>
    );
  };

  // ==========================================
  // HOME
  // ==========================================

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

        {/* ROULETTE */}

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

        {/* ITEMS */}

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

        {/* STATS */}

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

        {/* RESULT */}

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

        {/* BUTTON */}

        <button
          className="upgrade-button"
          onClick={upgrade}
          disabled={
            spinning ||
            !user
          }
        >
          {!user
            ? "🎮 LOGIN TO PLAY"
            : spinning
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

// ==========================================
// ADMIN PAGE
// ==========================================

function AdminPage({
  user,
  goHome,
}) {
  const [steamId, setSteamId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const giveBalance = async () => {
    setMessage("");

    if (!steamId.trim()) {
      setMessage(
        "❌ Введи Steam ID"
      );

      return;
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      setMessage(
        "❌ Введи корректную сумму"
      );

      return;
    }

    if (
      !/^\d{17}$/.test(
        steamId.trim()
      )
    ) {
      setMessage(
        "❌ Steam ID должен состоять из 17 цифр"
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/balance",
          {
            method: "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              targetSteamId:
                steamId.trim(),

              amount:
                numericAmount,
            }),
          }
        );

      const text =
        await response.text();

      let data;

      try {
        data =
          JSON.parse(text);
      } catch {
        console.error(
          "SERVER RESPONSE:",
          text
        );

        setMessage(
          `❌ Сервер вернул ошибку ${response.status}`
        );

        return;
      }

      if (!response.ok) {
        setMessage(
          `❌ ${
            data.error ||
            "Ошибка сервера"
          }`
        );

        return;
      }

      setMessage(
        `✅ Баланс ${
          data.user.steam_name
        } изменён. Новый баланс: $${Number(
          data.user.balance
        ).toLocaleString()}`
      );

      setAmount("");

    } catch (error) {
      console.error(
        "ADMIN ERROR:",
        error
      );

      setMessage(
        "❌ Не удалось связаться с сервером"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      <header>

        <div className="logo">
          ⛏{" "}
          <span>Mine</span>
          Grade
        </div>

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
                🛡 ADMIN
              </span>

            </div>

          </div>

          <button
            className="admin-button"
            onClick={goHome}
          >
            ← BACK
          </button>

        </div>

      </header>

      <main>

        <div className="title">

          <h1>
            ADMIN PANEL
          </h1>

          <p>
            MineGrade administration
          </p>

        </div>

        <section className="admin-panel">

          <div className="admin-card">

            <span className="label">
              TARGET STEAM ID
            </span>

            <input
              className="admin-input"
              type="text"
              inputMode="numeric"
              placeholder="7656119XXXXXXXXXX"
              value={steamId}
              onChange={(e) =>
                setSteamId(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />

          </div>

          <div className="admin-card">

            <span className="label">
              BALANCE TO GIVE
            </span>

            <input
              className="admin-input"
              type="number"
              min="1"
              step="1"
              placeholder="1000"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
            />

          </div>

          <button
            className="upgrade-button"
            onClick={
              giveBalance
            }
            disabled={
              loading
            }
          >
            {loading
              ? "⚡ PROCESSING..."
              : "💰 GIVE BALANCE"}
          </button>

          {message && (
            <div className="admin-message">
              {message}
            </div>
          )}

        </section>

      </main>

      <footer>
        MineGrade © 2026 · Administration
      </footer>

    </div>
  );
}

export default App;
