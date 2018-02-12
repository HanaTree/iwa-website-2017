$(document).ready(function(){
	$(".button-collapse").sideNav();
	$('.collapsible').collapsible();
	$('.modal').modal();
	var date = new Date(2017, 7, 13);
	var now = new Date();
	var diff = date.getTime()/1000 - now.getTime()/1000;
	var clock = $('.countdown');
	console.log(clock);
	if (clock.length != 0){
		clock.FlipClock(diff, {
			clockFace: 'DailyCounter',
			countdown: true
		});
	}
	$('select').material_select();
	$('.modal').modal();
	$("#export").click(function(){
		$('table').tableToCSV();
	});
})


