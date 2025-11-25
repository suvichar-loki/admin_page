// src/components/PositionGuide.tsx
export function PositionGuide() {
  const cells = [
    { pos: 7, label: "7\n(Left Top)" },
    { pos: 8, label: "8\n(Middle Top)" },
    { pos: 1, label: "1\n(Right Top)" },
    { pos: 6, label: "6\n(Left Middle)" },
    { pos: 0, label: "" }, // center (not used)
    { pos: 2, label: "2\n(Right Middle)" },
    { pos: 5, label: "5\n(Left Bottom)" },
    { pos: 4, label: "4\n(Middle Bottom)" },
    { pos: 3, label: "3\n(Right Bottom)" },
  ];
  return (
    <div>
      <h3>Position Guide</h3>
      <div className="position-grid">
        {cells.map((c, idx) => (
          <div key={idx} className="position-cell">
            {c.label && (
              <>
                <div>{c.pos}</div>
                <small>{c.label.split("\n")[1]}</small>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
