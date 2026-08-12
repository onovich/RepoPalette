# RepoPalette gallery

[Back to README](../README.md)

Every preview below uses the same language data. Names and percentages remain exact; only the layout and theme change.

## Layouts

- `bars` is the most direct ranking view.
- `orbit` gives each language its own radial track; it is not a pie or donut chart.
- `constellation` maps language share to node area and keeps exact values in the legend.

| `bars` · `light` | `bars` · `paper` |
| --- | --- |
| ![Bars with light theme](gallery/bars-light.svg) | ![Bars with paper theme](gallery/bars-paper.svg) |

| `orbit` · `aurora` | `orbit` · `terminal` |
| --- | --- |
| ![Orbit with aurora theme](gallery/orbit-aurora.svg) | ![Orbit with terminal theme](gallery/orbit-terminal.svg) |

| `constellation` · `midnight` | `constellation` · `neon` |
| --- | --- |
| ![Constellation with midnight theme](gallery/constellation-midnight.svg) | ![Constellation with neon theme](gallery/constellation-neon.svg) |

## Choose a combination

All layouts work with all themes. Set the two Action inputs independently:

```yaml
with:
  style: constellation
  theme: midnight
```

Available themes: `light`, `paper`, `midnight`, `aurora`, `terminal`, and `neon`.
