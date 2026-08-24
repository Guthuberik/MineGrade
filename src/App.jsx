import { useRef, useState } from "react";
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
  const [balance, setBalance] = useState(1000);
  const [selectedItem, setSelectedItem] = useState(items[3]);
  const [targetItem, setTargetItem] = useState(items[5]);

  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const rouletteRef = useRef(null);
  const trackRef = useRef(null);

  const chance = Math.min(
    100,
    (selectedItem.price / targetItem.price) * 100
  );

  const upgrade = () => {
    if (spinning) return;

    if (selectedItem.price > balance) {
      setResult("NOT ENOUGH MONEY");
      return;
    }

    setResult(null);
    setSpinning(true);

    // Определяем результат
    const win = Math.random() * 100 < chance;
    const finalResult = win ? "YES" : "NO";

    // Списываем ставку
    setBalance(
      (prev) => prev - selectedItem.price
    );

    // Берём только индексы нужного результата
    const possibleIndexes = [];

    rouletteResults.forEach(
      (value, index) => {
        if (value === finalResult) {
          possibleIndexes.push(index);
        }
      }
    );

    /*
      Берём результат примерно в середине
      рулетки, чтобы до него было много
      элементов для нормального вращения.
    */

    const targetIndex =
      possibleIndexes[
        Math.floor(
          Math.random() *
            possibleIndexes.length
        )
      ];

    const itemWidth = 150;
    const gap = 12;
    const step = itemWidth + gap;

    const containerWidth =
      rouletteRef.current?.offsetWidth ||
      1000;

    /*
      Центр нужной карточки должен совпасть
      с центром окна.
    */

    const targetPosition =
      targetIndex * step +
      itemWidth / 2 -
      containerWidth / 2;

    /*
      Начинаем всегда с нуля.
    */

    if (trackRef.current) {
      trackRef.current.style.transition =
        "none";

      trackRef.current.style.transform =
        "translate3d(0, 0, 0)";
    }

    /*
      Небольшая задержка нужна браузеру,
      чтобы он успел применить начальную позицию.
    */

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!trackRef.current) return;

        trackRef.current.style.transition =
          "transform 5s cubic-bezier(0.12, 0.7, 0.15, 1)";

        trackRef.current.style.transform =
          `translate3d(${-targetPosition}px, 0, 0)`;
      });
    });

    // Завершаем после анимации
    setTimeout(() => {
      if (win) {
        setBalance(
          (prev) =>
            prev + targetItem.price
        );

        setResult("WIN");
      } else {
        setResult("LOSE");
      }

      setSpinning(false);
    }, 5100);
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
          <p>
            Risk it. Upgrade it. Win it.
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
                (value, index) => (
                  <div
                    className={`roulette-result ${
                      value === "YES"
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
                {selectedItem.icon}
              </div>

              <h2>
                {selectedItem.name}
              </h2>

              <span>
                $
                {selectedItem.price.toLocaleString()}
              </span>

            </div>

            <select
              value={selectedItem.name}
              disabled={spinning}
              onChange={(e) =>
                setSelectedItem(
                  items.find(
                    (item) =>
                      item.name ===
                      e.target.value
                  )
                )
              }
            >
              {items.map((item) => (
                <option
                  key={item.name}
                >
                  {item.name}
                </option>
              ))}
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
                {targetItem.icon}
              </div>

              <h2>
                {targetItem.name}
              </h2>

              <span>
                $
                {targetItem.price.toLocaleString()}
              </span>

            </div>

            <select
              value={targetItem.name}
              disabled={spinning}
              onChange={(e) =>
                setTargetItem(
                  items.find(
                    (item) =>
                      item.name ===
                      e.target.value
                  )
                )
              }
            >
              {items.map((item) => (
                <option
                  key={item.name}
                >
                  {item.name}
                </option>
              ))}
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
              result === "WIN"
                ? "win"
                : "lose"
            }`}
          >
            {result === "WIN"
              ? "🎉 WIN!"
              : result === "LOSE"
              ? "💀 LOSE"
              : result}
          </div>
        )}

        {/* BUTTON */}

        <button
          className="upgrade-button"
          onClick={upgrade}
          disabled={spinning}
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

