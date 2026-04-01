import React, { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";
import './App.css';
import BottomTab from "./components/common/BottomNav.jsx";
import Navbar from './components/common/Navbar.jsx';
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";
import LeftSidebar from "./components/layout/LeftSidebar.jsx";
import RightSidebar from "./components/layout/RightSidebar.jsx";
import Skaliton from "./components/layout/Skaliton.jsx";
import { userAuth } from "./context/AuthContext.jsx";

const About = lazy(() => import("./pages/About.jsx"));
const CreatePost = lazy(() => import("./pages/CreatePost.jsx"));
const CreateReel = lazy(() => import("./pages/CreateReel.jsx"));
const CreateStory = lazy(() => import("./pages/CreateStory.jsx"));
const ErrorPage = lazy(() => import("./pages/ErrorPage.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Messages = lazy(() => import("./pages/Messages.jsx"));
const Notifications = lazy(() => import("./components/common/Notification.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const ProfilePublicView = lazy(() => import("./pages/ProfilePublicView.jsx"));
const Reels = lazy(() => import("./pages/Reels.jsx"));
const Saved = lazy(() => import("./pages/Saved.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const SinglePostView = lazy(() => import("./pages/SinglePostView.jsx"));
function App() {
  const location = useLocation();
  const hideLayout = ["/login", "/signup"].includes(location.pathname);
  const { token } = userAuth() || {};
  return (
    <>
      <Toaster />
      {!hideLayout && <Navbar />}
      {!hideLayout && token && <LeftSidebar />}
      {!hideLayout && token && <RightSidebar />}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Skaliton /></div>}>
        <Routes>



          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path='/login'
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path='/signup'
            element={<Signup />}
          />
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/u/:id'
            element={
              <ProtectedRoute>
                <ProfilePublicView />
              </ProtectedRoute>
            }
          />
          <Route
            path='/create-post'
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path='/create-reel'
            element={
              <ProtectedRoute>
                <CreateReel />
              </ProtectedRoute>
            }
          />
          <Route
            path='/create-story'
            element={
              <ProtectedRoute>
                <CreateStory />
              </ProtectedRoute>
            }
          />
          <Route
            path='/reels'
            element={
              <ProtectedRoute>
                <Reels />
              </ProtectedRoute>
            }
          />
          <Route
            path='/search'
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path='/messages'
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path='/notifications'
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path='/saved'
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />
          <Route path='/about' element={<PublicRoute><About/></PublicRoute>}  />

          <Route
            path='/post/:postId'
            element={
              <ProtectedRoute>
                <SinglePostView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<ErrorPage />} />
          {/* <Route path="/__ping" element={<div style={{padding: 20}}>PING OK</div>} /> */}
        </Routes>
      </Suspense>
      {(() => {
        const { token } = userAuth() || {};
        return token ? <BottomTab /> : null;
      })()}


    </>
  )
}

export default App;


