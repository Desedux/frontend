export function openLoginModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-login"))
  }
}