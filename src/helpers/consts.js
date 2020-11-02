import chroma from "chroma-js";

const DefaultAnnotag = {
    PEOPLE: "人名",
    ADDRESS: "住所",
    NUMBER: "番号",
    COMPANY: "会社名",
    OTHER1: "テスト1",
    OTHER2: "テスト2",
    OTHER3: "テスト3",
    OTHER4: "テスト4",
    OTHER5: "テスト5",
    OTHER6: "テスト6",
    OTHER7: "テスト7",
    OTHER8: "テスト8",
    OTHER9: "テスト9",
    OTHER10: "テスト10",
    OTHER11: "テスト11",
    OTHER12: "テスト12",
    OTHER13: "テスト13",
    OTHER14: "テスト14",
    OTHER15: "テスト15",
    OTHER16: "テスト16",
    OTHER17: "テスト17",
    OTHER18: "テスト18",
    OTHER19: "テスト19",
    OTHER20: "テスト20",
};

class Schema {
    static Annotag = null;
    static Annovalue = null;
    static IndexedAnnotag = null;
    static AnnoColors = null;

    static _makeAnnovalue = function(annotag) {
        let ret = {};
        for (const element in annotag) {
            ret[element] = element;
        }
        return ret;
    }

    static _makeIndexedAnnotag = function(annotag) {
        let ret = [];
        for (const element in annotag) {
            ret.push(annotag[element]);
        }
        return ret;
    };

    static setSchema = function(schema=DefaultAnnotag) {
        Schema.Annotag = schema;
        Schema.Annovalue = Schema._makeAnnovalue(schema);
        Schema.IndexedAnnotag = Schema._makeIndexedAnnotag(schema);
        Schema.AnnoColors = chroma.scale(["yellow", "aquamarine"]).mode("lch").colors(Schema.IndexedAnnotag.length);
    };
}
Schema.setSchema(DefaultAnnotag);

const ANNO_HTMLTAG = "annotation";
const ANNO_TYPE = "type";

const KEYCODES_SHORTCUT = [
    49, 50, 51, 52, 53, 54, 55, 56, 57, 48, // 1 2 3 4 5 6 7 8 9 0
    81, 87, 69, 82, 84, 89, 85, 73, 79, 80, // q w e r t y u i o p
    65, 83, 68, 70, 71, 72, 74, 75, 76      // a s d f g h j k l
];

export {Schema, ANNO_HTMLTAG, ANNO_TYPE, KEYCODES_SHORTCUT};