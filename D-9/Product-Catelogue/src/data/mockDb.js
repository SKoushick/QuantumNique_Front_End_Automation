import starryNight from "../assets/images/starry-night.jpg";
import starryNightOverTheRhone from "../assets/images/starry-night-over-the-rhone.jpg";
import wheatfieldWithCypresses from "../assets/images/wheatfield-with-cypresses.jpg";
import cafeTerraceAtNight from "../assets/images/cafe-terrace-at-night.jpg";
import bedroom from "../assets/images/bedroom.jpg";
import sunflowers from "../assets/images/sunflowers.jpg";
import irises from "../assets/images/irises.jpg";
import vanGoghSelfPortrait from "../assets/images/van-gogh-self-portrait.jpg";
import userBuyer from "../assets/images/user-buyer.jpg";
import userAdmin from "../assets/images/user-admin.jpg";

export const initialArtist = {
  id: "artist_vvg",
  name: "Vincent van Gogh",
  avatar: vanGoghSelfPortrait,
  biography: "Vincent Willem van Gogh was a Dutch Post-Impressionist painter who posthumously became one of the most famous and influential figures in Western art history. In a decade, he created about 2,100 artworks, including around 860 oil paintings, most of them in the last two years of his life. They include landscapes, still lifes, portraits, and self-portraits, characterized by bold colors and dramatic, impulsive and expressive brushwork that contributed to the foundations of modern art.",
  statement: "I dream of painting and then I paint my dream. Color in a picture is like enthusiasm in life.",
  yearsOfExperience: "10 Years (Active 1880–1890)",
  awards: [
    "Post-Impressionist Legacy Landmark Award",
    "Global Masterpieces Hall of Fame Inductee",
    "Museum of Modern Art (MoMA) Permanent Feature"
  ],
  exhibitions: [
    { year: "1889", title: "Salon des Indépendants", location: "Paris, France" },
    { year: "1901", title: "Bernheim-Jeune Retrospective", location: "Paris, France" },
    { year: "1935", title: "Museum of Modern Art Solo Exhibition", location: "New York, USA" },
    { year: "Permanent", title: "Van Gogh Museum Exhibition", location: "Amsterdam, Netherlands" }
  ],
  studioPhotos: [
    bedroom,
    cafeTerraceAtNight
  ],
  socials: {
    instagram: "https://instagram.com/vangoghmuseum",
    twitter: "https://x.com/vangoghmuseum",
    website: "https://www.vangoghmuseum.nl"
  }
};

export const initialUsers = [
  {
    id: "user_buyer",
    name: "Arthur Pendragon",
    email: "buyer@gallery.com",
    password: "password123",
    phone: "+33 6 1234 5678",
    address: "12 Rue de la Paix, 75002 Paris, France",
    profilePic: userBuyer
  },
  {
    id: "user_admin",
    name: "Curator Van Gogh",
    email: "curator@gallery.com",
    password: "adminpassword",
    phone: "+31 20 570 5200",
    address: "Museumplein 6, 1071 DJ Amsterdam, Netherlands",
    profilePic: userAdmin,
    isAdmin: true
  }
];

