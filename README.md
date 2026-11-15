# MAYACHE — The Connected World

An immersive 3D portfolio with a full-screen Three.js environment. Destination
buttons move the camera between a build station, systems core, profile station,
and contact portal. Glowing project screens open case studies. Drag or use the
arrow buttons to orbit the current destination.

## Preview

```powershell
Set-Location -LiteralPath "C:\Users\Dima D'origine\OneDrive\Bureau\portfolio-3d"
npm run preview
```

Open http://127.0.0.1:8787. No installation or build is required. Three.js and
the project screenshot are stored locally under `dist/`.

## Edit and check

- `dist/index.html`: profile content and destination panels.
- `dist/scene.js`: 3D stations, camera destinations, interaction and animation.
- `dist/app.js`: destination navigation and project case studies.
- `dist/styles.css`: responsive overlays, controls and reading view.

```powershell
npm run check
python verify.py
```

The optional browser checks require Python Playwright and installed Windows
Chrome. Screenshots and results are saved under ignored `qa-output/`.

Reduced-motion preferences pause ambient animation and make camera travel
instant. A reading view displays all content together. If WebGL is unavailable,
destination controls and case studies remain usable.

The Infrastructure Lab is clearly marked as planned. AIRBCAR details come from
the original portfolio; Scripts Studio uses an actual dashboard screenshot.
Hosting identity is preserved in `.openai/hosting.json`. Deployable static files
are in `dist/`; the existing Vercel portfolio is a separate deployment.

## Germany-focused positioning

The main portfolio language is German, with an entry goal in IT-Systemintegration.
Born2beroot, Inception and NetPractice lead the project presentation, supported
by ft_transcendence, ft_irc, Scripts Studio and AIRBCAR. Windows/AD, Microsoft 365
and verified backup/restore exercises remain explicitly planned. The German CV is linked as supplied; its PDF was not edited.
See [research, requirements and next evidence](docs/systemintegration-germany.md).

## GitHub and Vercel

The GitHub repository is https://github.com/mayachee/mayasche.
`vercel.json` selects the static `dist/` output and runs JavaScript syntax checks
before deployment. No framework build or runtime environment variables are needed.

To deploy through Vercel's dashboard, import that repository, select the project
root, and keep the settings from `vercel.json`. Connect its `main` branch for
automatic production deployments. For the CLI, run `npx vercel login` followed
by `npx vercel --prod` from this project directory. Account login must be
completed by the account owner; never commit tokens or `.vercel/` state.

## Languages

English/Deutsch buttons translate the portfolio, project dialogs and 3D labels.
The selection is remembered locally. German is the default; `?lang=en` and
`?lang=de` support language-specific links. Start contains both CVs and GitHub.
English content is in `dist/translations.js`, German content in `index.html`
and `app.js`; scene label translations are in `scene.js`.

## Music recording

The visible YouTube player embeds Sony Classical's Vienna Philharmonic / Gustavo
Dudamel performance of Barber's Adagio for Strings, Op. 11 (Summer Night Concert
2019), video ID `WAoLJ8GbA4Y`. No recording is downloaded or served by this repo.
Source: https://www.youtube.com/watch?v=WAoLJ8GbA4Y

The player attempts autoplay with sound. Browser policies may block it; in that
case a translated Play prompt remains available. Playback status comes from the
YouTube player, rather than assuming autoplay worked. Closing/hiding the player
pauses playback. Volume is remembered locally. YouTube availability, advertising,
regional restrictions and browser playback policy remain outside this site's control.
The visible video viewport stays at least 200 x 200 pixels.

## Profile image

Start uses the public GitHub avatar from `github.com/mayachee.png`, stored locally
under `dist/assets/profile-avatar.jpg`. Its framing is handled with CSS.
The English/German welcome message is included in both language versions.
