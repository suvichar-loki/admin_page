/* eslint-disable @typescript-eslint/no-explicit-any */

export function LayoutV2Editor({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const update = (path: string[], val: any) => {
    const copy = structuredClone(value);
    let ref = copy;

    for (let i = 0; i < path.length - 1; i++) {
      ref = ref[path[i]];
    }

    ref[path[path.length - 1]] = val;
    onChange(copy);
  };

  return (
    <div className="layout-editor">
      <h3>Canvas Layout (V2)</h3>

      <fieldset>
        <legend>Profile Layer</legend>

        <label>
          X:
          <input
            type="number"
            value={value.profile_layer.x}
            onChange={(e) =>
              update(["profile_layer", "x"], +e.target.value)
            }
          />
        </label>

        <label>
          Y:
          <input
            type="number"
            value={value.profile_layer.y}
            onChange={(e) =>
              update(["profile_layer", "y"], +e.target.value)
            }
          />
        </label>
      </fieldset>
    </div>
  );
}

export function AnimationEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: any[];
  onChange: (v: any[]) => void;
}) {
//   const update = (i: number, patch: any) => {
//     const copy = structuredClone(value);
//     copy[i] = { ...copy[i], ...patch };
//     onChange(copy);
//   };

  const add = () => {
    onChange([
      ...value,
      {
        start_time: 0,
        duration: 1,
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 },
        opacity: { from: 1, to: 1 },
        easing: "linear",
      },
    ]);
  };

  const remove = (i: number) => {
    const copy = [...value];
    copy.splice(i, 1);
    onChange(copy);
  };

  return (
    <fieldset style={{ marginTop: 16 }}>
      <legend>{title}</legend>

      {value.map((a, i) => (
        <div key={i}>
          <strong>Animation #{i + 1}</strong>

          <button type="button" onClick={() => remove(i)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={add}>
        + Add Animation
      </button>
    </fieldset>
  );
}
