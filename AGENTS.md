# AGENTS.md — RunwayBriefing (FIDS)

> Instrukcje dla agentów AI pracujących nad tym projektem.

---

## Code Style

1. **TypeScript strict mode** — każdy plik musi przechodzić `tsc --noEmit` bez błędów. Nie używaj `any`; preferuj jawne typy i interfejsy zdefiniowane w `types/index.ts`.
2. **Importy z aliasem `@/`** — wszystkie importy wewnętrzne używają aliasu `@/*` (np. `@/types`, `@/lib/utils`). Nigdy nie stosuj ścieżek relatywnych wychodzących wyżej niż jeden poziom (`../`).
3. **Nazewnictwo plików** — komponenty React: `PascalCase.tsx`. Pliki narzędziowe/lib: `camelCase.ts`. Katalogi: `kebab-case` lub `camelCase` zgodnie z konwencją Next.js App Router.
4. **Tailwind CSS z utility `cn()`** — stylowanie wyłącznie przez klasy Tailwind. Do warunkowego łączenia klas używaj helpera `cn()` z `@/lib/utils` (opartego na `clsx` + `tailwind-merge`). Nie stosuj inline `style`.
5. **Komponenty funkcyjne z `'use client'` tylko gdy potrzebne** — domyślnie komponenty są Server Components. Dyrektywa `'use client'` dodawana wyłącznie gdy komponent korzysta z hooków React, event handlerów lub Zustand store.
6. **Zustand jako jedyny state management** — globalny stan aplikacji trzymany w `store/flightsStore.ts`. Nie wprowadzaj Context API ani Reduxa. Selektory piszemy z `useShallow` aby unikać niepotrzebnych re-renderów.
7. **Eksporty nazwane (named exports)** — nie stosuj `export default` w komponentach i utilsach. Jedyny wyjątek to pliki wymagane przez Next.js (layout, page, route handlers).

---

## Project Structure

| Katalog       | Opis                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `app/`        | Next.js App Router — strony, layouty, API routes. Każdy `page.tsx` to Server Component pobierający dane. |
| `app/api/`    | REST API – endpointy CRUD dla lotów. Pełna lista poniżej.                                                |
| `components/` | Komponenty UI pogrupowane domenowo: `fids/` (tablica lotów), `admin/` (panel edycji).                    |
| `data/`       | Pliki JSON — `flights.json` (źródło bieżących danych), `flights.seed.json` (dane startowe do resetu).    |
| `lib/`        | Logika biznesowa i utility — operacje na plikach lotów (`flights.ts`), helper `cn()` (`utils.ts`).       |
| `store/`      | Zustand store — stan kliencki, filtry, akcje CRUD na lotach.                                             |
| `types/`      | Współdzielone typy TypeScript — `Flight`, `FlightStatus`, `Airline`, `Terminal` + stałe.                 |

### API Endpoints

| Metoda   | Ścieżka                                             | Opis                                                                |
| -------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `GET`    | `/api/flights`                                      | Lista wszystkich lotów (z przeliczonym statusem)                    |
| `POST`   | `/api/flights`                                      | Dodaj nowy lot                                                      |
| `PATCH`  | `/api/flights`                                      | Zaktualizuj pojedynczy lot wg `id` w body                           |
| `DELETE` | `/api/flights`                                      | Usuń lot wg `id` w body                                             |
| `GET`    | `/api/flights/:id`                                  | Pobierz jeden lot wg id z URL                                       |
| `DELETE` | `/api/flights/:id`                                  | Usuń lot wg id z URL                                                |
| `GET`    | `/api/flights/search?q=&terminal=&status=&airline=` | Full-text search + filtry                                           |
| `GET`    | `/api/flights/stats`                                | Statystyki: liczby wg statusu / terminala / airline, śr. opóźnienie |
| `PATCH`  | `/api/flights/bulk-status`                          | Masowa zmiana statusu wielu lotów naraz                             |
| `POST`   | `/api/flights/delay`                                | Ustaw lub skasuj opóźnienie (`delayMinutes: 0` czyści)              |
| `POST`   | `/api/flights/reset`                                | Przywróć dane z `flights.seed.json`                                 |
| `GET`    | `/api/flights/stream`                               | **SSE** – live push aktualizacji co 5 s (bez pollingu)              |

---

## Workflow

```bash
# Uruchomienie dev servera
npm run dev

# Sprawdzenie typów (CI gate)
npm run typecheck

# Linting
npm run lint

# Formatowanie kodu
npm run format

# Build produkcyjny
npm run build
```

Przed każdym commitem uruchom sekwencję:

```bash
npm run typecheck && npm run lint && npm run build
```

---

## Constraints

1. **Brak dodatkowych zależności bez uzasadnienia** — projekt celowo utrzymuje minimalny zestaw pakietów (Next.js, React, Zustand, Tailwind, CVA). Każda nowa zależność wymaga wyraźnego powodu i nie może duplikować istniejącej funkcjonalności.
2. **Dane lotów tylko przez API** — modyfikacje danych MUSZĄ przechodzić przez endpointy `/api/flights`. Komponenty klienckie nigdy nie piszą bezpośrednio do plików JSON.
3. **Brak breaking changes w typach bez migracji** — typy w `types/index.ts` (np. `Flight`, `FlightStatus`) są kontraktem między frontendem a API. Zmiana kształtu wymaga aktualizacji obu stron i danych seed.
4. **Nie commituj `data/flights.json` ze zmianami** — plik `flights.json` jest runtime-mutable. W repo powinien zawierać wyłącznie stan identyczny z `flights.seed.json` lub być w `.gitignore`.
5. **App Router only** — nie wprowadzaj Pages Router (`pages/` directory). Cały routing i server-side logic realizowany przez App Router conventions.
