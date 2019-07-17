$(document).ready(function($) {

 $(".form-control").focus(function(){
   
   $(this).siblings().addClass("active");

  }).blur(function(){
       $(this).siblings().removeClass("active");
	 $(this).parent().parent().removeClass("active");
   
  });
	$('#nav-icon1').click(function(){
		$(this).toggleClass('open');
		$(".main_menu").toggle();
	});
	$value = $(".form-control").val();

		if($value == "")
		{
			$(".control-label").removeClass("active");
		}
		else
		{
		   $(".control-label").addClass("active");
		}
});  

$(document).ready(function(){
	// Basic
	$('.dropify').dropify();

	// Translated
	$('.dropify-fr').dropify({
		messages: {
			default: 'Glissez-déposez un fichier ici ou cliquez',
			replace: 'Glissez-déposez un fichier ou cliquez pour remplacer',
			remove:  'Supprimer',
			error:   'Désolé, le fichier trop volumineux'
		}
	});

	// Used events
	var drEvent = $('#input-file-events').dropify();

	drEvent.on('dropify.beforeClear', function(event, element){
		return confirm("Do you really want to delete \"" + element.file.name + "\" ?");
	});

	drEvent.on('dropify.afterClear', function(event, element){
		alert('File deleted');
	});

	drEvent.on('dropify.errors', function(event, element){
		console.log('Has Errors');
	});

	var drDestroy = $('#input-file-to-destroy').dropify();
	drDestroy = drDestroy.data('dropify')
	$('#toggleDropify').on('click', function(e){
		e.preventDefault();
		if (drDestroy.isDropified()) {
			drDestroy.destroy();
		} else {
			drDestroy.init();
		}
	})
});


var room = 1;

function education_fields() {

    room++;
    var objTo = document.getElementById('education_fields')
    var divtest = document.createElement("div");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '<div class="row"><div class="col-sm-4"><div class="form-group"> <label class="control-label">Degree/Program </label> <input type="text" class="form-control" id="Schoolname" name="Schoolname[]" value="" placeholder=""></div></div><div class="col-sm-4"><div class="form-group"><label class="control-label">University Name  </label><input type="text" class="form-control" id="Major" name="Major[]" value="" placeholder=""></div></div><div class="col-sm-4"><div class="form-group"><label class="control-label">College/Institute Name  </label> <div class="input-group"> <input type="text" class="form-control" id="Degree" name="Degree[]" value="" placeholder=""><div class="input-group-btn"> <button class="btn btn-danger" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus" aria-hidden="true"></i> </button></div></div></div></div></div>';

    objTo.appendChild(divtest)
}

function remove_education_fields(rid) {
    $('.removeclass' + rid).remove();
}
        


$(document).ready(function(){
	$("#emp_history").click(function(){
		$("#emp_fields").append('<div class="row"><div class="col-sm-4"><div class="form-group"><label class="control-label">Firm Name</label><input type="text" class="form-control" id="" name="Schoolname[]" value="" placeholder=""></div></div><div class="col-sm-4"><div class="form-group"><label class="control-label">Type</label><select class="form-control select-control"><option value="Permanent">Permanent</option><option value="Temporary">Temporary</option></select></div></div><div class="col-sm-4"><div class="form-group"><label class="control-label">Position Held </label><div class="input-group"><input type="text" class="form-control" id="" name="Major[]" value="" placeholder=""><div class="input-group-btn"><button class="remCF btn btn-danger" type="button" onclick="remove_education_fields(' + room + ');"><i class="fa fa-minus" aria-hidden="true"></i></button></div></div></div></div></div>');
	});
    $("#emp_fields").on('click','.remCF',function(){
        $(this).closest('.row').remove();
    });	
	
	$(".steps li").removeClass("disabled");
});



