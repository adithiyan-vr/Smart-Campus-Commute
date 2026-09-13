# 🚗 Smart Carpool

**Share the Ride. Share the Journey.**

A web app that connects commuters heading the same way so they can share rides — matched by route, time, and seats available.

Built for the **Smart Mobility & Transportation** track at the ODESSA hackathon.

---

## 📖 Overview

Urban commuters — students, office-goers, daily travelers — often drive the same route as dozens of other people, alone. This causes avoidable traffic, pollution, and fuel expense. **Smart Carpool** gives commuters a simple, localized way to post or find a shared ride in a few taps.

## ❗ Problem Statement

There is no simple, trustworthy way for people traveling the same route to find each other and share a ride, resulting in unnecessary single-occupancy trips, traffic congestion, and higher commuting costs.

## 👥 Who It's For

- College students commuting to campus
- Office employees with fixed daily routes
- Occasional travelers heading to the same event/city
- Drivers with empty seats willing to share fuel cost

## ✨ Key Features (MVP)

- 🔐 **Signup / Login** — email-based account creation
- 👤 **Profile** — name, phone, vehicle info for drivers
- ➕ **Offer a Ride** — post source, destination, date/time, seats, price
- 🔍 **Find a Ride** — search by source, destination, and date
- 🧭 **Ride Matching** — see rides that fit your route
- 📄 **Ride Details** — driver info, route, seats left, book button
- ✅ **Booking** — confirms a ride and updates seats left
- 📊 **Dashboard** — "My Offered Rides" and "My Booked Rides"

**Not in this build (future scope):** real-time chat, live GPS tracking, in-app payments, route-optimization algorithms.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, Tailwind CSS |
| Backend / Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Maps & Location | Leaflet.js + OpenStreetMap |
| Hosting | Firebase Hosting / Netlify / Vercel |
| Version Control | Git + GitHub |

## 📁 Project Structure

```
smart-carpool/
├── index.html            # Landing page
├── login.html             # Login / Signup
├── dashboard.html          # Post-login home
├── offer-ride.html         # Offer a Ride form
├── find-ride.html          # Find a Ride search + results
├── details.html            # Ride details page
├── profile.html            # User profile
├── app.js                  # Core app logic / Firebase integration
├── Design System/          # Style guide, colors, typography reference
├── package.json
├── package-lock.json
└── PRD.txt                 # Product requirements notes
```

## 🗄️ Data Model (Firestore Collections)

**users**
`uid, name, email, phone, isDriver, vehicleInfo`

**rides**
`rideId, driverId, source, destination, date, time, totalSeats, seatsLeft, pricePerSeat, notes, status`

**bookings**
`bookingId, rideId, passengerId, seatsBooked, bookingDate, status`

## 🎨 Design

- **Primary:** `#2563EB` (trust / travel blue)
- **Secondary:** `#16A34A` (eco green)
- **Accent:** `#F59E0B` (amber, used for CTAs)
- **Typography:** Poppins/Inter for headings, Inter for body text
- Clean, rounded cards, soft shadows, mobile-first responsive layout

## 🚀 Getting Started

```bash
# Clone the repository
git clone <your-repo-url>
cd smart-carpool

# Install dependencies
npm install

# Run locally
npm run dev
# — or, if there's no dev script, just open index.html in your browser
```

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password sign-in
3. Create a **Firestore Database** (start in test mode for the hackathon)
4. Copy your Firebase config into `app.js`
5. (Optional) Set up **Firebase Hosting** for deployment: `firebase init hosting` → `firebase deploy`

## 🧭 User Journey

`Landing → Login/Signup → Dashboard → Find/Offer a Ride → Ride Details → Booking Confirmed`

## 🗺️ Roadmap

- [ ] In-app chat between driver and passenger
- [ ] Live ride tracking on the map
- [ ] Payment integration (UPI / card)
- [ ] Ratings & reviews after each ride
- [ ] Smarter route matching using geocoded distance

## 🙌 Built With

A team project built during the **ODESSA** hackathon, under the **Smart Mobility & Transportation** domain.

## 📄 License

Add a license of your choice (e.g. MIT) before making this repository public.
