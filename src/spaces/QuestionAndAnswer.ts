export interface Question {
  id: string;
  senderID: string;
  text: string;
  answers: Answer[];
  markedAsAnswered: boolean;
}

export interface Answer {
  senderID: string;
  text: string;
}
