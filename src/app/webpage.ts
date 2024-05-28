import { Page } from './page';

export interface Webpage {
  _id: string;
  url: string;
  registered: Date;
  lastEvaluation: Date;
  status: string;
  pages: Page[];
  totalPages: number;
  pagesWithoutErrors: number;
  pagesWithErrors: number;
  pagesWithAError: number;
  pagesWithAAError: number;
  pagesWithAAAError: number;
  top10Errors: Map<string, number>;
}