export const initialPaintings = [
  {
    id: "p1",
    sku: "VVG-SN-1889",
    name: "The Starry Night",
    description: "Vincent van Gogh's iconic Post-Impressionist masterpiece, painted in June 1889, depicting the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence, just before sunrise, with the addition of an idealized village.",
    story: "Painted during a turbulent period of recovery, the swirling vortexes of the night sky reflect the painter's intense emotional state. The bright morning star, Venus, radiates golden energy. It remains a legendary study of light, dark, and human spirituality.",
    inspiration: "The view from his barred window at the Saint-Paul-de-Mausole asylum, combined with memories of the Dutch countryside.",
    artistNotes: "This morning I saw the countryside from my window a long time before sunrise, with nothing but the morning star, which looked very large.",
    category: "Paintings",
    subcategory: "Post-Impressionism",
    medium: "Oil",
    style: "Impressionism",
    collection: "Celestial Works",
    artist: "Vincent van Gogh",
    price: 150000000,
    discountPrice: 120000000,
    rating: 4.9,
    availability: "In Stock", // In Stock, Low Stock, Sold
    images: [
      starryNight,
      starryNightOverTheRhone,
      wheatfieldWithCypresses
    ],
    specifications: {
      certificate: "Included (Authenticated by Van Gogh Museum)",
      warranty: "10-Year Archival & Conservation Guarantee",
      signature: "Artist Signed (Vincent)",
      year: "1889",
      dimensions: "73.7 cm × 92.1 cm",
      orientation: "Landscape",
      frame: "Included (Classic Gilded Gold Wood Frame)",
      origin: "France"
    },
    variants: [
      { id: "v1_orig", type: "Original Version", size: "73.7 cm × 92.1 cm", frame: "Gilded Gold Wood", canvas: "Linen Canvas", price: 120000000, stock: 1 },
      { id: "v1_print_l", type: "Fine Art Print", size: "73.7 cm × 92.1 cm", frame: "Classic Black Wood", canvas: "Cotton Canvas", price: 1200, stock: 15 },
      { id: "v1_print_s", type: "Fine Art Print", size: "40 cm × 50 cm", frame: "None", canvas: "Rolled Fine Art Paper", price: 350, stock: 50 }
    ],
    reviewsCount: 3
  },
  {
    id: "p2",
    sku: "VVG-CTN-1888",
    name: "Café Terrace at Night",
    description: "An elegant oil painting showing a colorful, inviting outdoor terrace café in Arles, France, set against a dark starry sky lit by gas lamps.",
    story: "Painted on-site in Arles during September 1888, this work was Van Gogh's first painting to feature a starry background. The warm yellow, orange, and green tones of the cafe terrace contrast beautifully with the deep blue-violet of the starry sky.",
    inspiration: "The vibrant street nightlife of Arles and his desire to paint night-sky colors without using black.",
    artistNotes: "Here you have a night painting without having used black, only with beautiful blue, violet, green, and the lighted square is colored with pale sulfur yellow and citron green.",
    category: "Paintings",
    subcategory: "Post-Impressionism",
    medium: "Oil",
    style: "Impressionism",
    collection: "Arlesian Nights",
    artist: "Vincent van Gogh",
    price: 95000000,
    discountPrice: null,
    rating: 4.8,
    availability: "Low Stock",
    images: [
      cafeTerraceAtNight,
      bedroom
    ],
    specifications: {
      certificate: "Included (Authenticated by Kröller-Müller Museum)",
      warranty: "10-Year Archival & Conservation Guarantee",
      signature: "Unsigned (Mentioned in Letters)",
      year: "1888",
      dimensions: "80.7 cm × 65.3 cm",
      orientation: "Portrait",
      frame: "Included (Dark Mahogany Classic Frame)",
      origin: "France"
    },
    variants: [
      { id: "v2_orig", type: "Original Version", size: "80.7 cm × 65.3 cm", frame: "Dark Mahogany Wood", canvas: "Linen Canvas", price: 95000000, stock: 1 },
      { id: "v2_print", type: "Fine Art Print", size: "80.7 cm × 65.3 cm", frame: "Classic Black Wood", canvas: "Cotton Canvas", price: 1100, stock: 8 }
    ],
    reviewsCount: 2
  },
  {
    id: "p3",
    sku: "VVG-WFC-1889",
    name: "Wheatfield with Cypresses",
    description: "One of three similar oil paintings of summer wheatfields, showcasing Vincent's beloved cypress trees framing a swirling sky in Saint-Rémy.",
    story: "Van Gogh regarded this landscape as one of his best summer canvases. The golden wheat, green cypresses, and olive trees bend beneath a turbulent sky of cream and blue swirls, evoking nature's raw vitality.",
    inspiration: "The wind-swept landscapes of the Saint-Rémy countryside and the structural beauty of cypress trees.",
    artistNotes: "It has the sunny yellow wheat and the cypresses like two dark accents. I think it is one of the truest landscapes I have done.",
    category: "Paintings",
    subcategory: "Landscape",
    medium: "Oil",
    style: "Impressionism",
    collection: "Country Fields",
    artist: "Vincent van Gogh",
    price: 85000000,
    discountPrice: 75000000,
    rating: 4.7,
    availability: "In Stock",
    images: [
      wheatfieldWithCypresses
    ],
    specifications: {
      certificate: "Included (Authenticated by The National Gallery, London)",
      warranty: "10-Year Archival & Conservation Guarantee",
      signature: "Artist Signed (Vincent)",
      year: "1889",
      dimensions: "73 cm × 93.4 cm",
      orientation: "Landscape",
      frame: "Included (Distressed Bronze Frame)",
      origin: "France"
    },
    variants: [
      { id: "v3_orig", type: "Original Version", size: "73 cm × 93.4 cm", frame: "Distressed Bronze", canvas: "Linen Canvas", price: 75000000, stock: 1 },
      { id: "v3_print", type: "Fine Art Print", size: "73 cm × 93.4 cm", frame: "Dark Wood", canvas: "Cotton Canvas", price: 950, stock: 20 }
    ],
    reviewsCount: 1
  },
  {
    id: "p4",
    sku: "VVG-SF-1888",
    name: "Sunflowers",
    description: "A breathtaking study of yellow tones, this masterpiece represents the zenith of Vincent's Sunflower series, painted to decorate Gauguin's bedroom in the Yellow House.",
    story: "Painted in Arles, this canvas represents the radiant power of friendship, sunshine, and color. Vincent used then-innovative pigments like chrome yellow to achieve an unmatched chromatic brilliance.",
    inspiration: "Gratitude, friendship, and the blazing southern French sun.",
    artistNotes: "I am painting with the gusto of a Marseillais eating bouillabaisse, which won't surprise you when you know that what I'm at is the painting of some large sunflowers.",
    category: "Paintings",
    subcategory: "Still Life",
    medium: "Oil",
    style: "Impressionism",
    collection: "Floral Symphony",
    artist: "Vincent van Gogh",
    price: 110000000,
    discountPrice: null,
    rating: 4.95,
    availability: "Sold",
    images: [
      sunflowers
    ],
    specifications: {
      certificate: "Included (Authenticated by Van Gogh Museum)",
      warranty: "Lifetime Archival Guarantee",
      signature: "Artist Signed (Vincent)",
      year: "1889",
      dimensions: "95 cm × 73 cm",
      orientation: "Portrait",
      frame: "Included (Traditional Gilded Baroque Frame)",
      origin: "France"
    },
    variants: [
      { id: "v4_orig", type: "Original Version", size: "95 cm × 73 cm", frame: "Gilded Baroque", canvas: "Linen Canvas", price: 110000000, stock: 0 },
      { id: "v4_print", type: "Fine Art Print", size: "95 cm × 73 cm", frame: "Black Shadowbox", canvas: "Heavyweight Cotton Canvas", price: 1300, stock: 12 }
    ],
    reviewsCount: 4
  },
  {
    id: "p5",
    sku: "VVG-SN-R-1888",
    name: "Starry Night Over the Rhone",
    description: "A romantic oil painting showing the twinkling gaslight reflections on the dark blue waters of the Rhone River under the glittering Ursa Major constellation.",
    story: "Painted on the bank of the river Rhone, this canvas captures a peaceful, tender night. A stroll of two lovers in the foreground anchors a cosmic dance of gaslights and stellar sparkles in deep blue and gold.",
    inspiration: "The magical nocturnal reflections of gas lamps on the water's surface.",
    artistNotes: "The star-ry sky painted at night, actually under a gas jet. The sky is aquamarine, the water is royal blue, the ground is mauve. The town is blue and purple.",
    category: "Paintings",
    subcategory: "Post-Impressionism",
    medium: "Oil",
    style: "Impressionism",
    collection: "Celestial Works",
    artist: "Vincent van Gogh",
    price: 90000000,
    discountPrice: 82000000,
    rating: 4.85,
    availability: "In Stock",
    images: [
      starryNightOverTheRhone
    ],
    specifications: {
      certificate: "Included (Authenticated by Musée d'Orsay)",
      warranty: "10-Year Archival & Conservation Guarantee",
      signature: "Artist Signed (Vincent)",
      year: "1888",
      dimensions: "72.5 cm × 92 cm",
      orientation: "Landscape",
      frame: "Included (Vintage Gold Stained Wood Frame)",
      origin: "France"
    },
    variants: [
      { id: "v5_orig", type: "Original Version", size: "72.5 cm × 92 cm", frame: "Vintage Gold Wood", canvas: "Linen Canvas", price: 82000000, stock: 1 },
      { id: "v5_print", type: "Fine Art Print", size: "72.5 cm × 92 cm", frame: "Classic Black Wood", canvas: "Cotton Canvas", price: 1050, stock: 15 }
    ],
    reviewsCount: 2
  },
  {
    id: "p6",
    sku: "VVG-IR-1889",
    name: "Irises",
    description: "A gorgeous post-impressionist floral study of purple and blue irises, filled with movement and Japanese woodblock print influences, painted in the asylum garden.",
    story: "Before his sister visited, Vincent painted this study of purple flowers, focusing on intense outlines, bold colors, and dramatic framing. He called it the 'lightning conductor for my illness'.",
    inspiration: "The untamed beauty of the garden flora at the Saint-Rémy asylum.",
    artistNotes: "It is a study, full of air and life. It represents the quiet struggle against darkness, blooming with hope.",
    category: "Paintings",
    subcategory: "Floral Study",
    medium: "Oil",
    style: "Impressionism",
    collection: "Floral Symphony",
    artist: "Vincent van Gogh",
    price: 78000000,
    discountPrice: null,
    rating: 4.75,
    availability: "In Stock",
    images: [
      irises
    ],
    specifications: {
      certificate: "Included (Authenticated by J. Paul Getty Museum)",
      warranty: "10-Year Archival & Conservation Guarantee",
      signature: "Unsigned",
      year: "1889",
      dimensions: "71 cm × 93 cm",
      orientation: "Landscape",
      frame: "Included (Elegant Aged Gold Gilt Frame)",
      origin: "France"
    },
    variants: [
      { id: "v6_orig", type: "Original Version", size: "71 cm × 93 cm", frame: "Aged Gold Gilt", canvas: "Linen Canvas", price: 78000000, stock: 1 },
      { id: "v6_print", type: "Fine Art Print", size: "71 cm × 93 cm", frame: "Aged Silver", canvas: "Cotton Canvas", price: 990, stock: 25 }
    ],
    reviewsCount: 1
  }
];

