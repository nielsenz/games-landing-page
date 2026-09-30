# Dreadworks maintained source

`index.html` is the maintained game. This directory also holds the game harness, regression tests, and balance simulation tools imported from the former sibling `hostile-architect/` folder.

Choose a shop card and tap a valid tile to place it. During building, **Sell traps** (or **S**) switches tapping to selling for a 60% refund, rounded up. Choose a shop card or press Escape to leave selling mode. Starting a wave also turns selling off. Right-click remains available for desktop selling.

Space releases a wave. P or the pause button pauses/resumes; focus loss pauses automatically. Each level has a twelve-wave campaign and an endless continuation.

From the repository root, run `npm run sync` after changes and `npm test` to validate the source, served copy, campaigns, and input handling. Tests use a mocked canvas; they do not verify rendering.
