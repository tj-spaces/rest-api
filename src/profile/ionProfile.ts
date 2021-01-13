export interface IonProfile {
  id: number;
  ion_username: string; // eg "2022mfatemi"
  sex: string; // Capitalized
  title: null;
  display_name: string; //
  short_name: string;

  // Given name
  first_name: string;

  // Middle name
  middle_name?: string;

  // Family name
  last_name: string;

  nickname?: string;

  // Internal TJ email (@tjhsst.edu)
  tj_email: string;

  // Other external personal emails
  emails: string[];

  grade: {
    number: number;
    name: string; // freshman, sophomore, junior, senior
  };

  graduation_year?: number;

  user_type: "student" | "teacher" | "";

  phones: string[]; // eg "Mobile Phone: XXXXXXXXXX", including the text "Mobile Phone"

  websites: string[];

  counselor?: {
    id: number;

    // Url to API endpoint for profile info
    url: string;

    user_type: "counselor";
    username: string;
    full_name: string;
    first_name: string;
    last_name: string;
  };

  address: string | null;

  /** DO NOT USE */
  picture: string; // URL of the profile photo of the user. Seems to give empty photos right now.

  is_eighth_admin: boolean;
  is_announcements_admin: boolean;
  is_teacher: boolean;
  is_student: boolean;

  // 8th period absences count
  absences: number;
}
