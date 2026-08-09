export interface ProgramStep {
  _id: string;
  time: string;
  title: string;
  description: string;
  section: string;
}

export interface WeddingInfo {
  date: string;
  dateLabel: string;
  ceremonyTime: string;
  location: string;
  mapUrl: string;
  dressCode: string;
  programSummary: string;
  programDetailed: ProgramStep[];
  coupleMessage: string;
  coupleImage: string;
  quote: string;
  quoteSource: string;
  giftRegistry: string[];
}
