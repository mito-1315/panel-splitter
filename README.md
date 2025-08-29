## Theme Extractor (HTML -> CSV)

Extracts pairs of Problem Statement ID and Theme from `data.html` and writes them to `themes.csv`.

### Requirements
- Node.js 16+ installed

### Input Files

-`data.html` : To get this file, navigate to "https://sih.gov.in/sih2025PS" -> inspect -> source -> lib -> sih2025PS

- `data.html`: HTML containing repeated table structures where:
  - The `<td>` immediately following a `<th>` with text `Problem Statement ID` contains a number (possibly wrapped in a `<div>` or braces like `{Number : 25001}`).
  - The `<td>` immediately following a `<th>` with text `Theme` contains the theme (e.g., `{Theme : MedTech / BioTech / HealthTech}`).

### Script
- `theme-extract.js`: Parses `data.html`, finds each Problem Statement ID and its corresponding Theme, and generates a CSV.

### Usage
Run from the project root:

```bash
node theme-extract.js
```

This creates `themes.csv` alongside the script.

### Output
- `themes.csv` with headers:
  - `Problem Statement ID`
  - `Theme`

### Assumptions and Parsing Rules
- Looks for `<th>Problem Statement ID</th>` and takes the next `<td>`'s first number as the ID.
- Looks for `<th>Theme</th>` after that, then takes the next `<td>` as the theme text.
- Theme text is cleaned from wrappers like `{Theme : ...}`.

### Troubleshooting
- If `themes.csv` has zero rows:
  - Verify `data.html` exists and contains the expected `<th>` labels exactly (`Problem Statement ID`, `Theme`).
  - Ensure the structure is `<th>...</th><td>...</td>` for both fields.
  - Share a small sample of the differing HTML if adjustments are needed.

# panel-splitter