import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { getUserSubscription } from "./actions";

export default function useUserSubscription() {
  const { userId } = useAuth();

  const query = useQuery({
    queryKey: ["user-subscription"],
    queryFn: () => getUserSubscription(userId ?? ""),
    enabled: !!userId,
  });

  return query;
}
