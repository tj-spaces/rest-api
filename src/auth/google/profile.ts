import axios from "axios";
import { client } from "./client";

export interface GoogleProfile {
  id: number; // A string of digits
  email: string;
  verified_email: boolean;
  name: string; // This is the full name
  given_name: string; // In most of Europe, this is the first name, e.g. John
  family_name: string; // In most of Europe, this is the last name, e.g. Cena
  picture: string; // URL to a profile photo
  locale: "en"; // The user's preferred language
}
