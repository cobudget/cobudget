// Example row of the CSV template. The content is the sample proposal we
// share with the client (context repo: give-it-a-go/resources/giag-sample-proposal.pdf,
// "Hydrology", GF10), so they can see how the PDF sections map to columns.
// Values for the Give it a Go preset fields are matched by importKey
// (server/services/roundFieldPreset.ts); other keys fall back to generic
// examples in prepareImport.buildTemplateCsv.
// Long-text fields are Markdown: a blank line starts a paragraph, "**bold**",
// "- item" lists and links work. A single line break inside a paragraph is
// NOT kept when displayed (use a blank line or a list).

export const sampleBuiltIn = {
  title: "Hydrology",
  // The PDF has no summary: like the July import, it is the start of the
  // project description (about 160 characters).
  summary:
    "1 year’s funding for hiring an accessible Hydrotherapy pool that caters to the needs of our most physically and cognitively complex, vulnerable...",
  budget: [{ description: "Venue hire", amount: "4708" }],
};

export const sampleByKey: Record<string, string> = {
  "reference-code": "GF10",
  "priority-area": "Community",
  "report-date": "19.06.26",
  assessor: "Key Fund",
  "key-fund-comments": `The applicant needs to submit accounts and a bank statement prior to drawdown.

**Summary:**
Hydrology sessions for people who have the most physical and complex disabilities in Grimsby and surrounding areas. Please note that the attendees must travel to Humberston as this is the only facility for these sessions in the area.

**Strengths:**
These are the only sessions for disabled people to access Hydrology session who are being supported by this organisation.

**Opportunities:**
The applicant has said that it would be further grant funded but will also look to set up donations.

**Questions to ask:**
Is this something that you think is needed in Grimsby.
The attendees must travel due to location; can this programme support a new venue in Grimsby and work with the applicant?`,
  "project-description": `1 year’s funding for hiring an accessible Hydrotherapy pool that caters to the needs of our most physically and cognitively complex, vulnerable population of people.

2.5hrs once per week every week. 50 weeks of the year.`,
  "what-trying-to-achieve": `This project directly impacts on the quality of life of this specific population of people living in and around Grimsby.
It provides safe and supported opportunity for freedom of movement in warm water for those who are generally limited to a wheelchair – Maintain their physical function, strength and mobility. It provides a much-needed opportunity for rehabilitation where traditional land-based Physiotherapy is unsuccessful no matter how creative.
People from Grimsby and highlighted postcodes are invited regularly to these sessions. But ethically we cover the whole of North East Lincolnshire.
8 people are invited for a course of 8 weeks of hydrotherapy from a waiting list that is categorised in terms of need/priority/risk – whilst also considering the availability of accessible changing facilities.
Specific criteria of need also apply.

Individualised goals that can be achieved in this setting following illness or injury and the progress people make within an activity they are able to engage in ensures our complex people have equal and fair opportunity in lead fulfilling lives.`,
  "who-what-how-long": `This project directly impacts on the quality of life of this specific population of people living in and around Grimsby.
It provides safe and supported opportunity for freedom of movement in warm water for those who are generally limited to a wheelchair – Maintain their physical function, strength and mobility.`,
  "safety-measures": `- Individualised medical screening and risk assessments completed
- Supported by staff/family that know the person well. We follow venue risk assessment
- HP School look after and maintain the pool and its equipment including overhead tracking hoist systems.
- Evacuation procedures planned as part of the initial assessment`,
  "who-benefits": `People with severe/profound Learning Disabilities with/without Autism
All have varying levels of physical and intellectual disabilities`,
  sustainability: `The venue hire is an annual cost.
Charitable funding and applications will need to be sourced with ongoing public donations via gofundme.`,
};
