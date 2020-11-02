import React from "react";
import { useToasts } from "react-toast-notifications";

import Line from "./Line";

import {SelectedTextInfo} from "../helpers/documentinfo";
import {
    showAnnotations, getOffsetFromBeginning} from "../helpers/textdecorator";


const isValidSelection = function(selection) {
    return (selection.anchorNode.parentNode.tagName !== "SUB" &&
            selection.focusNode.parentNode.tagName !== "SUB" &&
            selection.anchorNode.data === selection.focusNode.data);
}


const Editor = (props) => {
    const { addToast } = useToasts();

    const getSelectedTextFunc = (lid) => {
        return () => {
            if (window.getSelection) {
                const selection = window.getSelection();

                if (isValidSelection(selection)) {
                    const range = selection.getRangeAt(0);

                    let text = selection.toString();
                    let from = range.startOffset 
                                + getOffsetFromBeginning(range.startContainer);
                    let to = range.endOffset
                                + getOffsetFromBeginning(range.endContainer);

                    const textinfo = new SelectedTextInfo(text, lid, from, to);
                    props.onTextSelected(
                        textinfo
                    );
                } else {
                    props.onTextSelected(new SelectedTextInfo());
                }
            } else {
                console.log("selection cannot be identified");
                return;
            }
            // // tempoarily commented
            // } else if (
            //     document.selection && document.selection.type != "Control") {
            //     text = document.selection.createRange().text;
            // }
        };
    };

    const handleKeyDown = (e) => {
        try {
            props.onKeyDown(e);
        } catch (e) {
            if ( e === "RangeError") {
                addToast("範囲が重なり合っています", {appearance: "error"});
            } else {
                throw e;
            }
        }
    };

    const doc = props.document;
    const anno = doc.annotations;
    
    let lines = [];
    for (let i = 0; i < doc.lines.length; i++) {
        let text = doc.lines[i];

        let annoi = anno[i];
        if (annoi) {
            text = showAnnotations(text, annoi);
        }

        lines.push(
            <Line
                key={i}
                lid={i}
                onMouseUp={getSelectedTextFunc(i)}
                text={text} />
        );
    }

    return (
        <div
            align="left" id="editorScreen"
            onKeyDown={handleKeyDown} tabIndex="0">
            {lines}
        </div>
    );
};

export default Editor;