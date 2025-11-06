export type Rule = {
  id: number | null;
  name: string;
  isActive: boolean;
  value?: string | number | null;
};