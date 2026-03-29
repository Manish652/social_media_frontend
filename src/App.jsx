import { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";
import './App.css';
import About from "./pages/About.jsx";
import BottomTab from "./components/common/BottomNav.jsx";
import Navbar from './components/common/Navbar.jsx';
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";
import LeftSidebar from "./components/layout/LeftSidebar.jsx";
import RightSidebar from "./components/layout/RightSidebar.jsx";
import { userAuth } from "./context/AuthContext.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import CreateReel from "./pages/CreateReel.jsx";
import CreateStory from "./pages/CreateStory.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Messages from "./pages/Messages.jsx";
import Notifications from "././components/common/Notification.jsx";
import Profile from "./pages/Profile.jsx";
import ProfilePublicView from "./pages/ProfilePublicView.jsx";
import Reels from "./pages/Reels.jsx";
import Saved from "./pages/Saved.jsx";
import Search from "./pages/Search.jsx";
import Signup from "./pages/Signup.jsx";
import SinglePostView from "./pages/SinglePostView.jsx";
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
      {(() => {
        const { token } = userAuth() || {};
        return token ? <BottomTab /> : null;
      })()}


    </>
  )
}

export default App;


