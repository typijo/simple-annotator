import React from "react";

const Saver = (props) => {
    const saveFile = () => {
        props.onSave();
    };

    return (
        <a
            className="button is-success"
            onClick={saveFile}
            download={props.filename.replace(/\.[^/.]+$/, "") + ".json"}
            href={props.dllink}>
            保存
        </a>
    )
};

export default Saver;