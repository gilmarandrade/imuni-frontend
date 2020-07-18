const path = require("path");

module.exports = {
  outputDir: path.resolve(__dirname, "../server/public"),//TODO quando o servidro loca estiver rodando, não vai fazer build para a pasta dist...
//   assetsDir: "../assets/",
    // Warning: Vue-CLI will delete the contents of whatever folders you specify to use for its output. To get around this, I created the "SPA" folders within my templates/ and static/ directories.
    // Note also that the assetsDir is specified relative to the outputDir.
}