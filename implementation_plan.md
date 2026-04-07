# Implementation Plan - Fix 'Free' Trade Requests and Transactions

The current system defaults all trade requests and transactions to "Free" because price fields are either not being collected in the UI, ignored by the backend routes, or missing from the database schema for certain entities.

## User Review Required

> [!IMPORTANT]
> I will be adding a `price_per_unit` column to the `trade_requests` table to support negotiated prices. If a trade request is created with an offered price, that price will be used for the final transaction instead of the listing's default price.

## Proposed Changes

### Database

#### [MODIFY] [schema.sql](file:///c:/Users/rajan/Desktop/ism_pg/database/schema.sql)
- Add `price_per_unit` to `trade_requests` table.
- I will run this via a direct SQL command as well to ensure the current DB is updated.

---

### Backend

#### [MODIFY] [waste.js](file:///c:/Users/rajan/Desktop/ism_pg/backend/routes/waste.js)
- Update `POST /` and `PUT /:id` to accept and save `price_per_unit` and `category`.
- Update `GET /` and `GET /:id` to return these fields.

#### [MODIFY] [resource.js](file:///c:/Users/rajan/Desktop/ism_pg/backend/routes/resource.js)
- Update `POST /` and `PUT /:id` to accept and save `price_per_unit` and `category`.
- Update `GET /` and `GET /:id` to return these fields.

#### [MODIFY] [tradeRequests.js](file:///c:/Users/rajan/Desktop/ism_pg/backend/routes/tradeRequests.js)
- Update `POST /` to accept and save `price_per_unit` (negotiated price).
- Update `POST /:id/accept` to use the price from the `trade_request` (negotiated) if available, otherwise fallback to the listing price.

---

### Frontend

#### [MODIFY] [WasteListingsPage.jsx](file:///c:/Users/rajan/Desktop/ism_pg/frontend/src/pages/WasteListingsPage.jsx)
- Add `pricePerUnit` and `category` fields to the create/edit waste listing form.
- Ensure the listing card displays the price correctly.

#### [MODIFY] [ResourceRequestsPage.jsx](file:///c:/Users/rajan/Desktop/ism_pg/frontend/src/pages/ResourceRequestsPage.jsx)
- Add `pricePerUnit` and `category` fields to the create/edit resource request form.

#### [MODIFY] [TransactionsPage.jsx](file:///c:/Users/rajan/Desktop/ism_pg/frontend/src/pages/TransactionsPage.jsx)
- Ensure the transaction value display logic handles the currency formatting consistently.

## Verification Plan

### Automated Tests
- I will use `curl` or a temporary script to:
  1. Create a waste listing with a price.
  2. Create a trade request for that listing with a negotiated price.
  3. Accept the trade request.
  4. Verify the resulting transaction has the correct `total_value`.

### Manual Verification
- Check the "Add Waste Stream" modal in the UI.
- Check the "Financial Ledger" page to see if transactions show the correct amounts.
