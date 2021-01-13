export interface User {
  id: string; // A string of digits
  email: string;
  verifiedEmail: boolean;
  name: string; // This is the full name
  givenName: string; // In most of Europe, this is the first name, e.g. John
  familyName: string; // In most of Europe, this is the last name, e.g. Cena
  picture: string; // URL to a profile photo
  locale: "en"; // The user's preferred language
}
