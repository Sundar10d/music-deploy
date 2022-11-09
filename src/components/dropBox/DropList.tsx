import { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
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
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
function DropList() {
    const classes = useStyles();
    const navigate = useNavigate();
    const [loader, setLoader] = useState(true)
    const [dropList, setDropList] = useState<any>()
    const [accessToken, setAccessToken] = useState(process.env.REACT_APP_ACCESS_TOKEN || "")

    useEffect(() => {
        getFiles()
    }, [])
    function getFiles() {
        var dbx = new Dropbox({ accessToken: accessToken })

        dbx.request('files/list_folder', { path: '' }, 'app, user', 'api', 'rpc').then((data: any) => {  //files/list_folder
            setLoader(false)
            setDropList(data.result.entries)
            console.log(data.result.entries)
        })
    }

    return (<>
        <div className="card">
            <div className="headerContainer">
                <div></div>
                <div className="headings3">TransCoded Files</div>
                <Button onClick={() => navigate("/")} color="primary" className="mt-5">
                    Go Back
                </Button>
            </div>
            <div>
                {dropList && dropList.map((data: any, index: number) => (
                    <Accordion key={index}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>{data.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                ContentType : video/{data.name.split('.').pop()} <br /><br />
                                Size : {formatBytes(data.size)}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
                {loader && <Loader />}
            </div>
        </div>
    </>
    )
}

export default DropList;