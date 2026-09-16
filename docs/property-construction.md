# Home construction reference and scope

Updated September 16, 2026.

## 20171 Allentown Drive

The listing aerial and floor-plan image were visually reviewed. They establish a broad street-facing bar, a rear bedroom wing, a smaller family-room projection, rooftop solar arrays, a recessed entrance, projecting front windows, and an angular pool with a round spa. The model uses these exterior relationships at approximate game scale. It does not claim surveyed dimensions, structural members, or verified service routes.

Public reference: https://www.realtor.com/rentals/details/20171-Allentown-Dr_Woodland-Hills_CA_91364_M16717-61083

## 20536 Chatsboro Drive

The front listing image and the property-highlighted satellite map on Redfin were visually reviewed. The earlier model incorrectly spread the garage across the street frontage. The revised model places the long garage wing along the side of the lot, facing a recessed forecourt, with a rear cross wing and pool behind. Roof junctions, distances, and vegetation remain approximations; trees obscure some exterior boundaries. No verified interior floor plan was available. The owner subsequently supplied a photograph confirming three garage openings with four-car capacity: single, double, and single. The garage wing, door proportions, recessed panels, brick piers, and dark horizontal trim were revised from that photo. The personal photo is not included in the published site.

Public reference: https://www.redfin.com/CA/Woodland-Hills/20536-Chatsboro-Dr-91364/home/4238641
Front photo/listing: https://www.coldwellbankerhomes.com/ca/woodland-hills/20536-chatsboro-dr/pid_65334193/

## Fictional homes

The other estate designs are original interpretations of Woodland Hills estate architecture, including Spanish, Mission, Hacienda, Tudor, Cape Cod, French country, Colonial, and contemporary styles. They are not claimed to reproduce any particular neighboring property.

## Construction teaching

Lessons illustrate concrete footings, below-floor drains and water supply, slab, wood studs and headers, upper-floor joists where applicable, wood roof framing, rough services, sheathing and weather protection, roof underlayment, windows, insulation and wall finishes, roof covering, trim, paving, and landscape. Stages deliberately simplify real work; actual scheduling, inspections, engineering, materials, and code requirements vary. These are educational assemblies, not construction documents or statements about concealed systems in the actual homes.

LADBS inspection reference: https://dbs.lacity.gov/services/inspection
LADBS homeowner guide: https://www.ladbs.org/docs/default-source/publications/misc-publications/homeowners-guide-to-permits-inspections.pdf?sfvrsn=12

## Save compatibility

Unversioned numeric construction steps retain the published legacy assembly order. New residential lessons store constructionVersion 2. An unfinished legacy lesson only switches when the player explicitly chooses Start the new construction lesson. Completing and replaying a home uses the new lesson. Existing lots, transforms, saved balances, and collections are not reset.


## Owner walkthrough refinement, September 16
Allentown's owner-supplied video was reviewed locally. Exterior additions include a dark slatted patio cover, rear glazed doors, separate paving slabs with lawn joints, a compact wood playhouse with blue slides, and a low flowering rear border. Pool placement was adjusted to leave space for the covered terrace. These remain game-scale approximations; the original video and extracted frames are not distributed.

Home lessons now optionally divide structural assemblies into at most eight smaller placements per stage. `constructionPieces` stores progress within the existing `constructionStep`; `constructionDetail` stores the mode. Major stage IDs and indexes remain unchanged. Reloading resumes the next smaller piece. Turning the option off returns the current unfinished stage to assembly mode. Starting a completed home again clears the smaller-piece counter.

Chatsboro's owner photograph also informed the tall arched leaded window, three faces of turret glazing, and roof finial. The older Realty.com listing now redirects to a public-record page with a street-view image rather than its former photo gallery. No verified Chatsboro floor plan was found.
