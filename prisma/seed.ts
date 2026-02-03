import { PrismaClient } from "@prisma/client";
import { brandsData } from "./data/brands";
import { designerFragrances1 } from "./data/fragrances-designer";
import { designerFragrances2 } from "./data/fragrances-designer2";
import { nicheFragrances } from "./data/fragrances-niche";
import { moreFragrances } from "./data/fragrances-more";

const prisma = new PrismaClient();

const NoteCategory = {
  CITRUS: "CITRUS",
  FLORAL: "FLORAL",
  WOODY: "WOODY",
  ORIENTAL: "ORIENTAL",
  FRESH: "FRESH",
  SPICY: "SPICY",
  FRUITY: "FRUITY",
  GREEN: "GREEN",
  AQUATIC: "AQUATIC",
  GOURMAND: "GOURMAND",
  MUSK: "MUSK",
  AMBER: "AMBER",
  LEATHER: "LEATHER",
  AROMATIC: "AROMATIC",
} as const;

async function main() {
  console.log("Starting seed (preserving user data)...");

  // We no longer delete user data (reviews, collections, follows, etc.)
  // Only upsert catalog data (notes, brands, fragrances)

  console.log("Upserting notes...");

  // Create Notes
  const notesData = [
    // Citrus
    { name: "Bergamot", slug: "bergamot", category: NoteCategory.CITRUS },
    { name: "Lemon", slug: "lemon", category: NoteCategory.CITRUS },
    { name: "Orange", slug: "orange", category: NoteCategory.CITRUS },
    { name: "Grapefruit", slug: "grapefruit", category: NoteCategory.CITRUS },
    { name: "Mandarin", slug: "mandarin", category: NoteCategory.CITRUS },
    { name: "Lime", slug: "lime", category: NoteCategory.CITRUS },
    { name: "Yuzu", slug: "yuzu", category: NoteCategory.CITRUS },
    { name: "Blood Orange", slug: "blood-orange", category: NoteCategory.CITRUS },
    { name: "Petitgrain", slug: "petitgrain", category: NoteCategory.CITRUS },
    { name: "Citron", slug: "citron", category: NoteCategory.CITRUS },

    // Floral
    { name: "Rose", slug: "rose", category: NoteCategory.FLORAL },
    { name: "Jasmine", slug: "jasmine", category: NoteCategory.FLORAL },
    { name: "Iris", slug: "iris", category: NoteCategory.FLORAL },
    { name: "Violet", slug: "violet", category: NoteCategory.FLORAL },
    { name: "Lily of the Valley", slug: "lily-of-the-valley", category: NoteCategory.FLORAL },
    { name: "Tuberose", slug: "tuberose", category: NoteCategory.FLORAL },
    { name: "Peony", slug: "peony", category: NoteCategory.FLORAL },
    { name: "Magnolia", slug: "magnolia", category: NoteCategory.FLORAL },
    { name: "Orange Blossom", slug: "orange-blossom", category: NoteCategory.FLORAL },
    { name: "Ylang Ylang", slug: "ylang-ylang", category: NoteCategory.FLORAL },
    { name: "Heliotrope", slug: "heliotrope", category: NoteCategory.FLORAL },
    { name: "Neroli", slug: "neroli", category: NoteCategory.FLORAL },
    { name: "Orchid", slug: "orchid", category: NoteCategory.FLORAL },
    { name: "Freesia", slug: "freesia", category: NoteCategory.FLORAL },
    { name: "Carnation", slug: "carnation", category: NoteCategory.FLORAL },
    { name: "Lily", slug: "lily", category: NoteCategory.FLORAL },
    { name: "Gardenia", slug: "gardenia", category: NoteCategory.FLORAL },
    { name: "Honeysuckle", slug: "honeysuckle", category: NoteCategory.FLORAL },
    { name: "Lotus", slug: "lotus", category: NoteCategory.FLORAL },
    { name: "Chamomile", slug: "chamomile", category: NoteCategory.FLORAL },
    { name: "Lilac", slug: "lilac", category: NoteCategory.FLORAL },
    { name: "Narcissus", slug: "narcissus", category: NoteCategory.FLORAL },

    // Woody
    { name: "Sandalwood", slug: "sandalwood", category: NoteCategory.WOODY },
    { name: "Cedar", slug: "cedar", category: NoteCategory.WOODY },
    { name: "Vetiver", slug: "vetiver", category: NoteCategory.WOODY },
    { name: "Oud", slug: "oud", category: NoteCategory.WOODY },
    { name: "Patchouli", slug: "patchouli", category: NoteCategory.WOODY },
    { name: "Guaiac Wood", slug: "guaiac-wood", category: NoteCategory.WOODY },
    { name: "Birch", slug: "birch", category: NoteCategory.WOODY },
    { name: "Agarwood", slug: "agarwood", category: NoteCategory.WOODY },
    { name: "Cypress", slug: "cypress", category: NoteCategory.WOODY },
    { name: "Pine", slug: "pine", category: NoteCategory.WOODY },
    { name: "Oakmoss", slug: "oakmoss", category: NoteCategory.WOODY },
    { name: "Cashmeran", slug: "cashmeran", category: NoteCategory.WOODY },
    { name: "Papyrus", slug: "papyrus", category: NoteCategory.WOODY },
    { name: "Teak", slug: "teak", category: NoteCategory.WOODY },

    // Spicy
    { name: "Black Pepper", slug: "black-pepper", category: NoteCategory.SPICY },
    { name: "Cardamom", slug: "cardamom", category: NoteCategory.SPICY },
    { name: "Cinnamon", slug: "cinnamon", category: NoteCategory.SPICY },
    { name: "Clove", slug: "clove", category: NoteCategory.SPICY },
    { name: "Ginger", slug: "ginger", category: NoteCategory.SPICY },
    { name: "Nutmeg", slug: "nutmeg", category: NoteCategory.SPICY },
    { name: "Saffron", slug: "saffron", category: NoteCategory.SPICY },
    { name: "Pink Pepper", slug: "pink-pepper", category: NoteCategory.SPICY },
    { name: "Anise", slug: "anise", category: NoteCategory.SPICY },
    { name: "Star Anise", slug: "star-anise", category: NoteCategory.SPICY },
    { name: "Cumin", slug: "cumin", category: NoteCategory.SPICY },

    // Fresh
    { name: "Sea Salt", slug: "sea-salt", category: NoteCategory.FRESH },
    { name: "Mint", slug: "mint", category: NoteCategory.FRESH },
    { name: "Cucumber", slug: "cucumber", category: NoteCategory.FRESH },
    { name: "Green Tea", slug: "green-tea", category: NoteCategory.FRESH },
    { name: "Aldehydes", slug: "aldehydes", category: NoteCategory.FRESH },
    { name: "Ozonic Notes", slug: "ozonic-notes", category: NoteCategory.FRESH },

    // Aquatic
    { name: "Marine Notes", slug: "marine-notes", category: NoteCategory.AQUATIC },
    { name: "Ambergris", slug: "ambergris", category: NoteCategory.AQUATIC },
    { name: "Water Notes", slug: "water-notes", category: NoteCategory.AQUATIC },
    { name: "Seaweed", slug: "seaweed", category: NoteCategory.AQUATIC },

    // Fruity
    { name: "Apple", slug: "apple", category: NoteCategory.FRUITY },
    { name: "Peach", slug: "peach", category: NoteCategory.FRUITY },
    { name: "Pineapple", slug: "pineapple", category: NoteCategory.FRUITY },
    { name: "Blackcurrant", slug: "blackcurrant", category: NoteCategory.FRUITY },
    { name: "Raspberry", slug: "raspberry", category: NoteCategory.FRUITY },
    { name: "Fig", slug: "fig", category: NoteCategory.FRUITY },
    { name: "Pear", slug: "pear", category: NoteCategory.FRUITY },
    { name: "Plum", slug: "plum", category: NoteCategory.FRUITY },
    { name: "Cherry", slug: "cherry", category: NoteCategory.FRUITY },
    { name: "Lychee", slug: "lychee", category: NoteCategory.FRUITY },
    { name: "Passion Fruit", slug: "passion-fruit", category: NoteCategory.FRUITY },
    { name: "Strawberry", slug: "strawberry", category: NoteCategory.FRUITY },
    { name: "Apricot", slug: "apricot", category: NoteCategory.FRUITY },
    { name: "Cassis", slug: "cassis", category: NoteCategory.FRUITY },
    { name: "Mango", slug: "mango", category: NoteCategory.FRUITY },
    { name: "Melon", slug: "melon", category: NoteCategory.FRUITY },
    { name: "Cranberry", slug: "cranberry", category: NoteCategory.FRUITY },
    { name: "Pomegranate", slug: "pomegranate", category: NoteCategory.FRUITY },
    { name: "Sapodilla", slug: "sapodilla", category: NoteCategory.FRUITY },

    // Gourmand
    { name: "Vanilla", slug: "vanilla", category: NoteCategory.GOURMAND },
    { name: "Tonka Bean", slug: "tonka-bean", category: NoteCategory.GOURMAND },
    { name: "Cocoa", slug: "cocoa", category: NoteCategory.GOURMAND },
    { name: "Coffee", slug: "coffee", category: NoteCategory.GOURMAND },
    { name: "Caramel", slug: "caramel", category: NoteCategory.GOURMAND },
    { name: "Honey", slug: "honey", category: NoteCategory.GOURMAND },
    { name: "Almond", slug: "almond", category: NoteCategory.GOURMAND },
    { name: "Praline", slug: "praline", category: NoteCategory.GOURMAND },
    { name: "Rum", slug: "rum", category: NoteCategory.GOURMAND },
    { name: "Whiskey", slug: "whiskey", category: NoteCategory.GOURMAND },
    { name: "Coconut", slug: "coconut", category: NoteCategory.GOURMAND },
    { name: "Hazelnut", slug: "hazelnut", category: NoteCategory.GOURMAND },
    { name: "Beeswax", slug: "beeswax", category: NoteCategory.GOURMAND },

    // Amber/Oriental
    { name: "Amber", slug: "amber", category: NoteCategory.AMBER },
    { name: "Benzoin", slug: "benzoin", category: NoteCategory.AMBER },
    { name: "Labdanum", slug: "labdanum", category: NoteCategory.AMBER },
    { name: "Incense", slug: "incense", category: NoteCategory.ORIENTAL },
    { name: "Myrrh", slug: "myrrh", category: NoteCategory.ORIENTAL },
    { name: "Frankincense", slug: "frankincense", category: NoteCategory.ORIENTAL },
    { name: "Opoponax", slug: "opoponax", category: NoteCategory.ORIENTAL },

    // Musk
    { name: "White Musk", slug: "white-musk", category: NoteCategory.MUSK },
    { name: "Musk", slug: "musk", category: NoteCategory.MUSK },
    { name: "Civet", slug: "civet", category: NoteCategory.MUSK },
    { name: "Cashmere", slug: "cashmere", category: NoteCategory.MUSK },

    // Leather
    { name: "Leather", slug: "leather", category: NoteCategory.LEATHER },
    { name: "Suede", slug: "suede", category: NoteCategory.LEATHER },
    { name: "Castoreum", slug: "castoreum", category: NoteCategory.LEATHER },

    // Green
    { name: "Basil", slug: "basil", category: NoteCategory.GREEN },
    { name: "Galbanum", slug: "galbanum", category: NoteCategory.GREEN },
    { name: "Green Notes", slug: "green-notes", category: NoteCategory.GREEN },
    { name: "Moss", slug: "moss", category: NoteCategory.GREEN },
    { name: "Ivy", slug: "ivy", category: NoteCategory.GREEN },
    { name: "Bamboo", slug: "bamboo", category: NoteCategory.GREEN },

    // Aromatic
    { name: "Lavender", slug: "lavender", category: NoteCategory.AROMATIC },
    { name: "Sage", slug: "sage", category: NoteCategory.AROMATIC },
    { name: "Rosemary", slug: "rosemary", category: NoteCategory.AROMATIC },
    { name: "Geranium", slug: "geranium", category: NoteCategory.AROMATIC },
    { name: "Thyme", slug: "thyme", category: NoteCategory.AROMATIC },
    { name: "Tobacco", slug: "tobacco", category: NoteCategory.AROMATIC },
    { name: "Elemi", slug: "elemi", category: NoteCategory.AROMATIC },
    { name: "Smoky Notes", slug: "smoky-notes", category: NoteCategory.AROMATIC },
    { name: "Artemisia", slug: "artemisia", category: NoteCategory.AROMATIC },
    { name: "Juniper", slug: "juniper", category: NoteCategory.AROMATIC },
    { name: "Oregano", slug: "oregano", category: NoteCategory.AROMATIC },
    { name: "Clary Sage", slug: "clary-sage", category: NoteCategory.AROMATIC },
    { name: "Myrtle", slug: "myrtle", category: NoteCategory.AROMATIC },
    { name: "Flint", slug: "flint", category: NoteCategory.AROMATIC },
    { name: "Olive Blossom", slug: "olive-blossom", category: NoteCategory.AROMATIC },
  ];

  const notes: Record<string, string> = {};
  for (const note of notesData) {
    const upserted = await prisma.note.upsert({
      where: { slug: note.slug },
      update: { name: note.name, category: note.category },
      create: note,
    });
    notes[note.slug] = upserted.id;
  }

  console.log(`Upserted ${Object.keys(notes).length} notes`);

  console.log("Upserting brands...");

  const brands: Record<string, string> = {};
  for (const brand of brandsData) {
    const upserted = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, country: brand.country },
      create: brand,
    });
    brands[brand.slug] = upserted.id;
  }

  console.log(`Upserted ${Object.keys(brands).length} brands`);

  console.log("Upserting fragrances...");

  // Combine all fragrances
  const allFragrances = [
    ...designerFragrances1,
    ...designerFragrances2,
    ...nicheFragrances,
    ...moreFragrances,
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const fragranceData of allFragrances) {
    // Skip if brand doesn't exist
    if (!brands[fragranceData.brandSlug]) {
      skipped++;
      continue;
    }

    try {
      // Check if fragrance exists
      const existing = await prisma.fragrance.findUnique({
        where: { slug: fragranceData.slug },
      });

      const fragrance = await prisma.fragrance.upsert({
        where: { slug: fragranceData.slug },
        update: {
          name: fragranceData.name,
          brandId: brands[fragranceData.brandSlug],
          concentration: fragranceData.concentration,
          gender: fragranceData.gender,
          releaseYear: fragranceData.releaseYear,
          description: fragranceData.description,
        },
        create: {
          name: fragranceData.name,
          slug: fragranceData.slug,
          brandId: brands[fragranceData.brandSlug],
          concentration: fragranceData.concentration,
          gender: fragranceData.gender,
          releaseYear: fragranceData.releaseYear,
          description: fragranceData.description,
        },
      });

      // Upsert fragrance notes
      for (const noteData of fragranceData.notes) {
        if (notes[noteData.slug]) {
          await prisma.fragranceNote.upsert({
            where: {
              fragranceId_noteId: {
                fragranceId: fragrance.id,
                noteId: notes[noteData.slug],
              },
            },
            update: { layer: noteData.layer },
            create: {
              fragranceId: fragrance.id,
              noteId: notes[noteData.slug],
              layer: noteData.layer,
            },
          });
        }
      }

      if (existing) {
        updated++;
      } else {
        created++;
      }
    } catch (error) {
      console.error(`Failed to upsert ${fragranceData.name}:`, error);
      skipped++;
    }
  }

  console.log(`Fragrances: ${created} created, ${updated} updated, ${skipped} skipped`);
  console.log("Seed completed successfully! User data preserved.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
