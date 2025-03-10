import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/main";

export const useAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: () => queryClient.getQueryData(["authUser"]),
    staleTime: 5 * 60 * 1000, 
    cacheTime:Infinity,
    retry: false,
  });
};