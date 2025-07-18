export interface AvailableModule {
  name: string;
  description: string;
  homepage: string;
  source: string;
  version: string;
  releases: string[];
}

export type Restriction = ">=" | "==" | "<=" | "<" | ">";

export const POSSIBLE_RESTRICTIONS: Restriction[] = [
  ">=",
  "==",
  "<=",
  "<",
  ">",
];
export const DEFAULT_RESTRICTION: Restriction = ">=";
