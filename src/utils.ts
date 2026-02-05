/* eslint-disable @typescript-eslint/no-explicit-any */



export function convertLayoutToCenter(layout: any) {
  const size = layout.profile_layer.size;
  const size2 = layout.name_layer.text_size;

  return {
    ...layout,
    profile_layer: {
      ...layout.profile_layer,
      x: Math.round(layout.profile_layer.x + size / 2),
      y: Math.round(layout.profile_layer.y + size / 2)
    },
    name_layer: {
      ...layout.name_layer,
      y: Math.round(layout.name_layer.y + size2)
    },
  };
}

export function reverseLayoutToCenter(layout: any) {
  const size = layout.profile_layer.size;
  const size2 = layout.name_layer.text_size;

  return {
    ...layout,
    profile_layer: {
      ...layout.profile_layer,
      x: Math.round(layout.profile_layer.x - size / 2),
      y: Math.round(layout.profile_layer.y - size / 2)
    },
    name_layer: {
      ...layout.name_layer,
      y: Math.round(layout.name_layer.y - size2)
    },
  };
}
