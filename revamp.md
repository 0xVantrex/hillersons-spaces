1. User Roles

We need roles like:

Admin (Hillersons owner)

Vendor/Seller (can list lands/houses/books/plans)

BNB Host

Contractor

Normal Customer

2. Core System = ONE Marketplace Engine

Instead of building 10 platforms, you build one listing system with categories.

Listing Types:

House Plan

Land

House

BNB

Book

Service (construction/contractor)

Each listing has common fields:

title

description

images

price

location (if needed)

sellerId

status (pending/approved/rejected)

featured (true/false)

createdAt

Then type-specific fields are added.

3. Vendor Dashboard (MOST IMPORTANT)

You need a portal like:

dashboard.hillersons.com

Where sellers can:

create listings

upload photos

manage bookings (BNB)

view orders (books/plans)

pay for ads

see analytics

Admin can:

approve listings

approve ads

ban users

manage payments/commission

4. How Hillersons Makes Money 

This is the main point.

They can monetize via:

Commission per sale (plans/books)

Commission per booking (BNB)

Listing fee (land/houses)

Featured listing payment

Ads payment

Subscription model for agents/contractors

That’s how you build wealth not just a site.

5. Key Feature: Approval System

Don’t let anyone post directly.

Flow:
Seller submits listing → Admin approves → Goes live.

This prevents scammers.

6. Payments

Two options:

Option A (Hillersons collects payment)

Customer pays Hillersons → Hillersons takes commission → sends seller remainder.

Option B (Seller receives payment)

Customer contacts seller directly, Hillersons just charges listing/ads fee.

Option A makes more money but is harder legally + technically.



Alright, here’s the custom phase plan for your current Hillersons site, starting from what you already have (plans fully working). This focuses only on the new stuff you need to add.

Phase 1: Add New Listing Categories (1–2 weeks)

Goal: extend your existing marketplace for all other listings.

 Tasks:

Add new categories to the listings model:

Land

House

Book

BNB

Service (construction/contractor)

Add type-specific fields:

Land: size, location, title deed status

House: bedrooms, bathrooms, amenities, location

Book: author, genre, file/url for download

BNB: check-in/check-out, max guests, calendar

Service: description, package/pricing, contact info

Extend API endpoints for CRUD with category filter

Admin approval system works for all new listings

Output: Platform now supports all listing types. Vendors can add lands, houses, books, BNB, and services.

Phase 2: Orders & Payments for New Categories (1 week)

Goal: make transactions work for books, lands, houses.

 Tasks:

Extend your existing payment/order system

Assign payment types per category (one-time purchase for books/plans, booking/payment for BNB, inquiry for lands/houses)

Store orders in DB

Admin dashboard shows all orders

Output: Vendors can get paid and users can buy/list securely.

Phase 3: BNB Booking System (2–3 weeks)

Goal: Airbnb-style booking with availability.

 Tasks:

Booking table/model (check-in/out, userId, listingId, status)

Check availability before confirming booking

Vendor dashboard to manage bookings

Payment + confirmation

Optionally, add reminders via email

Output: BNB listings are live and bookable.

Phase 4: Ads & Featured Listings (1–2 weeks)

Goal: allow vendors to pay for visibility.

 Tasks:

Add featured flag for listings

API to set featured status (admin approves)

Track payment for ads (integrate with payment system)

Display featured listings on frontend

Output: Platform monetizes from sponsored listings.

Phase 5: Contractor/Service Listings (1 week)

Goal: showcase building/construction services.

 Tasks:

Vendors can create service listings

Admin approval workflow

Users can submit service requests (form -> vendor)

Dashboard for vendor to see requests

Output: Contractors can promote services and get leads.

Phase 6: Optional Reviews & Trust (1–2 weeks)

Goal: add credibility & trust.

 Tasks:

Add review model (user, listingId, rating, comment)

Only allow reviews if user purchased/used service

Aggregate rating for each listing

Output: Platform is more professional and trustworthy.

Phase 7: Smart Lock / Biometric BNB Integration (2–4 months)

Goal: only verified hand can unlock doors.

 Tasks:

WebAuthn/FIDO2 registration for users

Generate unlock tokens after biometric verification

Smart lock API integration

Logging & auditing

Output: Elite BNB feature live. Can be delayed until after main marketplace is stable.


**Reasons for not using shopify**
❌ BNB bookings
❌ land deposits
❌ contractor quoting
❌ multi-vendor commissions

COMPLETED

House Plans — full listing, purchase, admin upload, display


PHASE 2 — BNB (current focus)
Backend:

BNB listing model fields (already in Listing.js — just needs activation)
BNB-specific routes (create, get all, get one)
Booking system — check availability, create booking, cancel booking
Booking model (checkIn, checkOut, guestId, listingId, status, amount)
Admin can list their own BNBs (same as vendors)
Calendar/availability logic — prevent double booking

Frontend:

BNB browse page — shows all approved BNBs (admin + vendor listings together)
BNB detail page — photos, amenities, pricing, availability calendar, book now
Booking form — pick dates, guests, confirm
My Bookings page — user sees their bookings
Vendor dashboard — BNB host sees their listings + bookings + earnings
Admin dashboard — see all BNBs + all bookings

Payments:

M-Pesa STK push for BNB deposit/full payment
Payment confirmation + booking confirmation email


PHASE 3 — Land listings

Land model fields
Browse + detail page
Inquiry system (no direct payment — contact agent)
Admin approval


PHASE 4 — Houses for sale/rent

House model fields
Browse + detail page
Inquiry / viewing request system


PHASE 5 — Books

Book model fields
Digital download after M-Pesa payment
Physical copy order system


PHASE 6 — Services / Contractors

Service listing
Quote request form
Contractor dashboard


PHASE 7 — Monetization layer

Featured listing payments
Subscription plans for vendors (free/basic/pro)
Commission tracking
Vendor earnings dashboard


PHASE 8 — Reviews + Trust

Reviews on listings
Verified vendor badges
Rating aggregation