import {DocumentInfo, detokenizeAll, detokenizeJSON} from "./documentinfo";

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => resolve(reader.result || "");
        reader.readAsText(file);
    });
}

function separateText(text, separator="\n") {
    let lines = text.split(separator);
    if (lines[lines.length - 1].length === 0) {
        lines.pop();
    }

    return lines;
}

async function makeDocumentInfoFromFile(file) {
    let text = await readFileAsText(file);

    if (file.name.endsWith(".json") || file.name.endsWith(".jsonl")) {
        let [lines, annotations] = detokenizeJSON(JSON.parse(text));
        return new DocumentInfo(lines, annotations);
    } else {  // just plain text
        let lines = separateText(text);
        let [lines_mod, annotations] = detokenizeAll(lines);
        return new DocumentInfo(lines_mod, annotations);
    }
};

export { readFileAsText, separateText, makeDocumentInfoFromFile};