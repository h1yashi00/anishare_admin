import { redirect, type ActionFunctionArgs } from "react-router"
import { prisma } from "~/lib/prisma"

export const action = async ({ params, request, context }: ActionFunctionArgs) => {

  // 強制非公開に設定

  await prisma.works.update({
    where: {
      slug: params.slug,
    },
    data: {
      visibility: 3,
    },
  })

  return redirect("/admin/works")
}
