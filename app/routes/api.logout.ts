import type { Route } from "./+types/api.logout";
import { handleLogout } from "../middleware.server";

export async function action({ request }: Route.ActionArgs) {
  const cookie = handleLogout();
  
  return Response.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
}
