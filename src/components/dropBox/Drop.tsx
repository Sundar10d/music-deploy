import { useState } from "react";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import Loader from "../loader/Loader";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Dropbox from "../../services/Dropbox/dropbox";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
            display: "flex",
            fontWeight: "bolder"
        },
    })
);
function Drop() {
    const classes = useStyles();
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false)
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [accessToken, setAccessToken] = useState(process.env.REACT_APP_ACCESS_TOKEN || "")
    const [file, setFile] = useState<any>()
    const [total, setTotal] = useState(0)
    const [progress, setProgress] = useState(0)
    function setfile(e: any) {
        setFileUploaded(false)
        setFile(e.target.files[0])
        console.log('files', e.target.files[0], "file==>", file)
    }
    function uploadFile() {
        setLoader(true)
        const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
        var ACCESS_TOKEN = accessToken;
        var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });


        if (file.size < UPLOAD_FILE_SIZE_LIMIT) { // File is smaller than 150 Mb - use filesUpload API
            let responce = dbx.request('files/upload', { path: '/' + file.name, contents: file }, 'user', 'content', 'upload').then((data: any) => { 
                setLoader(false)
                setFileUploaded(true);
                console.log('then', data) }
            ).catch((data: any) => {
                console.log('catch', data)
            })
            console.log('file upload', responce)
        } else { // File is bigger than 150 Mb - use filesUploadSession* API
            const maxBlob = 150 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size Note: used 150MB

            var workItems = [];

            var offset = 0;

            while (offset < file.size) {
                var chunkSize = Math.min(maxBlob, file.size - offset);
                workItems.push(file.slice(offset, offset + chunkSize));
                offset += chunkSize;
            }
            setTotal(workItems.length + 1)
            console.log('large file', workItems)
            const task = workItems.reduce((acc, blob, idx, items) => {
                if (idx == 0) {
                    console.log('inside start', acc, blob, idx, items)
                    // Starting multipart upload of file
                    return acc.then(function () {

                        return dbx.request('files/upload_session/start', { close: false, contents: blob }, 'user', 'content', 'upload')
                            .then((response: any) => {
                                setProgress(idx + 1)
                                console.log('session start res', response)
                                return response.result.session_id
                            })
                    });
                } else if (idx < items.length - 1) {
                    // Append part to the upload session
                    return acc.then(function (sessionId: string) {
                        console.log('inside append', sessionId)
                        var cursor = { session_id: sessionId, offset: idx * maxBlob };
                        return dbx.request('files/upload_session/append_v2', { cursor: cursor, close: false, contents: blob }, 'user', 'content', 'upload').then(() => {
                            setProgress(idx + 1)
                            return sessionId
                        });
                    });
                } else {
                    console.log('inside end')
                    // Last chunk of data, close session
                    return acc.then(function (sessionId: string) {
                        var cursor = { session_id: sessionId, offset: file.size - blob.size };
                        var commit = { path: '/' + file.name, mode: 'add', autorename: true, mute: false };

                        return dbx.request('files/upload_session/finish', { cursor: cursor, commit: commit, contents: blob }, 'user', 'content', 'upload').then(() => { 
                            setLoader(false)
                            setFileUploaded(true);
                            setProgress(idx + 1) });
                    });
                }
            }, Promise.resolve());
        }
    }
    return (<>
        {fileUploaded &&<div className="Nav">
    <Button
      variant="contained"
      color="secondary"
      size="large"
      className={classes.button}
      onClick={() => navigate("/droplist")}
    >
      VIEW UPLOADED DATA IN DropBox
    </Button>
  </div>}
        <div className="main">
            <h1>React DropBox File Upload</h1>
            {loader &&<Loader></Loader>}
            <div className="uploadWrapper">
                <Button className="upload" component="label">
                    Choose your Video File
                    <input type="file" hidden onChange={setfile} />
                </Button>
                <button
                    className="uploadBtn"
                    onClick={uploadFile}
                >
                    Upload to DropBox
                </button>
            </div>
            {file && (
                <p style={{ marginTop: "4%" }}>
                    Selected File -{" "}
                    {<span className="fileName">{file["name"]}</span>}
                </p>
            )}
            {fileUploaded &&
                <div className="successUpload">File has been uploaded successfully ..!</div>
            }
            <Button onClick={() => navigate("/")} color="primary" className="mt-5">
                Go Back
            </Button>
        </div>
    </>
    )
}

export default Drop;