import { cookies } from "next/headers";

import { getHorizontal, getVertical } from "@/components/layout/sizing";

import { MainLayout } from "./main-layout";

export default async function Page() {
  const store = await cookies();
  const horizontalSizes = getHorizontal(store);
  const verticalSizes = getVertical(store);

  return (
    <MainLayout
      horizontalSizes={horizontalSizes ?? [50, 50]}
      verticalSizes={verticalSizes ?? [66.66, 33.33]}
    />
  );
}
