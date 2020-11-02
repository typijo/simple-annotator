import React from "react";

const Line = (props) => {
    const {onMouseUp, text} = props;

    return (
        <div
            className="line" 
            onMouseUp={onMouseUp}
            dangerouslySetInnerHTML={{__html: text}} />
    );
};

export default Line;