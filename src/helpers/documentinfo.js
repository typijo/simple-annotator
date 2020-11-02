import {ANNO_HTMLTAG, ANNO_TYPE} from "./consts";

class SelectedTextInfo {
    constructor(text="", lid=0, from=0, to=0) {
        this.text = text.slice(0, to-from);
        this.lid = lid;
        this.from = from;
        this.to = to;
    }
}

const makeAnnoStartTag = function(type) {
    return '<' + ANNO_HTMLTAG + ' ' + ANNO_TYPE + '="' + type + '">';
};
const makeAnnoEndTag = function() {
    return '</' + ANNO_HTMLTAG + '>'
}

const tokenize = function(line, annoi) {
    let edgeinfo = [];
    for (let j = 0; j < annoi.length; j++) {
        edgeinfo.push([annoi[j].from, 0, j]);
        edgeinfo.push([annoi[j].to, 1, j]);
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

        let tag = null;
        if (edge[1] === 0) {
            tag = makeAnnoStartTag(annoi[edge[2]].annotype);
        }
        else {
            tag = makeAnnoEndTag();
        }

        line = line.slice(0, edge[0] + offset)
                + tag
                + line.slice(edge[0] + offset);
        offset += tag.length;
    }

    return line;
};

const detokenize = function(line) {
    const re_start = new RegExp(makeAnnoStartTag("([^\"]+)"));
    const re_end = new RegExp(makeAnnoEndTag());

    let annoi = [];
    let annoi_unclosed = [];

    let pt = 0;
    while (pt < line.length) {
        const match_start = re_start.exec(line);
        const match_end = re_end.exec(line);

        if (!(match_start) && !(match_end)) {
            break;
        }

        let idx_start = Infinity, idx_end = Infinity;
        if (match_start) {
            idx_start = match_start.index;
        }
        if (match_end) {
            idx_end = match_end.index;
        }

        if (idx_start < idx_end) { // digest a start tag, which is nearest.
            annoi_unclosed.push({
                from: idx_start,
                to: Infinity,
                annotype: match_start[1]
            });

            pt += idx_start;
            line = line.replace(match_start[0], "");
        } else { // one opening start tag ends
            let annoij = annoi_unclosed.pop();
            annoi.push({
                from: annoij.from,
                to: idx_end,
                annotype: annoij.annotype
            });

            pt += idx_end;
            line = line.replace(match_end[0], "");
        }
    };

    return [line, annoi];
};

const detokenizeAll = function(lines) {
    let annos = {}
    for (let i = 0; i < lines.length; i++) {
        let [linei, annoi] = detokenize(lines[i]);

        lines[i] = linei;
        if (annoi.length > 0) {
            annos[i] = annoi;
        }
    }
    
    return [lines, annos];
};


const tokenizeJSON = function(line, annoi) {
    let annoiConverted = [];
    for (let anno of annoi) {
        annoiConverted.push([anno.from, anno.to, anno.annotype]);
    }
    return [line, annoiConverted];
};

const detokenizeJSON = function(jsonobj) {
    let lines = [];
    let annos = {};

    for (let i = 0; i < jsonobj.length; i++) {
        const lineinfo = jsonobj[i];

        lines.push(lineinfo[0]);
        
        const annoi = lineinfo[1];
        if (annoi.length > 0) {
            annos[i] = [];

            for (let anno of annoi) {
                annos[i].push({
                    from: anno[0],
                    to: anno[1],
                    annotype: anno[2]
                });
            }
        }
    }

    return [lines, annos];
};

class DocumentInfo {
    constructor(lines=[], annotations={}) {
        this.lines = lines;
        this.annotations = annotations;
    }

    addAnnotation(lno, from, to, annotype) {
        if (from === to || to < from) return null;

        if (!(lno in this.annotations)){
            this.annotations[lno] = []
        }

        // check cross coverage
        for (let i = 0; i < this.annotations[lno].length; i++) {
            const annoi = this.annotations[lno][i];

            if ((from < annoi.from && to > annoi.from && to < annoi.to) ||
                (from > annoi.from && from < annoi.to && to > annoi.to)) {
                throw "RangeError";
            }
        }

        const anno = {
            from: from,
            to: to,
            annotype: annotype
        };
        this.annotations[lno].push(anno);

        return anno;
    }

    removeAnnotations(lno, from, to) {
        if (!(lno in this.annotations)) return;

        const removed = this.annotations[lno].filter((a) => {
            return (a.to === to && a.from === from);
        });
        this.annotations[lno] = this.annotations[lno].filter((a) => {
            return !(a.to === to && a.from === from);
        });

        return removed;
    }

    toString() {
        let lines = [];

        for (let i = 0; i < this.lines.length; i++) {
            const annos = this.annotations[i] === undefined ? [] : this.annotations[i];
            lines.push(tokenizeJSON(this.lines[i], annos));
        }

        return JSON.stringify(lines);
    }
}

export {
    DocumentInfo, SelectedTextInfo,
    tokenize, tokenizeJSON, detokenize, detokenizeAll, detokenizeJSON
}