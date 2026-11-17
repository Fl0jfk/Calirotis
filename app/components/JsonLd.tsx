const SITE_URL = "https://calirotis.fr";

const AREAS = [
  "Saint-Pierre-du-Vauvray",
  "Rouen",
  "Évreux",
  "Vernon",
  "Louviers",
  "Mantes-la-Jolie",
  "Cergy",
  "Nanterre",
  "Paris",
];

const data = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Calirotis",
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE_URL}/#business` },
    },
    {
      "@type": ["FoodEstablishment", "LocalBusiness"],
      "@id": `${SITE_URL}/#business`,
      name: "Calirotis",
      alternateName: "Calirotis Traiteur",
      description:
        "Traiteur spécialisé en rôtisserie événementielle : cochon de lait à la broche, méchoui, agneau et barbecue géant pour mariages, fêtes de famille et événements d'entreprise.",
      url: SITE_URL,
      image: `${SITE_URL}/og-image.jpg`,
      logo: `${SITE_URL}/Logo.png`,
      telephone: "+33699512290",
      email: "calirotis@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "10 Allée du Roule",
        postalCode: "27430",
        addressLocality: "Saint-Pierre-du-Vauvray",
        addressRegion: "Normandie",
        addressCountry: "FR",
      },
      geo: { "@type": "GeoCoordinates", latitude: 49.2263948, longitude: 1.2228646 },
      hasMap: "https://www.google.com/maps?cid=9889569065101112204",
      areaServed: [
        ...AREAS.map((name) => ({ "@type": "City", name })),
        { "@type": "AdministrativeArea", name: "Normandie" },
        { "@type": "AdministrativeArea", name: "Île-de-France" },
      ],
      servesCuisine: ["Rôtisserie", "Cochon de lait à la broche", "Méchoui", "Barbecue"],
      knowsAbout: ["Cochon de lait à la broche", "Méchoui", "Barbecue géant", "Traiteur de mariage", "Traiteur d'entreprise"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Prestations Calirotis",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cochon de lait à la broche" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Méchoui" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Barbecue géant" } },
        ],
      },
      sameAs: [
        "https://www.facebook.com/p/Calir%C3%B4tis-Traiteur-61554143394633/",
        "https://www.tiktok.com/@calirotis",
        "https://www.google.com/maps?cid=9889569065101112204",
      ],
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

