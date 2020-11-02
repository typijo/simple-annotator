import React from "react";
import "bulma/css/bulma.css";
import { useToasts } from "react-toast-notifications";

import { Schema, KEYCODES_SHORTCUT } from "../helpers/consts";

const SelectedText = (props) => {
    const [annovalue, setAnnovalue] = React.useState(Schema.IndexedAnnotag[0]);
    const { addToast } = useToasts();

    const textinfo = props.textinfo;

    const handleDelete = () => {
        props.onDelete();
    };
    const handleAdd = () => {
        try {
            props.onAdd(Schema.Annotag[annovalue]);
        } catch (e) {
            if ( e === "RangeError") {
                addToast("範囲が重なり合っています", {appearance: "error"});
            } else {
                throw e;
            }
        }
    }
    const handleChange = (event) => {
        setAnnovalue(event.target.value);
    }

    let options = [];
    for (let key in Schema.Annotag) {
        const idx = Schema.IndexedAnnotag.indexOf(Schema.Annotag[key]);
        options.push(
            <option key={key} value={Schema.Annovalue[key]}>
                {Schema.Annotag[key] + (
                    idx < KEYCODES_SHORTCUT.length ? " (" + String.fromCharCode(KEYCODES_SHORTCUT[idx]) + ")": "")}
            </option>
        )
    }

    return (
        <div className="columns">
            {/* <div className="column" align="left">
                行&emsp;&emsp;&emsp;：{1+textinfo.lid} <br />
                範囲&emsp;&emsp;：{textinfo.from}ー{textinfo.to} <br />
                テキスト：{textinfo.text}
            </div> */}
            <div className="column">
                <div className="columns is-gapless">
                    <div className="column">
                        <div className="select">
                            <select
                                value={annovalue}
                                onChange={handleChange}>
                                {options}
                            </select>
                        </div>
                        <button
                            className="button"
                            onClick={handleAdd}>
                            追加
                        </button>
                        <button
                            className="button is-danger"
                            onClick={handleDelete}>
                            削除 (BS)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectedText;