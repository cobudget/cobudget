// Default custom fields of every new round: the Give it a Go set (it replaces
// the platform's former single "Description" field; the July import rounds had
// no such field either). A preset: admins can edit, reorder or delete any of
// them. Keys are explicit (short CSV column names, unique within the set and
// clear of the built-in import columns).
// Reference Code is the unique identifier for the CSV import: its values must
// be unique per round and become tags. Nothing else about it is enforced.

type PresetField = {
  name: string;
  importKey: string;
  description: string;
  type: "TEXT" | "MULTILINE_TEXT" | "ENUM";
  options?: string[];
  isUniqueIdentifier?: boolean;
};

export const PRIORITY_AREAS = [
  "Arts and Culture",
  "Beautiful Built Environment",
  "Green Economy",
  "Connected to Nature",
  "Secure Homes & Lives",
  "Community",
  "Education & Opportunities",
  "Thriving Town Centre",
  "Other",
];

export const roundFieldPreset: PresetField[] = [
  {
    name: "Reference Code",
    importKey: "reference-code",
    description: "Unique code for the proposal, e.g. GF10",
    type: "TEXT",
    isUniqueIdentifier: true,
  },
  {
    name: "Priority Area",
    importKey: "priority-area",
    description: "The priority area the proposal belongs to",
    type: "ENUM",
    options: PRIORITY_AREAS,
  },
  {
    name: "Report Date",
    importKey: "report-date",
    description: "Date of the assessment report",
    type: "TEXT",
  },
  {
    name: "Assessor",
    importKey: "assessor",
    description: "Name of the assessor",
    type: "TEXT",
  },
  {
    name: "Key Fund's Comments",
    importKey: "key-fund-comments",
    description: "Key Fund's commentary (Markdown supported)",
    type: "MULTILINE_TEXT",
  },
  {
    name: "Project Description",
    importKey: "project-description",
    description: "Description of the project (Markdown supported)",
    type: "MULTILINE_TEXT",
  },
  {
    name: "What are they trying to achieve in the project?",
    importKey: "what-trying-to-achieve",
    description: "What the applicant is trying to achieve",
    type: "MULTILINE_TEXT",
  },
  {
    name: "Who will do what? How long will it take? How do you make sure?",
    importKey: "who-what-how-long",
    description: "Who does what, how long it takes, quality assurance",
    type: "MULTILINE_TEXT",
  },
  {
    name:
      "How will you make sure that people that engage in the activity are safe?",
    importKey: "safety-measures",
    description: "How participant safety is ensured",
    type: "MULTILINE_TEXT",
  },
  {
    name: "Who is the main group of people that will benefit from the project?",
    importKey: "who-benefits",
    description: "Main group of people who benefit",
    type: "MULTILINE_TEXT",
  },
  {
    name: "How will the activity continue after the grant has been spent?",
    importKey: "sustainability",
    description: "How the activity continues after the grant",
    type: "MULTILINE_TEXT",
  },
];

/** Prisma nested-create data for Round.fields (positions follow 1001, 1002, ...). */
export const roundFieldPresetCreateData = () =>
  roundFieldPreset.map((f, i) => ({
    name: f.name,
    importKey: f.importKey,
    description: f.description,
    type: f.type,
    options: f.options ?? [],
    isRequired: false,
    isUniqueIdentifier: !!f.isUniqueIdentifier,
    position: 1001 + i,
  }));
