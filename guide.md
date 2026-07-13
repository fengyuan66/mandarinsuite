┌───────────────────────────┐
│ Browser                   │
│ Vite + React              │
│                           │
│ Shows buttons and words   │
└─────────────┬─────────────┘
              │ HTTP request
              │ GET /words
              │ POST /words
              ▼
┌───────────────────────────┐
│ FastAPI                   │
│                           │
│ Receives and validates    │
│ requests                  │
└─────────────┬─────────────┘
              │ Python / SQLModel
              ▼
┌───────────────────────────┐
│ Engine + Session          │
│                           │
│ Communicate with SQLite   │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ words.db                  │
│                           │
│ The actual SQLite file    │
└───────────────────────────┘