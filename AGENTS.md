# AGENTS.md

## Project purpose

This project is a static HTML/CSS/JavaScript tool for preparing monthly client meeting agendas for an accounting firm.

It must support:
- agenda creation
- previous meeting JSON import
- carry-forward of unresolved previous items
- current meeting JSON export
- Stock paste-ready summary generation
- separation between client-facing output and internal notes

## Non-goals

Do not implement:
- TKC replacement features
- director instruction PDF display
- CSV anomaly detection
- tax judgment automation
- Stock API integration
- Stock login automation
- scraping
- backend server
- cloud database
- external data transmission
- storage of real client data in the repository

## Data handling

Treat all client names, meeting notes, carry-forward items, and agenda data as confidential.

Rules:
- Use only dummy sample data.
- Do not include real client names.
- Do not include real accounting firm names.
- Do not include internal documents.
- Do not send data to external servers.
- Do not use localStorage as the authoritative storage for confidential data.
- The authoritative record is the JSON file attached to the relevant Stock note.

## Required workflow

The user must not proceed to agenda creation unless:
1. A valid previous JSON file has been imported; or
2. The user explicitly starts via an exception route and enters a reason.

Exception reasons:
- initial setup
- new client
- no previous meeting
- data migration period
- other

## JSON validation

Imported JSON must validate:
- schemaVersion exists
- clientCode exists
- targetMonth exists
- clientCode matches the entered client code
- targetMonth is the previous month of the current targetMonth, unless an exception reason is entered
- carry-forward items are well-formed

## Carry-forward rules

Carry forward only items where:
- carryForward is true
- status is not done
- status is not withdrawn

## Visibility rules

- visibility=client may appear in client-facing output
- visibility=internal must never appear in client-facing output
- internal output may include both client and internal items

## Review priorities

Prioritize serious issues:
- confidential data leakage
- accidental network transmission
- bypassing required previous JSON import
- incorrect carry-forward behavior
- internal notes appearing in client-facing output
- fragile month/date logic
- confusing Stock with this tool
- confusing TKC with this tool