NightFallLoop/
├── public/                # Static assets (favicon, index.html)
├── src/
│   ├── assets/            # Images, sprites, tilesheets
│   ├── components/        # React UI components (HUD, Menus, Buttons)
│   ├── game/              # Core game logic (rot.js systems)
│   │   ├── engine.ts      # Game engine loop (tick, update)
│   │   ├── map.ts         # Dungeon/floor generation logic
│   │   ├── fov.ts         # Field-of-view logic
│   │   ├── pathfinding.ts # Smart pathfinding AI
│   │   ├── entities/
│   │   │   ├── Piece.ts   # Player pieces (Knight, Hunter, etc.)
│   │   │   ├── Enemy.ts   # Monster logic
│   │   │   ├── Entity.ts  # Base class for shared logic
│   │   ├── state.ts       # Core game state (floor, day, pieces)
│   │   ├── config.ts      # Game constants, scaling rules
│   ├── hooks/             # Custom React hooks for input/game bridge
│   ├── ui/                # UI-specific pieces: HealthBar, ManaBar, etc.
│   ├── App.tsx            # Root React app
│   ├── index.tsx          # Entry point
│   ├── styles/            # Tailwind config, base CSS
├── .env                   # Env vars if needed
├── index.html             # Main HTML template (if using Vite)
├── tsconfig.json
├── pnpm-lock.yaml
├── vite.config.ts         # Recommended: Vite for dev server & build
└── README.md
