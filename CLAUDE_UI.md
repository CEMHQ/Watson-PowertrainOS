# CLAUDE_UI.md

UI pattern reference for Watson PowertrainOS. All UI is built with Tailwind CSS v3 utility classes and lucide-react icons. No MUI, no Emotion, no FontAwesome.

---

## Page Layout Pattern

Every dashboard page follows the same structure:

```tsx
<div className="p-6 space-y-6">
  {/* 1. Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Page Title</h1>
      <p className="text-sm text-muted-foreground mt-0.5">Subtitle / description</p>
    </div>
    {/* Optional CTA */}
    <Link href="/page/new" className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
      <Plus className="h-4 w-4" />
      Action
    </Link>
  </div>

  {/* 2. Summary cards (if applicable) */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {/* see Card Pattern below */}
  </div>

  {/* 3. Filters (if list page) */}
  {/* see Filter Pattern below */}

  {/* 4. Content table or grid */}
  {/* see Table Pattern and Empty State below */}
</div>
```

---

## Card Pattern

### Stat card (used in dashboard + compliance + safety)
```tsx
<div className="rounded-lg border border-border bg-card p-4">
  <div className="flex items-center gap-3">
    <div className={cn('rounded-md p-2', stat.bg)}>
      <Icon className={cn('h-4 w-4', stat.color)} />
    </div>
    <div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
</div>
```

Icon background + color pairs:
| Meaning | bg | color |
|---|---|---|
| Critical / danger | `bg-red-50 dark:bg-red-950/50` | `text-red-600 dark:text-red-400` |
| Warning / attention | `bg-amber-50 dark:bg-amber-950/50` | `text-amber-600 dark:text-amber-400` |
| Info / neutral | `bg-blue-50 dark:bg-blue-950/50` | `text-blue-600 dark:text-blue-400` |
| Good / success | `bg-green-50 dark:bg-green-950/50` | `text-green-600 dark:text-green-400` |
| Primary | `bg-primary/10` | `text-primary` |

### Data card (watson-card pattern)
```tsx
<div className="watson-card p-4">...</div>
```
Defined in `globals.css` — white bg, subtle shadow, lifts `-translate-y-1` with hover blue bg.

---

## Badge / Status Chip Pattern

```tsx
<span className={cn(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
  severityClass
)}>
  Label
</span>
```

### Reusable utility classes (from `globals.css`)
| Class | Use |
|---|---|
| `severity-critical` | DOT critical, fatality/major incidents, expired docs |
| `severity-warning` | DOT warning, moderate incidents, expiring soon |
| `severity-good` | Good/resolved/valid status |

Manual color classes for other statuses:
```
Info/investigating: bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900
Muted/neutral:      bg-muted/30 text-muted-foreground border-border
```

---

## Table Pattern

```tsx
<div className="rounded-lg border border-border overflow-hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-muted/30">
        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Column</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      {rows.map((row) => (
        <tr key={row.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3 text-foreground">{row.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Empty State Pattern

Used inside a table container or standalone:

```tsx
<div className="py-16 flex flex-col items-center gap-3 text-center">
  <div className="rounded-full bg-muted p-3">
    <SomeIcon className="h-6 w-6 text-muted-foreground" />
  </div>
  <div>
    <p className="text-sm font-medium text-foreground">Nothing found</p>
    <p className="text-xs text-muted-foreground mt-1">Descriptive sub-text or call to action</p>
  </div>
  <Link href="/page/new" className="...">Create first item</Link>
</div>
```

---

## Filter Bar Pattern (Server Component, GET form)

```tsx
<form method="GET" className="flex flex-wrap gap-3 items-center">
  <select name="fieldName" defaultValue={searchParams.fieldName ?? ''} className={inputClass}>
    <option value="">All Values</option>
    <option value="x">X Label</option>
  </select>

  <button type="submit" className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors">
    Filter
  </button>

  {hasActiveFilters && (
    <Link href="/page" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
      Clear
    </Link>
  )}
</form>
```

---

## Form Input Pattern

### Standard input
```tsx
<input
  type="text"
  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full"
/>
```

### With leading icon
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <input className="rounded-md border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full" />
</div>
```

### Select
```tsx
<select className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
  <option value="">Placeholder</option>
</select>
```

### Textarea
```tsx
<textarea
  rows={4}
  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none w-full"
/>
```

### Submit button
```tsx
<button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
  Save
</button>
```

### Label
```tsx
<label className="block text-xs font-medium text-muted-foreground mb-1.5">
  Field Label
</label>
```

---

## Form Error / Success Message Pattern

```tsx
{error && (
  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 dark:text-red-400 dark:bg-red-950 dark:border-red-900">
    {error}
  </p>
)}

{success && (
  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 dark:text-green-400 dark:bg-green-950 dark:border-green-900">
    {success}
  </p>
)}
```

---

## Page Section Header (within a page)

```tsx
<div className="border-b border-border pb-4">
  <h2 className="text-base font-semibold text-foreground">Section Title</h2>
  <p className="text-sm text-muted-foreground mt-0.5">Optional description</p>
</div>
```

---

## Icon Conventions

- **Library**: `lucide-react` only — do NOT use FontAwesome or @tabler/icons-react in UI components
- **Size in nav**: `h-4 w-4`
- **Size in stat cards**: `h-4 w-4`
- **Size in buttons**: `h-4 w-4`
- **Size in empty states**: `h-6 w-6`
- **Size in headings**: `h-5 w-5`

Common icon mappings:
| Concept | Icon |
|---|---|
| Dashboard overview | `LayoutDashboard` |
| Workforce / employees | `Users` |
| DOT Compliance | `Shield` |
| Safety / incidents | `AlertTriangle` |
| Hiring / ATS | `Briefcase` |
| AI assistant | `Brain` |
| Settings | `Settings` |
| Sign out | `LogOut` |
| Add / create | `Plus` |
| Search | `Search` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Warning | `AlertCircle` |
| Critical alert | `ShieldAlert` |
| Good / check | `CheckCircle2` |
| Time / pending | `Clock` |
| Document | `FileText` |
| Vehicle / truck | `Truck` |
| Driver risk | `TrendingDown` |
| Loading | `Loader2` (with `animate-spin`) |

---

## Color Tokens Reference

Always use Tailwind token classes. Never hardcode hex values.

| Token | Class | Value |
|---|---|---|
| Primary brand blue | `bg-primary` / `text-primary` | `#2e4593` |
| Dark navy (sidebar) | `bg-sidebar` | `#1f3471` |
| Card hover | `bg-accent` / `bg-watson-hover` | `#e0ebff` |
| Page background | `bg-watson-bg` | `#f4f4f4` |
| Gradient | `.watson-gradient` class | `#1f3471 → #3b82f6` |

DOT severity colors — always use the utility classes from `globals.css`:
- `.severity-critical` — red tones, light + dark mode
- `.severity-warning` — amber tones, light + dark mode
- `.severity-good` — green tones, light + dark mode

---

## Watson Brand Gradient

Used on hero sections, login page header, career hub:
```tsx
<div className="watson-gradient text-white px-8 py-10">...</div>
```

CSS: `linear-gradient(to right, hsl(var(--watson-blue-dark)), hsl(var(--watson-blue-light)))`
