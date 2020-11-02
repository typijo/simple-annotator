import { Schema } from "./consts";

const getOffsetFromBeginning = function(object) {
    let offset = 0;
    while (true) {
        if (object.previousSibling) {
            object = object.previousSibling;
        } else if (
            object.parentNode && 
            (object.parentNode.tagName === "SPAN" ||
             object.parentNode.tagName === "TEXT") &&
            object.parentNode.previousSibling) {
            object = object.parentNode.previousSibling;
        } else break;

        if (object.tagName !== "SUB") offset += object.textContent.length;
    }

    return offset;
}

const annotype2color = function(annotype) {
    let idx = Schema.IndexedAnnotag.indexOf(annotype);

    if (idx === -1) return "#DDDDDD";
    else return Schema.AnnoColors[idx];
}

// const mixColor = function(a, b) {
//     if (a === undefined) return b;
//     else if (b === undefined) return a;
//     else return chroma.mix(a, b).name();
// }

const showAnnotations = function(line, annos) {
    let edgeinfo = [];
    for (let j = 0; j < annos.length; j++) {
        edgeinfo.push([annos[j].from, 0, j]);
        edgeinfo.push([annos[j].to, 1, j]);
    }
    edgeinfo = edgeinfo.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        else if (a[0] > b[0]) return 1;
        else {
            if (a[1] > b[1]) return -1;
            else if (a[1] < b[1]) return 1;
            else return 0;
        }
    });

    let offset = 0;
    for (let i = 0; i < edgeinfo.length; i++){
        const edge = edgeinfo[i];
        const type = annos[edge[2]].annotype;

        let tag = null;
        if (edge[1] === 0) {
            tag = '<span style="background-color:' + annotype2color(type) + '">';
        } else {
            tag = '</span><sub>' + type + '</sub>';
        }

        line = line.slice(0, edge[0] + offset)
                + tag
                + line.slice(edge[0] + offset);
        offset += tag.length;
    }

    return line;
};

export {showAnnotations, getOffsetFromBeginning, annotype2color};