import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import VenuesPage from "./components/VenuesPage";
import CakePage from "./components/CakePage";
import DJ from "./components/DJ";
import DecorPage from "./components/DecorPage";
import PhotographersPage from "./components/PhotographersPage";
import VenueOwnerPage from "./components/VenueOwnerPage";
import AdminPage from "./components/AdminPage";
import LoginPage from "./components/LoginPage";
import RegistrationPage from "./components/RegistrationPage";
import VerifyPage from "./components/VerifyPage";
import OwnerPage from "./components/OwnerPage";
import HallRegestration from "./components/HallRegestration";
import VenueDetails from "./components/VenueDetails";
import UserPage from "./components/UserPage";
import AddBookingByOwnerHall from "./components/AddBookingByOwnerHall"; 
import SeeBookingDetailsHall from "./components/SeeBookingDetailsHall";
import CakeOwnerPage from "./components/CakeOwnerPage";
import OwnerSearchBookings from "./components/OwnerSearchBookings";
import CakeProfile from "./components/Cakeprofile";
import Cakevisit from "./components/Cakevisit";
import CakeManageItems from "./components/CakeManageItems";
import VisitFormHall from "./components/VisitFormHall";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/VenuesPage" element={<VenuesPage />} />
      <Route path="/CakePage" element={<CakePage />} />
      <Route path="/DJ" element={<DJ />} />
      <Route path="/DecorPage" element={<DecorPage />} />
      <Route path="/PhotographersPage" element={<PhotographersPage />} />
      <Route path="/VenueOwnerPage" element={<VenueOwnerPage />} />
      <Route path="/AdminPage" element={<AdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/RegistrationPage" element={<RegistrationPage />} />
      <Route path="/VerifyPage" element={<VerifyPage />} />
      <Route path="/OwnerPage" element={<OwnerPage />} />
      <Route path="/HallRegestration" element={<HallRegestration />} />
   <Route path="/venue/:userId" element={<VenueDetails />} />
      <Route path="/UserPage" element={<UserPage />} />
      <Route path="/AddBookingByOwnerHall" element={<AddBookingByOwnerHall />} />
      <Route path="/SeeBookingDetailsHall" element={<SeeBookingDetailsHall />} />
     <Route path="/CakeOwnerPage/:ownerId" element={<CakeOwnerPage />} />

      <Route path="/OwnerSearchBookings/:ownerId" element={<OwnerSearchBookings />} />

      <Route path="/Cakeprofile" element={<CakeProfile />} />
      <Route path="/Cakevisit" element={<Cakevisit />} />
      <Route path="/CakeManageItems" element={<CakeManageItems />} />
      <Route path="/VisitFormHall" element={<VisitFormHall />} />


    </Routes>
  );
}

export default App;
