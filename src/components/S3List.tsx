import React, { useState, useEffect } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@mui/material";
import Button from "@material-ui/core/Button";
import { ExpandMore } from "@mui/icons-material";
import AWS from "aws-sdk";
import "./s3.scss";
import { useNavigate } from "react-router-dom";
import Loader from "./loader/Loader";

AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_ID || "",
    secretAccessKey: process.env.REACT_APP_ACCESS_KEY || "",
    region: process.env.REACT_APP_REGION || "",
});
const s3 = new AWS.S3();

const params = {
    Bucket: process.env.REACT_APP_DESTINATION_BUCKET || "",
    Delimiter: ''
};
interface Is3List {
    name: string
    ContentType: string
    LastModified: string;
    size: string;
}
const BucketList = () => {
    const navigate = useNavigate();
    const [loader, setLoader] = useState(true)
    const [listFiles, setListFiles] = useState([]);
    const [bucketName, setBucketName] = useState("");
    const [expanded, setExpanded] = useState("");
    const [bucketList, setBucketList] = useState([{ name: "", ContentType: "", LastModified: "", size: "" }]);

    function formatBytes(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }
    useEffect(() => {
        setLoader(true)
        s3.listObjectsV2(params, (err, data: any) => {
            if (err) {
                console.log(err, err.stack);
            } else {
                setListFiles(data.Contents);
                console.log(data.Contents)
                setBucketName(data.Name)
                let dummy: any = [];
                data.Contents.map((e: any) => {
                    let getParm = {
                        Bucket: data.Name,
                        Key: e.Key
                    }
                    s3.getObject(getParm, function (err, file: any) {
                        if (err) {
                            console.log('errrr', err)
                            return err;
                        }


                        dummy.push({ name: e.Key, ContentType: file.ContentType, LastModified: file.LastModified, size: formatBytes(file.ContentLength) });
                        setBucketList([...dummy || undefined]);
                        setLoader(false)
                    });
                });
            }
        });
    }, []);

    useEffect(() => {
        console.log('bucketList', bucketList)
    }, [bucketList]);

    return (
        <>{loader && <Loader />}
            <div className="card">
                <div className="headerContainer">
                    <div></div>
                    <div className="headings3">TransCoded Files</div>
                    <Button onClick={() => navigate("/")} color="primary" className="mt-5">
                        Go Back
                    </Button>
                </div>
                <div>
                    {bucketList.length > 1 && bucketList.map((data: any, index) => (
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
                                    ContentType : {data.ContentType} <br /><br />
                                    Size : {data.size}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BucketList;
