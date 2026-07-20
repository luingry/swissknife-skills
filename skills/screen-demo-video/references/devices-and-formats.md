# Devices & Formats — desktop and mobile

Decide **target device** and **aspect ratio** before writing the roteiro; they change beat
length, zoom amounts, caption size, and how much you can show at once. Ask the user which
they want if it isn't stated — a landing-page hero loop and a TikTok cut are different films.

## 1. Pick the format

| Format | Canvas | Use for | Notes |
|---|---|---|---|
| Desktop landscape | 1920×1080 (or 2560×1440) | Landing hero, YouTube, docs | The default. Room for wide UI + lower-third captions |
| Desktop square | 1080×1080 | LinkedIn/X feed | Crop the UI hard; punch in more, show less |
| Mobile portrait | 1080×1920 | Reels, Shorts, TikTok, app-store preview | Phone frame fits naturally; captions must be large |
| Mobile in landscape | 1920×1080 with phone centered | Landing hero for a mobile app | Phone floats on a background; lots of negative space — use it for text |
| App-store preview | 1080×1920 / 886×1920 | Store listings | Stores often reject cursor overlays and heavy branding; keep it literal |

**Rule:** never letterbox a portrait capture into a landscape canvas with black bars. Either
frame the phone as an object on a background (mobile-in-landscape) or author a real portrait
composition.

## 2. Desktop specifics

**Framing.** Use `<Screen>` (background + padding + radius + shadow). Padding 6–10% of the
canvas. Rounded corners 16–28px. Big soft shadow.

**Optional browser chrome.** For web products, a fake browser bar sells "this is a real site"
and hides that the capture was cropped. Keep it minimal and neutral — never fake a competitor's
branding or a URL the product doesn't own.

```tsx
export const BrowserChrome: React.FC<{ url: string; children: React.ReactNode }> = ({ url, children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#1c1c20' }}>
    <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
      ))}
      <div style={{ flex: 1, margin: '0 12px', height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', padding: '0 12px', color: 'rgba(255,255,255,0.55)',
        fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif' }}>{url}</div>
    </div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
  </div>
);
```

**Pointer.** Arrow cursor (`<Cursor>`). Hover states are legitimate on desktop — a beat can be
"cursor hovers, tooltip appears" with no click at all.

**Zoom.** Desktop UIs are information-dense, so punch-ins do real work: rest 1.0×, punch
1.6–2.2× on a control. You can go to 2.6× on a tiny target if the source resolution allows.

## 3. Mobile specifics

**Framing.** Use `<DeviceFrame>` with a `DeviceSpec`. The phone should occupy ~70–85% of the
canvas height in portrait, leaving room above/below for captions. On a landscape canvas, the
phone occupies ~80% height and sits slightly off-center, with copy in the empty side.

**Pointer.** Never an arrow — use `<TouchPointer>` (translucent contact blob). Real fingers
don't have hotspots; the blob centers on the touch point.

**Gestures are the vocabulary.** Mobile demos are mostly `scroll` / `swipe` / `click` (tap) /
`longPress`, not clicks alone. Model them explicitly so the contact state (finger down while
dragging) is right:

| Gesture | Timeline | Feels wrong when |
|---|---|---|
| Tap | `click` | Ripple too large — keep it ~1.4× the touch blob on mobile |
| Scroll | `scroll: { to }` | Content moves but the finger doesn't, or lifts mid-drag |
| Swipe (dismiss/next) | `swipe: { to, holdMs }` | No follow-through; real swipes flick and the content keeps gliding |
| Long-press | `longPress: { at, holdMs }` | Hold shorter than ~500ms reads as a tap |
| Pinch | `pinch: { at, from, to }` | Only one contact point shown — render two blobs for a pinch |

**Zoom.** Phone screens are *already* large-on-canvas, so heavy punch-ins look absurd and crop
the device frame. Keep camera scale **1.0–1.4×** in portrait, and prefer moving the camera
*with the content* over zooming. If you must show a small control, zoom to **1.3×** max and
keep at least part of the bezel visible — losing the frame entirely breaks the "it's a phone"
illusion.

**Status bar.** If the capture includes a real status bar with a personal carrier, battery, or
time, either crop it or overlay a neutral one. Never publish a frame showing someone's real
notifications.

## 4. Sharing one roteiro across desktop + mobile

Author the **beats** once (see [roteiro-and-pacing.md](roteiro-and-pacing.md)); author
**coordinates** twice. Structure the project so the story is shared and only geometry differs:

```ts
// src/demo/beats.ts — shared story, no coordinates
export const beats = [
  { id: 'connect',  caption: 'Conecte pela rede local',   holdS: 1.4 },
  { id: 'mirror',   caption: 'Espelhe a tela em 1 toque', holdS: 1.6 },
  { id: 'control',  caption: 'Controle o dispositivo',    holdS: 1.5 },
];

// src/demo/timeline.desktop.ts — geometry for 1920×1080
// src/demo/timeline.mobile.ts  — geometry for 1080×1920
```

Then register both compositions from one root:

```tsx
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DemoDesktop" component={DesktopDemo} width={1920} height={1080} fps={60} durationInFrames={...} />
    <Composition id="DemoMobile"  component={MobileDemo}  width={1080} height={1920} fps={60} durationInFrames={...} />
  </>
);
```

Render each with `npx remotion render src/index.ts DemoDesktop out/desktop.mp4` etc.

**Do not** auto-derive the mobile cut by scaling the desktop one. Portrait needs *fewer* beats,
*bigger* captions, and *tighter* framing; a squeezed landscape edit is the most common way these
videos look cheap.

## 5. Caption sizing per format

Captions must be legible at the size people actually watch. Scale with canvas height:

| Format | Caption font size | Max words |
|---|---|---|
| 1920×1080 | 32–38px | 7 |
| 1080×1080 | 40–46px | 5 |
| 1080×1920 (mobile) | 52–64px | 5 |

On mobile, place captions in the **top or bottom sixth** of the canvas, outside the phone —
never over the app content, where they compete with the UI you're demonstrating. On desktop,
lower-third or anchored beside the target both work.

## 6. Safe areas

- **Reels/Shorts/TikTok:** keep captions out of the top ~12% and bottom ~20% (platform UI
  covers them).
- **App-store previews:** no cursor/touch overlays in some stores; check current rules before
  shipping — an overlay can get a listing rejected.
- **Landing-page loops:** the video is often muted and autoplays; the story must work with **no
  audio and no captions read** — carry it with motion and on-screen UI alone.
