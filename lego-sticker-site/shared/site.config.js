// Shared by the Vue frontend and the Node server (mail templates, validation).
// Change brand, prices and survey options here – nowhere else.

export const site = {
  brand: 'Kopfsache',
  tagline: 'Gesichtssticker für Minifiguren',
  // Early-bird discount promised to everyone on the waitlist.
  earlyBirdDiscount: 20,
  // Planned launch window – shown in the hero and the FAQ.
  launchHint: 'Frühjahr 2027',
  contactEmail: 'hallo@example.com',
}

export const packages = [
  {
    id: 'solo',
    name: 'Solo',
    price: 9.9,
    faces: 1,
    stickers: 6,
    tagline: 'Für dich – oder als kleines Geschenk.',
    features: ['1 Gesicht', 'Bis zu 3 Fotos oder Ausdrücke', '6 Sticker auf einem Bogen', 'Echtes Foto oder illustriert'],
  },
  {
    id: 'familie',
    name: 'Familie',
    price: 24.9,
    faces: 4,
    stickers: 24,
    tagline: 'Die ganze Bande als Minifiguren.',
    features: ['Bis zu 4 Gesichter', 'Je bis zu 3 Fotos oder Ausdrücke', '24 Sticker', 'Gratis Ersatzbogen'],
    highlight: true,
  },
  {
    id: 'party',
    name: 'Party',
    price: 59.9,
    faces: 12,
    stickers: 72,
    tagline: 'Hochzeit, Team-Event, Geburtstag.',
    features: ['Bis zu 12 Gesichter', 'Je bis zu 3 Fotos oder Ausdrücke', '72 Sticker', 'Persönliche Freigabe vor dem Druck'],
  },
]

// Ids are stored in Brevo contact attributes and in the stats – keep them stable.
// The first style is preselected in the preview.
export const styleGroups = [
  { id: 'foto', name: 'Echtes Foto' },
  { id: 'illustration', name: 'Illustriert' },
]

export const styles = [
  { id: 'original', group: 'foto', name: 'Original', description: 'Dein echtes Foto, nur zugeschnitten – so wie du bist.' },
  { id: 'leuchtend', group: 'foto', name: 'Leuchtend', description: 'Dein Foto mit kräftigeren Farben und mehr Kontrast.' },
  { id: 'warm', group: 'foto', name: 'Warm', description: 'Dein Foto in sonnigem, warmem Licht.' },
  { id: 'sw', group: 'foto', name: 'S/W', description: 'Dein Foto in klassischem Schwarz-Weiß.' },
  { id: 'vintage', group: 'foto', name: 'Vintage', description: 'Dein Foto in Sepia-Tönen, wie ein altes Familienbild.' },
  { id: 'gelb', group: 'foto', name: 'Gelb', description: 'Dein Foto in Minifiguren-Gelb getönt – passt perfekt zum Kopf.' },
  { id: 'klassik', group: 'illustration', name: 'Klassik', description: 'Schwarze Linien auf Gelb – wie ein gedrucktes Minifiguren-Gesicht.' },
  { id: 'comic', group: 'illustration', name: 'Comic', description: 'Kräftige Farben mit Konturen.' },
  { id: 'popart', group: 'illustration', name: 'Pop-Art', description: 'Drei knallige Farbtöne.' },
]

export const occasions = [
  { id: 'selbst', label: 'Für mich selbst' },
  { id: 'geschenk', label: 'Als Geschenk' },
  { id: 'familie', label: 'Familie & Kinder' },
  { id: 'hochzeit', label: 'Hochzeit' },
  { id: 'firma', label: 'Team / Firma' },
  { id: 'sonstiges', label: 'Etwas anderes' },
]

// Price-sensitivity question in the signup form (price for one face / Solo set).
export const priceRanges = [
  { id: 'unter5', label: 'unter 5 €' },
  { id: '5-10', label: '5–10 €' },
  { id: '10-15', label: '10–15 €' },
  { id: 'ueber15', label: 'über 15 €' },
]

export const packageIds = [...packages.map((p) => p.id), 'unsicher']
export const styleIds = styles.map((s) => s.id)
export const occasionIds = occasions.map((o) => o.id)
export const priceRangeIds = priceRanges.map((p) => p.id)

export function formatPrice(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
