const fastcsv = require("fast-csv");
// const fs = require("fs");
// const path = require("path");

module.exports = app => {
    
    /**
     * 
     */
    const exportCSV = async () => {
        const result = await app.server.service.v2.unidadeService.findAtivos();
    
        return result;



        // const stream = fastcsv.format({ headers: true, delimiter: ';' });
        // stream.pipe(ws);

        // stream.write(result);
        // stream.end(() => {
        //     console.log("Write to .csv de verdade successfully!");
        // });

        // console.log("Write to .csv successfully!");
        // await fastcsv
        //     .write(result, { headers: true, delimiter: ';' })
        //     .on("finish", () => {
        //         console.log("Write to .csv successfully!");
        //         return result;
        //     })
        //     .on("error", error => {
        //         throw error;
        //     })
        //     .pipe(ws);
    }



    return { exportCSV }
}