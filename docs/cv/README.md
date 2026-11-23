# CV sources

Two tailored CVs, written as plain HTML so they stay ATS-friendly (single column, real text, standard headings):

| Source | PDF | Length |
|---|---|---|
| `software-engineer.html` | `public/cv/Reem-Basho-CV-Software-Engineer.pdf` | 1 page |
| `research.html` | `public/cv/Reem-Basho-CV-Research.pdf` | 2 pages |

Both share `cv.css`. The software engineer page adds a small `<style>` block to stay on one page.
Every fact comes from `Reem Basho CV - Nov 2026.docx`.

## Rebuild the PDFs

From the project root, in PowerShell:

```powershell
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
& $edge --headless=new --no-pdf-header-footer --print-to-pdf="$PWD\public\cv\Reem-Basho-CV-Software-Engineer.pdf" "$PWD\docs\cv\software-engineer.html"
& $edge --headless=new --no-pdf-header-footer --print-to-pdf="$PWD\public\cv\Reem-Basho-CV-Research.pdf" "$PWD\docs\cv\research.html"
```

After editing, check the page count still matches the table above.
