// src/position.ts
export function positionLabel(pos: number): string {
  switch (pos) {
    case 1:
      return "Right Top";
    case 2:
      return "Right Middle";
    case 3:
      return "Right Bottom";
    case 4:
      return "Middle Bottom";
    case 5:
      return "Left Bottom";
    case 6:
      return "Left Middle";
    case 7:
      return "Left Top";
    default:
      return "Middle Top"; // matches your `else`
  }
}
