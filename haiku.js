var fs = require("fs");

var wordInfo = function wordInfo() {
    //all_words is a multidimensional array containg all words in the dictionary
	//words are sorted into the first dimension by syllable count (ex: "tutor" would be in all_words[1])
	//each sub_array contains an arrays of the words, followed by the emphasis for each syllable (ex: ["tutor", 1, 0])
	
	var all_words = [];		//array that will store words by their syllable count
	var search_words = []; //array that will be used to categorize words by their first letter

    this.feed = function feed(line) {
        var word1 = line.split("  ")[0]; //sets word1 equal to the actual word
        
        //sylls equals an array of the phonemes listed for word1 that start a new syllable
        var sylls = line.split(" ").slice(2).filter(function(str) {
            if(!isNaN(str[str.length-1])) {
                    return true;
            } else {
                    return false;
            }
    	});

    	//creates obj2, and array with the word as its first element, and the numerical emphasis for each syllable as the following elements
        //ex: ['tutor', 1, 0]
        var arr_punct = [word1];
		var arr_no_punct = [word1.split("").filter(function(char) {
    		if((char.charCodeAt(0) >=65) && (char.charCodeAt(0) <=90)) {
    			return true;
    		} else {
    			return false;
    		}
    	}).join("")];

    	var arr_sylls = sylls.map(function(str) { return Number(str[str.length-1]) });

		arr_punct = arr_punct.concat(arr_sylls);
		arr_no_punct = arr_no_punct.concat(arr_sylls);

        //adds empty arrays as elements of all_words to ensure that there is an element to store words of all syllable lengths
		var num_sylls = arr_punct.length-1;
		while(all_words.length<num_sylls) {
			all_words.push([]);	
		}
		for(var i = 1; i<=26;i++) search_words.push([]);
	    if(num_sylls>0) all_words[num_sylls-1].push(arr_punct); //only adds words to all_words if they have at least one syllable listed
    	i=-1;
    	if (arr_punct[0].length>0) i = arr_punct[0][0].toLowerCase().charCodeAt(0) - 97;
    	
    	if((i>=0) && (i<=25)) search_words[i].push([arr_no_punct[0], arr_no_punct.length-1]);
    }

    //searchHaiku receives an array of phrases as its only argument, and returns an array of the index numbers of the first phrase of each haiku in the array it is fed
    this.searchHaiku = function searchHaiku(search_phrases) {
    	var syll_count = [5, 7, 5];	//array is used to keep track of how many syllables should be in each phrase of the haiku
    	var syll_index = 0; 	//used as index for syll_count; increments by one whenever a suitable phrase is found, resets to zero when a haiku is found or when a phrase is not suitable
    	var haikus = [];		//used to store index numbers of first phrase of each haiku found
    	var i=0;
    	while(i<search_phrases.length) {	//cycles through phrases stored in search_phrases
    		var phrase = search_phrases[i].split(" ").filter(function(item) {
    			if(item==="") {
    				return false;
    			} else {
    				return true;
    			}
    		});
    		var i2=0;
    		var sum=0;
    		while((i2<phrase.length) && (sum <= syll_count[syll_index])) {	//cycles through words stored in each phrase as long as the syllable threshhold is not exceeded
    			var search_col = search_words[phrase[i2][0].charCodeAt(0)-65]; //search_col equals column of search_words that the current word would be found in
    			var i3=0;
    			var found = false;
    			while((found===false) && (i3<search_col.length)) {
    				if(search_col[i3][0]===phrase[i2]) {
    					sum+=search_col[i3][1];
    					found = true;
    				}
    				i3++;
    			}
    			if(found===false) {
    				sum=10;		//if the current word is not in the dictionary, forces a move on to the next phrase by breaking the loop through words in the current phrase
    			} else {
    				i2++;
    				found = false;
    			}
    		}
    		if((sum===syll_count[syll_index]) && (syll_index===2)) {	//runs if final phrase of a haiku is found
    			syll_index = 1;		//resets to 1, rather than 0, because the last phrase of one haiku can be the first phrase of another
    			haikus.push(i-2);
			}
			else if (sum===syll_count[syll_index]) {	//runs if first or second phrase of a haiku is found
    			syll_index++;
    		} 
    		else if(sum===5) {			//if phrase has 5 syllables, but does not satisfy either of the previous IF statements, current phrase can still serve as the first phrase of a haiku
    			syll_index=1;
    		}
    		else {				//if none of the above conditions are met, starts checking next phrase to see if it could be the first phrase of a haiku
    			syll_index = 0;
    		}
    		i++;
    	}
    	return haikus;
    }

    //iterates through the syllable counts in the 2-dimensional array 'format'
    //adds randomly selected words with the proper syllable count to the end of string variable 'haiku'
	this.writeHaiku = function writeHaiku(format) {
		var haiku = "";
		for(var i=0; i<format.length; i++) {
			for(var i2=0; i2<format[i].length; i2++) {
				var num_sylls = format[i][i2]-1;
				var spot = Math.floor(Math.random() * all_words[num_sylls].length);
				haiku += all_words[num_sylls][spot][0];
				if(i2<format[i].length-1) haiku += " ";
			}
			if(i<format.length-1) haiku += "\n";
		}
		return haiku;
	}

	//iterates through 'format' array, checks to make sure that 10 syllables are specified
	//adds words returned from function 'spewIambic' to the end of string variable 'str'
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

	//******PRIVATE FUNCTIONS for wordInfo

	//returns a boolen value indicating whether the syllables in a given word alternate between increased and diminished emphasis
	//receives 2 arguments:
		//emph_arr is an array of the numeric emphasis of the syllables in the word
		//prev_sylls is an integer indicating the number of syllables already present in the phrase
	//Note: since the first syllable was already checked prior to this function being called, function starts with the second syllable

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

    //receives 3 arguments: 
    	//"prev_emph" is the numeric emphasis of the previous syllable in the phrase
    	//"prev_sylls" is the number of syllables already present in the phrase
    	//"sylls_needed" is the number of syllables of the word that needs to be returned
    //returns a word that satisfies the conditions required to form an iambic pentameter
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
		if(count_check===0) {
			return ["null", 0];
		} else {
			return [word_arr[0], word_arr[word_arr.length-1]];
		}
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
	format = [1, 8, 1];
	console.log("\nIambic Pentameter:\n\n" + dictionary.writeIambic(format));

	var book = [];
	fs.readFile('macbeth.txt', function(err, data) {
		if(err) {
			return console.log(err);
		}
		var text = data.toString().split("");
		var sentences = [];
		var no_punct_sents = [];
		var cur_sentence = "";
		var cur_sent_no_punct = "";

		//cycles through text characters, splitting phrases when it finds a (./!/?/:/;), or multiple newline characters
		//array "sentences" is created for output purposes; contains all phrases with all punctuation included
		//array "no_punct_sents" is created for searching purposes; contains all phrases with punctuation removed
		//neither array contains newline characters; single newline characters in the middle of a phrase are converted into single spaces

		for (var i=0; i<text.length; i++) {
			var char1 = text[i].toUpperCase();
			if(i<text.length-1) {
				var next_char = text[i+1].toUpperCase();
			} else {
					next_char = undefined;
			}

			//checks for phrase-ending punctuation
			if (((char1 === ".") || (char1 === "?") || (char1 === "!") || (char1 === ";") || (char1 === ":") || (char1 === "\n") || (char1 === "\r")) && ((next_char === " ") || (next_char === "\n") || (next_char === "\r") || (i===text.length - 1))) {
				if(cur_sent_no_punct!=="") {
					sentences.push(cur_sentence + char1);
					no_punct_sents.push(cur_sent_no_punct);
					cur_sentence = "";
					cur_sent_no_punct = "";
				}
			}
			//replaces single newline and carriage return characters with a single space
			else if (((char1 === "\n") || (char1 === "\r")) && ((next_char!=="\r") && (next_char!=="\n")) && (cur_sent_no_punct!=="")) {
				cur_sentence += " ";
				cur_sent_no_punct += " ";
			}
			//adds alphabetic characters to current phrase variables
			else if((char1.charCodeAt(0)>=65) && (char1.charCodeAt(0)<=90)) {
				cur_sentence += char1;
				cur_sent_no_punct += char1;
			}
			//only adds spaces to the phrase if they are not at the beginning of the phrase, or if they are not followed by more spaces or newline/carriage return characters
			else if((char1===" ") && (cur_sent_no_punct!=="") && (next_char!=="\n") && (next_char!=="\r")) {
				cur_sentence += char1;
				if(cur_sent_no_punct[cur_sent_no_punct.length-1]!==" ") cur_sent_no_punct += char1;
			} 
			//adds any character that isn't a newline/carriage return or unnecessary space to punctuated phrase only
			else if ((char1!=="\n") && (char1!=="\r") && (char1!==" ")) {
				cur_sentence+=char1;
			}

		}

		//array "haikus" contains the index number of the first phrase of each haiku in "no_punct_sents" (which is the same for "sentences")
		var haikus = dictionary.searchHaiku(no_punct_sents);
		for(i=0;i<haikus.length;i++) {
			console.log("\nHaiku #" + (i+1)+ ":\n\n" + sentences[haikus[i]] + "\n" + sentences[haikus[i]+1] + "\n" + sentences[haikus[i]+2] + "\n");
		}
		
	});
});