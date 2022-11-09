import S3Upload from "./components/S3Upload";
import BucketList from "./components/S3List";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import DropChooser from "./components/dropBox/DropChooser";
import Drop from "./components/dropBox/Drop";
import DropList from "./components/dropBox/DropList";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<S3Upload />} />
        <Route path="/bucketlist" element={<BucketList />} />
        {/* <Route path="/drop" element={<DropChooser/>}/> */}
        <Route path="/drop" element={<Drop/>}/>
        <Route path="/droplist" element={<DropList/>}/>
        {/* <Route path="/dropBox" element={<DropboxComponent />} /> */}
      </Routes>
    </>
  );
}

export default App;