export default App;import { useRef, useState } from "react";
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

const rouletteResults = [
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
  "NO", "YES", "NO", "NO", "YES",
];

function App() {
  const [balance, setBalance] = useState(1000);
  const [selectedItem, setSelectedItem] = useState(items[3]);
  const [targetItem, setTargetItem] = useState(items[5]);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const rouletteRef = useRef(null);
  const trackRef = useRef(null);

  const chance = Math.min(
    100,
    (selectedItem.price / targetItem.price) * 100
  );

  const upgrade = () => {
    if (spinning) return;

    if (selectedItem.price > balance) {
      setResult("NOT ENOUGH MONEY");
      return;
    }

    setResult(null);
    setSpinning(true);

    // Сначала определяем реальный результат
    const win = Math.random() * 100 < chance;
    const finalResult = win ? "YES" : "NO";

    // Списываем ставку
    setBalance((prev) => prev - selectedItem.price);

    const possibleIndexes = [];

    rouletteResults.forEach((value, index) => {
      if (value === finalResult) {
        possibleIndexes.push(index);
      }
    });

    // Выбираем одну подходящую ячейку ближе к концу
    const targetIndex =
      possibleIndexes[
        Math.floor(Math.random() * possibleIndexes.length)
      ];

    const itemWidth = 150;
    const gap = 12;
    const step = itemWidth + gap;

    const containerWidth =
      rouletteRef.current?.offsetWidth || 1000;

    // Центр выбранной ячейки должен попасть под стрелку
    const targetPosition =
      targetIndex * step +
      itemWidth / 2 -
      containerWidth / 2;

    // Несколько полных оборотов
    const extraTurns = 5;

    const finalPosition =
      targetPosition +
      extraTurns * rouletteResults.length * step;

    const duration = 5000;
    const startTime = performance.now();

    const easeOut = (t) => {
      return 1 - Math.pow(1 - t, 4);
    };

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const eased = easeOut(progress);

      const position =
        finalPosition * eased;

      if (trackRef.current) {
        trackRef.current.style.transform =
          `translate3d(${-position}px, 0, 0)`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Финальная позиция
        if (trackRef.current) {
          trackRef.current.style.transform =
            `translate3d(${-finalPosition}px, 0, 0)`;
        }

        setSpinning(false);

        if (win) {
          setBalance(
            (prev) => prev + targetItem.price
          );

          setResult("WIN");
        } else {
          setResult("LOSE");
        }
      }
    };

    requestAnimationFrame(animate);
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
                (value, index) => (
                  <div
                    className={`roulette-result ${
                      value === "YES"
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
                {selectedItem.icon}
              </div>

              <h2>
                {selectedItem.name}
              </h2>

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
                    (item) =>
                      item.name ===
                      e.target.value
                  )
                )
              }
            >
              {items.map((item) => (
                <option
                  key={item.name}
                >
                  {item.name}
                </option>
              ))}
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
                {targetItem.icon}
              </div>

              <h2>
                {targetItem.name}
              </h2>

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
                    (item) =>
                      item.name ===
                      e.target.value
                  )
                )
              }
            >
              {items.map((item) => (
                <option
                  key={item.name}
                >
                  {item.name}
                </option>
              ))}
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
              ${targetItem.price.toLocaleString()}
            </strong>
          </div>

        </section>

        {/* RESULT */}

        {result && (
          <div
            className={`result ${
              result === "WIN"
                ? "win"
                : "lose"
            }`}
          >
            {result === "WIN"
              ? "🎉 WIN!"
              : result === "LOSE"
              ? "💀 LOSE"
              : result}
          </div>
        )}

        {/* BUTTON */}

        <button
          className="upgrade-button"
          onClick={upgrade}
          disabled={spinning}
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
