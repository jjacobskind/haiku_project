var fs = require("fs");

var wordInfo = function wordInfo() {
        //all_words is a multidimensional array containg all words in the dictionary
	//words are sorted into the first dimension by syllable count (ex: "tutor" would be in all_words[1])
	//each sub_array contains an arrays of the words, followed by the emphasis for each syllable (ex: ["tutor", 1, 0])
	
	var all_words = [];

    this.feed = function feed(line) {
        var word1 = line.split("  ")[0];
        var sylls = line.split(" ").slice(2).filter(function(str) {
                if(!isNaN(str[str.length-1])) {
                        return true;
                } else {
                        return false;
                }
        	});
	        var obj1 = [word1];
	        var obj2 = obj1.concat(sylls.map(function(str) { return Number(str[str.length-1]) }));
			var num_sylls = obj2.length-1;
			while(all_words.length<num_sylls) {
				all_words.push([]);	
			}
	    if(num_sylls>0) all_words[num_sylls-1].push(obj2);
    }

    var spew = function spew(num_sylls) {
        var spot = Math.floor(Math.random() * all_words[num_sylls].length);
		return all_words[num_sylls][spot][0];
    }

	this.writeHaiku = function writeHaiku(format) {
		var haiku = "";
		for(var i=0; i<format.length; i++) {
			for(var i2=0; i2<format[i].length; i2++) {
				haiku += spew(format[i][i2]-1);
				if(i2<format[i].length-1) haiku += " ";
			}
			if(i<format.length-1) haiku += "\n";
		}
		return haiku;
	}
	this.writeIambic = function writeIambic(format) {
		var str="";
		var syll_count = 0;
		var last_emph;
		format_sum = 0;
		for(var i=0;i<format.length;i++) {
			if((all_words.length<format[i]) || (all_words[format[i]].length===0)) return "The dictionary does not contain any words with " + String(format[i]) + " syllables!";
			format_sum += format[i];
		}
		if(format_sum === 10) {
			for(i=0; i<format.length;i++) {
				if(format[i]>0) {
					var result = spewIambic(last_emph, syll_count, format[i]);
					str += result[0];
					last_emph = result[1];
					syll_count += format[i];
					if(i<format.length-1) str += " ";
				}
			}
		} else {
			str = "Iambic pentameter requires 10 syllables!";
		}
		if(str.split(" ").indexOf("null")!==-1) {
			str = "An iambic penatameter could not be generated, given the format specified and the dictionary provided.";
		}
		return str;
	}
	var spewIambic = function spewIambic(prev_emph, prev_sylls, sylls_needed) {
		var word_arr;
		var word;
		var word_choices = all_words[sylls_needed-1];
        var count = Math.floor(Math.random()*word_choices.length); 	//randomly determines an index to start checking for an acceptable word
		var count_check = word_choices.length;						//count_check keeps track of when the entire list of words has been searched without finding an acceptable word
		word_arr = word_choices[count];
                word = word_arr[0];
		if (prev_sylls===0){
			var test_func = function() { return word_arr[1] < 2 };
		}
		else if((prev_sylls % 2) === 1) {  	//when adding even syllable, return true when first emph is greater than prev emph
			test_func = function() { return word_arr[1] >  prev_emph };
		} else { 							//when adding odd syllable
			test_func = function() { return word_arr[1] <  prev_emph };
		}
		while((!test_func() || (!alternate(word_arr.slice(1), prev_sylls))) && (count_check!==0)){
			if(count<word_choices.length-1) {
				count++;
			} else {
				count = 0;
			}
			word_arr = word_choices[count];
			count_check--;
		} 
		console.log(word_arr);
		if(count_check===0) {
			return ["null", 0];
		} else {
			return [word_arr[0], word_arr[word_arr.length-1]];
		}
	}
	var alternate = function alternate(emph_arr, prev_sylls) {
		var i = 1;
		var valid = true;
		while((i<emph_arr.length) && (valid===true)) {
			var count = prev_sylls + i + 1;
			if(((count % 2)===0) && (emph_arr[i]<=emph_arr[i-1])) {
				valid = false;
			}
			else if (((count % 2)===1) && (emph_arr[i]>=emph_arr[i-1])) {
				valid = false;
			}
			i++;
		}
		return valid;
	}
}

var dictionary = new wordInfo();

fs.readFile('cmudict.txt', function(err, data) {
	if(err) {
		return console.log(err);
	}
	var lines = data.toString().split("\n");
	lines.forEach(function(line) {
		dictionary.feed(line);
	});
	var format = [
		[1, 4],
		[2, 2, 2, 1],
		[1, 1, 1, 1, 1]];
	console.log("\nHaiku:\n\n" + dictionary.writeHaiku(format));
	format = [10];
	console.log("\nIambic Pentameter:\n\n" + dictionary.writeIambic(format));
});