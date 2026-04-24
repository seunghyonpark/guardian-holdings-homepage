const body = document.body;
const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-mobile-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuLinks = document.querySelectorAll("[data-menu-link]");
const copyButton = document.querySelector("[data-copy-wallet]");
const walletAddress = document.querySelector("[data-wallet-address]");

function syncHeader() {
  if (!header) return;
  header.classList.toggle(
    "is-scrolled",
    window.scrollY > 24 || body.classList.contains("menu-open")
  );
}

function closeMenu() {
  if (!menu || !menuToggle) return;
  body.classList.remove("menu-open");
  menu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  syncHeader();
}

function wireMenu() {
  if (!menu || !menuToggle) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menu.hidden = !isOpen;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    syncHeader();
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

function wireWalletCopy() {
  if (!copyButton || !walletAddress) return;

  const originalLabel = copyButton.textContent;

  copyButton.addEventListener("click", async () => {
    const address = walletAddress.textContent.trim();

    try {
      await navigator.clipboard.writeText(address);
      copyButton.textContent = "복사됨";
      window.setTimeout(() => {
        copyButton.textContent = originalLabel;
      }, 1600);
    } catch {
      copyButton.textContent = "복사 실패";
      window.setTimeout(() => {
        copyButton.textContent = originalLabel;
      }, 1600);
    }
  });
}

window.addEventListener("scroll", syncHeader, { passive: true });
wireMenu();
wireWalletCopy();
syncHeader();
