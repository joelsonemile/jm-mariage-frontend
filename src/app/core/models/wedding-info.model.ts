export interface ProgramStep {
  time: string;
  title: string;
  description: string;
}

export interface WeddingInfo {
  date: string;
  dateLabel: string;
  ceremonyTime: string;
  location: string;
  dressCode: string;
  programSummary: string;
  programDetailed: ProgramStep[];
  coupleMessage: string;
  coupleImage: string;
  quote: string;
  quoteSource: string;
  giftRegistry: string[];
}
