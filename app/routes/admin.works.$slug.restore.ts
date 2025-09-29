import { redirect, type ActionFunctionArgs } from "react-router"
import type { Route } from "../+types/root"
import { prisma } from "~/lib/prisma"

export const action = async ({ params, request, context }: Route.ActionArgs) => {
  
  // 公開状態に復元
  await prisma.works.update({
    where: {
      slug: params.slug,
    },
    data: {
      visibility: 1,
    },
  })
  
  return redirect("/admin/works")
}
