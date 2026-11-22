# VMOOD Logo Intro — V1 (Original Backup)

**Status:** Preserved reference copy  
**Purpose:** Keep the original live V1 implementation safe while V2 is developed separately.  
**Important:** This is an archive only. It is not imported by the website and does not change the live animation.

The following are the exact V1 implementation snippets copied from the current homepage files.

## 1. Homepage HTML — `index.html`

```html
  <div id="vmoodIntro" hidden>
  <img src="VMOODICON.png" alt="VMOOD">
  </div>
```

## 2. Animation CSS — `style.css`

```css
/* VMOOD MINIMAL LOGO INTRO */

#vmoodIntro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
}

#vmoodIntro[hidden] {
  display: none !important;
}

#vmoodIntro img {
  width: 110px;
  height: auto;
  object-fit: contain;
  animation: vmoodLogoReveal 1s ease both;
}

#vmoodIntro.intro-exit {
  animation: vmoodFadeOut 0.6s ease forwards;
}

@keyframes vmoodLogoReveal {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes vmoodFadeOut {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
```

## 3. Animation JavaScript — `script.js`

```javascript
// VMOOD INTRO - HOMEPAGE ONLY

const vmoodIntro = document.getElementById("vmoodIntro");

if (vmoodIntro) {

  const navigationEntry =
    performance.getEntriesByType("navigation")[0];

  const isRefresh =
    navigationEntry &&
    navigationEntry.type === "reload";

  const cameFromInternalPage =
    document.referrer &&
    new URL(document.referrer).origin === window.location.origin &&
    new URL(document.referrer).pathname !== window.location.pathname;

  if (!cameFromInternalPage || isRefresh) {

    vmoodIntro.hidden = false;

    setTimeout(() => {
      vmoodIntro.classList.add("intro-exit");

      setTimeout(() => {
        vmoodIntro.hidden = true;
        vmoodIntro.classList.remove("intro-exit");
      }, 600);

    }, 1800);

  }
}
```

## V1 behavior notes

- Homepage only.
- Shows on initial entry and homepage refresh.
- Does not replay when navigating back from another internal page.
- Intro layer uses a black background and a centered VMOOD icon.
- Logo reveal: 1 second, opacity 0 to 1, scale 0.92 to 1.
- Intro stays visible for 1.8 seconds, then fades away over 0.6 seconds.
- This backup is intentionally separate from the live source files.
