export default function EventCardSkeleton() {
  return (
    <div
      className="sx-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: 380,
      }}
      aria-hidden="true"
    >
      <div className="sx-skeleton" style={{ height: 200, width: "100%" }} />
      <div style={{ padding: 22, display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
        <div>
          <div className="sx-skeleton" style={{ height: 24, width: "85%", marginBottom: 16 }} />
          <div className="sx-skeleton" style={{ height: 14, width: "50%", marginBottom: 10 }} />
          <div className="sx-skeleton" style={{ height: 14, width: "65%" }} />
        </div>
        <div className="sx-skeleton" style={{ height: 42, width: "100%" }} />
      </div>
    </div>
  );
}
