import { useEffect, useState } from "react";
import "./App.css";

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn || !data.user?.is_admin) {
          window.location.href = "/";
          return;
        }

        setUser(data.user);
        loadUsers();
      })
      .catch(() => {
        window.location.href = "/";
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch(
        "/api/admin/users",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const giveBalance = async () => {
    if (!selectedUser) {
      setMessage("Выбери пользователя");
      return;
    }

    const value = Number(amount);

    if (!value || value <= 0) {
      setMessage("Введите нормальную сумму");
      return;
    }

    try {
      const res = await fetch(
        "/api/admin/balance",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            steamId:
              selectedUser.steam_id,
            amount: value,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error ||
            "Ошибка"
        );
        return;
      }

      setMessage(
        `Выдано $${value.toLocaleString()}`
      );

      setAmount("");

      await loadUsers();

      const updated =
        data.user;

      if (updated) {
        setSelectedUser(updated);
      }

    } catch (error) {
      console.error(error);
      setMessage("Ошибка сервера");
    }
  };

  if (loading) {
    return (
      <div className="app">
        <main>
          <h1>LOADING...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="app">

      <header>

        <div className="logo">
          ⛏ <span>Mine</span>Grade
        </div>

        <button
          className="admin-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← НА САЙТ
        </button>

      </header>

      <main>

        <div className="title">
          <h1>ADMIN PANEL</h1>

          <p>
            Управление MineGrade
          </p>
        </div>

        <section className="admin-panel">

          <h2>
            👥 USERS
          </h2>

          <div className="admin-users">

            {users.length === 0 ? (
              <p>
                Пользователей пока нет
              </p>
            ) : (
              users.map((item) => (
                <button
                  key={item.id}
                  className={`admin-user ${
                    selectedUser?.id ===
                    item.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedUser(
                      item
                    );
                    setMessage("");
                  }}
                >

                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      className="steam-avatar"
                    />
                  ) : (
                    <div className="steam-avatar-placeholder">
                      👤
                    </div>
                  )}

                  <div>

                    <strong>
                      {item.steam_name}
                    </strong>

                    <span>
                      ID:{" "}
                      {item.steam_id}
                    </span>

                    <span>
                      💰 $
                      {Number(
                        item.balance
                      ).toLocaleString()}
                    </span>

                  </div>

                </button>
              ))
            )}

          </div>

        </section>

        {selectedUser && (
          <section className="admin-panel">

            <h2>
              💰 GIVE BALANCE
            </h2>

            <div className="selected-user">

              {selectedUser.avatar && (
                <img
                  src={
                    selectedUser.avatar
                  }
                  className="steam-avatar-large"
                />
              )}

              <div>
                <strong>
                  {
                    selectedUser.steam_name
                  }
                </strong>

                <span>
                  Баланс: $
                  {Number(
                    selectedUser.balance
                  ).toLocaleString()}
                </span>
              </div>

            </div>

            <div className="balance-form">

              <input
                type="number"
                placeholder="Сколько выдать?"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
              />

              <button
                className="upgrade-button"
                onClick={
                  giveBalance
                }
              >
                💰 ВЫДАТЬ
              </button>

            </div>

            {message && (
              <div className="admin-message">
                {message}
              </div>
            )}

          </section>
        )}

      </main>

      <footer>
        MineGrade Admin Panel
      </footer>

    </div>
  );
}

export default Admin;