export const initialReviews = [
  {
    id: "r1",
    paintingId: "p1",
    userName: "Alice Sterling",
    rating: 5,
    comment: "An absolute honor to purchase the fine print. The texture reproduction is incredibly detailed. Walking into my living room feels like walking into MoMA.",
    date: "2026-05-12",
    verified: true,
    helpfulVotes: 24,
    images: []
  },
  {
    id: "r2",
    paintingId: "p1",
    userName: "David de Groot",
    rating: 5,
    comment: "The deep blues and golden stars are even more vibrant in person. Outstanding museum grade packaging. Unmatched quality.",
    date: "2026-06-02",
    verified: true,
    helpfulVotes: 15,
    images: []
  },
  {
    id: "r3",
    paintingId: "p1",
    userName: "Helena Rostova",
    rating: 4,
    comment: "The print version has wonderful color matching. Minor shipping delay, but customer service kept me informed throughout. Recommend highly.",
    date: "2026-06-18",
    verified: true,
    helpfulVotes: 6,
    images: []
  },
  {
    id: "r4",
    paintingId: "p2",
    userName: "Julian Vance",
    rating: 5,
    comment: "The Cafe Terrace print makes me feel like I am sitting in Arles sipping red wine. The light representation is warm and stunning.",
    date: "2026-06-11",
    verified: true,
    helpfulVotes: 12,
    images: []
  },
  {
    id: "r5",
    paintingId: "p4",
    userName: "Guillaume Durand",
    rating: 5,
    comment: "Unmatched masterpiece. Sunflowers represent pure light. Even though the original is sold, the archival print on linen is flawless.",
    date: "2026-05-28",
    verified: true,
    helpfulVotes: 42,
    images: []
  }
];

export const initialCommissions = [
  {
    id: "comm_1",
    userId: "user_buyer",
    userName: "Arthur Pendragon",
    email: "buyer@gallery.com",
    phone: "+33 6 1234 5678",
    size: "60 cm x 80 cm",
    style: "Impressionist Starry Night Theme",
    medium: "Oil",
    budget: 15000,
    notes: "I would like a custom painting of the Mont St Michel in Normandy, but executed in the swirling blue and gold brushstroke style of The Starry Night.",
    status: "Pending Review",
    date: "2026-07-01",
    referenceImages: []
  }
];
