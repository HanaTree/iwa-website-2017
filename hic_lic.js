var fs  = require("fs");
var hic = [];
var lic = [];
fs.readFile('hic_lic.txt', function(err, f){
    var array = f.toString().split('\n');
    // use the array
    var numberPattern = /\d+/g;
    var no_stars = array[0].replace(/\*/g, '|');
    var no_commas = no_stars.replace(/,/g, '');
    var no_numbers = no_commas.replace(numberPattern, '|');    var countries = no_numbers.split(' | ');
    var three_cols = true;
    var i = 0;
    while(three_cols){
    	hic.push(countries[i]);
    	lic.push(countries[i+1]);
    	lic.push(countries[i+2]);
    	console.log(countries[i] + " | " + countries[i+1] + " | " + countries[i+2]);
    	if (countries[i+2] == 'Zimbabwe'){
    		i++;
    		three_cols = false;
    	}
    	else {
    		i += 3;
    	}
    }
    for (; i < countries.length; i+=2){
    	hic.push(countries[i]);
    	lic.push(countries[i+1]);
    }

    console.log(hic);

    console.log();
    console.log(lic);

    var new_file = fs.createWriteStream('lic.txt');
    new_file.on('error', function(err) { /* error handling */ });
    lic.forEach(function(v){
    	new_file.write(v + '\n');
    });
    new_file.end();


});
