import { useState } from "react";
import DropboxChooser from "react-dropbox-chooser";

function DropChooser() {
  const APP_KEY='tbkbnhw7arm5lkn';
    const [allLinks, setAllLinks] = useState([]);
    const [loader, setLoader] = useState(false);
    function handleSuccess(files) {
        console.log("files >> ", files);
        let promiseArray = [];
        let allLinks = [];
        setLoader(true);
        
        files.forEach((file) => {
          allLinks.push(file);
        });
        setAllLinks(allLinks);
        Promise.all(promiseArray)
          .then((res) => {
            setLoader(false);
            console.log("all the files uploaded successfully !!");
          })
          .catch((err) => {
            setLoader(false);
            console.log("some error in uploading files");
          });
      }
  return (
    <DropboxChooser
                appKey={APP_KEY}
                success={handleSuccess}
                // extensions={[".pdf", ".doc", ".docx"]}
                linkType="direct"
                cancel={() => console.log("closed")}
                folderselect={true}
                multiselect={true}
              >
                Choose files
                {/* <button class="dropbox-dropin-btn dropbox-dropin-success">
                  <span class="dropin-btn-status"></span>Choose Files
                </button> */}
              </DropboxChooser>
  )
}

export default DropChooser