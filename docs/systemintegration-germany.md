# Positioning for IT-Systemintegration in Germany

Research checked: 15 November 2026. The sample below is directional, not a
complete labour-market survey. Requirements vary by employer and role.

## Positioning used

**Berufsziel: IT-Systemintegration — Linux, Netzwerke & Container.**

The portfolio leads with an entry goal, German copy and the existing German CV.
It does not call the candidate an IHK-qualified Fachinformatiker or an experienced
system administrator. Until the desired route is confirmed, the headline does
not commit to either an Ausbildung or a junior vacancy.

## Requirements and evidence

| Area | Existing basis in the supplied project history | Next evidence to produce |
| --- | --- | --- |
| Automation and integration | Scripts Studio: Python/PowerShell, subprocesses, external tools, logs | Sanitized script, usage instructions, example output and failure case |
| Applications and deployment | AIRBCAR: Django/PostgreSQL, Docker, GitHub Actions | Architecture, dependencies, deployment and rollback notes |
| Networks | NetPractice (10/2023): IPv4, CIDR, routing, misconfiguration analysis, all 10 levels | Sanitized exercise diagram and a narrated diagnosis; next add DNS/DHCP in an integrated lab |
| Windows and identities | ft_transcendence: OAuth 2.0/JWT/2FA; application authentication is not AD administration | Windows test domain, users/groups/GPO, access matrix, onboarding/offboarding test |
| Linux and virtualization | Born2beroot (12/2022): Debian/VirtualBox, SSH/UFW, password/sudo policy, cron monitoring, bonus web stack | Configuration excerpts, monitoring output and a short explanation of security decisions |
| Containers and services | Inception (03/2025): Compose, Nginx/WordPress/MariaDB, TLS, volumes, networks and secrets | Service diagram, sanitized Compose configuration and explanation of persistence versus backups |
| Server communication | ft_irc (02/2025): C++98, TCP sockets, standard-client compatibility | Client/server walkthrough and protocol explanation |
| Team integration | ft_transcendence (04/2025): Django/WebSockets/PostgreSQL/Docker | Identify personal contributions separately from the shared team result |
| Support and documentation | Logs and validation in a local tool project | Example incident: symptoms, hypothesis, checks, root cause, resolution, user update |
| Availability and security | Born2beroot monitoring and hardening; Inception TLS/secrets; no completed backup/restore evidence supplied | Extend monitoring to incident handling and add a verified backup restore |
| Microsoft 365 / Entra ID | No administration evidence supplied | Test tenant exercise if legitimately available, documented user/license workflow |
| Communication | German B2 and English C1 from the existing portfolio | Clear German case study and a short verbal walkthrough; do not imply a certificate unless supplied |

These are recommendations for what to build and document, not assertions that
the candidate already meets the listed requirements. Keep the website and CV
consistent. Verify dates and language evidence before sending applications.

## Ausbildung versus junior entry

For an **Ausbildung**, emphasize technical interest, learning ability, a clear
motivation for Systemintegration and examples of careful problem solving.
The official occupational profile includes planning and operating systems,
troubleshooting, documentation and user support. The recognised Ausbildung is
normally three years. [Bundesagentur für Arbeit](https://web.arbeitsagentur.de/berufenet/beruf/steckbrief/7847),
[Bechtle technical training](https://www.bechtle.com/karriere/schueler/ausbildung).

For a **junior job**, check the actual vacancy before presenting fit. The HEIM
posting sampled asks for Windows/AD practice, network fundamentals, scripting
and Microsoft 365 knowledge, along with a completed relevant qualification or
comparable practical qualification. It also explicitly asks for C1 German:
the current B2 profile does not meet that particular language request. This is
one employer's requirement, not a universal German threshold.
[HEIM employer posting via BA](https://www.arbeitsagentur.de/jobsuche/jobdetail/21193-0068716703-S).

Another junior support posting includes incident handling, account lifecycle,
group policies and Microsoft 365. This supports giving user support and
documentation equal visibility alongside scripting.
[Leue & Nill employer posting via BA](https://www.arbeitsagentur.de/jobsuche/jobdetail/10001-1003577991-S).

The IHK profile also stresses reliable operation, security, availability,
user assistance and documented project decisions. The proposed lab evidence
is our practical translation of those areas, not an official IHK assessment
or endorsement. [IHK Ostwestfalen](https://www.ihk.de/ostwestfalen/berufsbildung/ausbildung/berufe-a-z/fachinformatiker-in-systemintegration-6780282).

## First lab milestone

Build on Born2beroot, Inception and NetPractice in a shared isolated test
environment. Document an IP plan, DNS/service fault and the existing service
configuration. Add a backup and record a successful restore, then extend the
environment with Windows AD and documented support/monitoring exercises.
Use synthetic test users and sanitized screenshots. Mark every step planned,
in progress or verified according to what actually happened.

The current external German PDF is linked as supplied; this task does not edit
the PDF. Confirm the target route, preferred location, start date, actual
administration experience and any certificates before personalising these
details. No relocation, work-authorisation or qualification-recognition claim
has been added.

## Evidence provenance

The five additional projects, dates and technology lists were supplied directly
by the user on 15 November 2026. No repository URLs or screenshots were supplied
for them. The website therefore describes their supplied scope without invented
links, measured uptime, production responsibility or certifications. It uses
project practice rather than a completed German qualification as its claim.
Repository/configuration evidence can be linked when supplied. The 3D project
screens are illustrative interfaces, not screenshots of those projects.
