export function buildWhatsAppUrl(mobile10: string, message: string) {
  const phone = `91${mobile10}`; // India
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}