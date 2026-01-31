import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FragranceForm } from "@/components/fragrance/fragrance-form";

export const metadata = {
  title: "Add New Fragrance",
  description: "Add a new fragrance to the Kunbo database.",
};

async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

async function getNotes() {
  return prisma.note.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, category: true },
  });
}

export default async function NewFragrancePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [brands, notes] = await Promise.all([getBrands(), getNotes()]);

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Add New Fragrance</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Contribute to the Kunbo database by adding a fragrance
          </p>
        </div>

        <FragranceForm brands={brands} notes={notes} />
      </div>
    </div>
  );
}
