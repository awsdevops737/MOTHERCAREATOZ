export default function Header({ page, go, cartCount, user, onSignIn, onLogout }) {
  const links = [
    ["home", "Home"],
    ["catalog", "Catalog"],
    ["best", "Best products"],
    ["offers", "Offers"],
    ["contact", "Contact us"],
  ];

  return (
    <header className="header">
      <button className="brand" onClick={() => go("home")}>
        <span aria-hidden="true">🍼</span> MotherCare
      </button>
      <nav className="nav" aria-label="Main">
        {links.map(([key, label]) => (
          <button key={key} className={page === key ? "nav-link active" : "nav-link"} onClick={() => go(key)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="actions">
        <button className="btn ghost" onClick={() => go("cart")}>
          Cart <span className="count">{cartCount}</span>
        </button>
        {user ? (
          <>
            <button className="btn ghost" onClick={() => go("account")}>{user.name.split(" ")[0]}</button>
            <button className="btn ghost" onClick={onLogout}>Sign out</button>
          </>
        ) : (
          <button className="btn primary" onClick={onSignIn}>Sign in</button>
        )}
      </div>
    </header>
  );
}
