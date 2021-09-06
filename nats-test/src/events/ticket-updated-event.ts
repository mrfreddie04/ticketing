import { Subjects } from "./subjects";

export interface TicketCreatedEventData {
  id: string;
  title: string;
  price: number;  
  userId: string;
};

export interface TicketUpdateEvent {
  subject: Subjects.TicketUpdated;
  data: TicketCreatedEventData;
};