
export default function (/*options*/) {
    return {
        transform: function (source /*, id*/) {
            // id corresponds to the file path
            // console.log(" iv compilation: ", id);
            return "/* iv */ \n" + source;
        }
    }
}
