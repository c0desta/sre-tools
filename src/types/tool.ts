export interface Tool {
  id: string;
  title: string;
  description: string;
  path: string;
  component: React.ComponentType;
  icon?: string;
  category?: string;
}
