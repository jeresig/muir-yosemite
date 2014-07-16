/* 
Special functions for building popcorn.js scenes and managing audio tracks
Written by John Resig (jeresig@gmail.com) and Nell Shaw Cohen (nell@nellshawcohen.com)
for use in "Explore John Muir's Yosemite" (http://beyondthenotes.org/yosemite)
*/

function slideBuilder(slideNum, onStart, onEnd) {
	// use some math to determine the start time based solely on slide number 
	// (e.g. slide 3 starts at 11 seconds)
	var start = ((slideNum - 1) * 5) + 1;
	// find unique div ids in code (e.g. #slide3) by combining #slide with the slide number
	var slide = $("#slide" + slideNum);
	// find unique span ids for circlular buttons used to jump between scenes (e.g. #jumpSlide3)
	var jumpSlide = $("#jumpSlide" + slideNum);
	// find the total number of slides (i.e. divs with class of .slide) in document to use to 
	// determine when "next" button should disappear
	var totalSlides = $(".slide").length;
	// function for clicking scene-jumping buttons
	$(jumpSlide).click(function() {
		pop.play(start);
		return false;
	});
	// create pause cue in slide; e.g. slide 3 is paused at 15 seconds
	pop.cue(slideNum * 5, function() {
		pop.pause();
	});
	// manipulate page elements to construct slide
	pop.code({
		start: start,
		// slides are always 5 seconds long
		end: start + 5,
		onStart: function(){
			// Bring the current slide into view
			slide.addClass("activeSlide");
			// if a custom function for onStart is defined, then call it
			if (onStart) {
				onStart();
			}
			setTimeout(function() {
				// fade in the divs with class of .fullscreen inside this slide
				slide.find(".fullscreen").removeClass("fadeOut");
				slide.find(".caption").removeClass("fadeOut");
			}, 0);
			// highlight the circular button for the active slide
			$(jumpSlide).addClass("buttonCurrent");
			// if this slide is 2 or higher, show the previous button
			if (slideNum > 1) {
				$("#previous").removeClass("fadeOut");
			}
			// if this slide is before the last slide (less than the total number of slides),
			// then show the next button
			if (slideNum < totalSlides) {
				$("#next").removeClass("fadeOut");
			}
			// if this slide is the last (info) slide, hide the previous and next buttons
			if (slideNum == totalSlides) {
				$("#next, #previous").addClass("fadeOut");
			}
		},
		onEnd: function(){
			// if a custom function for onEnd is defined, then call it
			if (onEnd) {
				onEnd();
			}
			// Hide the other active slide (the slide we're transitioning out of)
			// "Hide" means to put it off the side of the page.
			$(".activeSlide").not(slide).removeClass("activeSlide");
			// fade back out again
			slide.find(".fullscreen").addClass("fadeOut");
			slide.find(".caption").addClass("fadeOut");
			$(jumpSlide).removeClass("buttonCurrent");
			$("#next, #previous").addClass("fadeOut");
		}
	});
	pop.code({
		// after a delay of 3 seconds, start
		start: start + 3,
		end: start + 5,
		onStart: function(){
			// fade in the divs with class of .boxWrap inside this slide
			slide.find(".boxWrap").removeClass("fadeOut");
			slide.find(".endNav").removeClass("fadeOut");
			slide.find(".columnLeft").removeClass("fadeOut");
			slide.find(".columnRight").removeClass("fadeOut");
			slide.find(".infoText").removeClass("fadeOut");
			slide.find(".infoPics").removeClass("fadeOut");
		},
		onEnd: function(){
			// fade back out again
			slide.find(".boxWrap").addClass("fadeOut");
			slide.find(".endNav").addClass("fadeOut");
			slide.find(".columnLeft").addClass("fadeOut");
			slide.find(".columnRight").addClass("fadeOut");
			slide.find(".infoText").addClass("fadeOut");
			slide.find(".infoPics").addClass("fadeOut");
		}
	});	
}

var masterVolume = 1;

function audioManager(toUnmute, audioVolume, videoVolume) {
	// manages which audio (including video) is muted or unmuted (faded in)
	// also uses variable volume levels based on user-manipulated masterVolume

	// if no audioVolume argument in defined in function, make it 100
	if (audioVolume === undefined) {
		audioVolume = 1;
	}

	// if no videoVolume argument in defined in function, make it 100
	if (videoVolume === undefined) {
		videoVolume = 1;
	}

	// multiply audioVolume and videoVolume by masterVolume (allowing user to
	// set volume levels)
	audioVolume = audioVolume * masterVolume;
	videoVolume = videoVolume * masterVolume;

	// all video elements in the page included in $allVideo array
	$("video").each(function(i, videoElem) {
		// If the element that we're currently looking at is one of the elements
		// that we want to unmute, then animate to maxVolume over 200 ms
		if (toUnmute.indexOf(videoElem.id) >= 0) {
			$(videoElem).animate({volume: videoVolume}, 1000);
		// If it's not one of the audio/video elements we care about, mute it
		} else {
			$(videoElem).animate({volume: 0}, 1000);
		}
	});

	$.each(Object.keys(allSounds), function(i, id) {
		var sound = allSounds[id];
		var start = sound.volume();
		var end = audioVolume;

		if (toUnmute.indexOf(id) < 0) {
			end = 0;
		}

		sound.fade(start, end, 1000);
	});
}

// audio pre-loading
var allSounds = {};

function audioLoader(files, callback) {
	var loaded = 0;
	var total = 0;

	var isLoaded = function() {
		loaded += 1;
		if (loaded === total) {
			$("#loadingText").text("");
			callback();
		} else {
			var loading = Math.round((loaded / total) * 100);
			$("#loadingText").text(loading + "% loaded...");
		}
	};

	$(document).ready(function() {
		for (var name in files) {
			total += 1;
			var filePath = files[name];
			allSounds[name] = new Howl({
				urls: [filePath + ".mp3", filePath + ".ogg"],
				autoplay: false,
				loop: true,
				volume: 0,
				onload: isLoaded
			});
		}

		var otherMedia = $("img, video");
		otherMedia.on("load canplay", isLoaded);
		total += otherMedia.length;

 		if (total === 0) {
 			callback();
 		}
	});
}

// audio playback when hovering over map links

function mapHoverAudio(sceneName) {
	$("#map_" + sceneName).hover(
		  	function() {
		  	// Once you enter
		  	$("#audio_" + sceneName).animate({volume: 1}, 1000)[0].play();
		  	}, function() {
		  	// Once you leave
		  	$("#audio_" + sceneName).animate({volume: 0}, 750, function() {
		  		this.pause();
		  	});
		  }
		);
}