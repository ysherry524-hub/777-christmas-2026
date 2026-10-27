/*
 * 777 Tower — Christmas 2026 invitation content.
 * Every word shown on the page comes from this file. Edit here only.
 *
 * Menus: leave as null to show the "to be announced" note.
 * When confirmed, replace null with sections, e.g.
 *
 *   foodMenu: [
 *     { title: "Appetizers", items: [
 *         { name: "Dish name", description: "Short description" }
 *     ] },
 *     { title: "Main Courses", items: [ ... ] },
 *     { title: "Sides", items: [ ... ] },
 *     { title: "Desserts", items: [ ... ] }
 *   ],
 *
 *   beverageMenu: [
 *     { title: "Signature Drinks", items: [ ... ] },
 *     { title: "Wine", items: [ ... ] },
 *     { title: "Beer", items: [ ... ] },
 *     { title: "Non-Alcoholic Beverages", items: [ ... ] }
 *   ],
 *
 * Only list sections that are actually confirmed; `description` is optional.
 */
window.EVENT = {
  building: "777 Tower",
  city: "Los Angeles",
  cityState: "Los Angeles, California",
  organizer: "Fair Ranch Xia LLC",

  title: "A Season of Gratitude",
  subtitle: "A Christmas Celebration at 777 Tower",
  body: [
    "As the year draws to a close, we warmly invite our tenants to gather for an evening of festive cheer, good company, and appreciation.",
    "Thank you for being a valued part of the 777 Tower community. We look forward to celebrating the season together."
  ],
  closing: "With warmest wishes for the holiday season.",

  date: "2026-12-09",
  displayDate: "Wednesday, December 9, 2026",
  time: "4:00 PM – 6:00 PM",
  displayTime: "4:00 – 6:00 PM",
  timezone: "America/Los_Angeles",
  location: "777 Tower, Los Angeles, California",
  // Replace with the room / floor once confirmed, e.g. "Ninth Floor Conference Center"
  venueDetail: "Exact event location to be announced.",

  foodMenu: null,
  beverageMenu: null,
  foodMenuTitle: "Dining Menu",
  beverageMenuTitle: "Beverage Selection",
  foodMenuPending: "Menu details to be announced",
  beverageMenuPending: "Beverage selections to be announced",

  // Envelope screen
  envelopeKicker: "777 Tower · Los Angeles",
  envelopeHeading: "A Special Invitation Awaits",
  envelopeHint: "Click the seal to open.",
  envelopeHintTouch: "Tap the seal to open.",

  invitationUrl: "https://777tower.space/christmas-2026"
};
