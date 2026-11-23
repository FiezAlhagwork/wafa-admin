"use client";

import { useQuery } from "@tanstack/react-query";
import { overviewKeys } from "./keys";
import { getOverview } from "./services";

export function useOverview() {
  return useQuery({ queryKey: overviewKeys.all, queryFn: getOverview });
}
