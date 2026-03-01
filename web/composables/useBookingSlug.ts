export function useBookingSlug(): string {
  const route = useRoute();
  return String(route.params.slug ?? 'studio-berlin-mitte');
}
