//var length = $('#dropdown').val();
var users = [];
var length = Number($('#dropdown').val());	
var values = {};
var subObj = {};

$(document).on('click', 'select', function() {
	console.log($(this).val() == "on_scroll");
	if($(this).val() == "on_scroll"){
		jQuery(window).scroll(function(){
		var doc_ht = jQuery(window).height() +  jQuery(window).scrollTop();
		if(doc_ht == jQuery(document).height()){
			length += 10;
			jQuery("#finish").html("No more data to load");
			toCreateTable(users, length)
			
		}
	});
	}
	else{
		$(window).off('scroll');
		jQuery("#finish").html("");
		length = Number($(this).val());
		toCreateTable(users, length);
	}
});

$('#submit').on('click', function() {
    // get all the inputs into an array.
    var $inputs = $('#form_container input:text');

    // not sure if you wanted this, but I thought I'd add it.
    // get an associative array of just the values.
    
    $inputs.each(function() {
    	if(jQuery(this).attr('name') == "communication" || jQuery(this).attr('name') == "permanent"){
    		subObj[this.name]= $(this).val();
    	}
    	else{
    		 values[this.name] = $(this).val();
    	}
 });
    values.address = subObj;
    users.unshift(values);
   	toCreateTable(users, length);
   	localStorage.a_user = JSON.stringify(users);
    console.log(users);
});

var newPromise = new Promise(function(res, rej) {
  if(!localStorage.a_user) {
      $.ajax({
          type: "GET",
          url: "http://127.0.0.1:8080/data.json",
          success: function(data) {
            	 	res(data);
          },
          error: function(err) {
            	  rej(err);
          }
        });
  }
  else
  {
  	users = JSON.parse(localStorage.a_user);
  	toCreateTable(users, length);
  }
});

newPromise.then(
  function(data) {
  	loadTheData(data[0]);
  	toCreateTable(users, length);
  },
  function(err) {
    console.log("Data is not present" + err);
  });

function loadTheData(data){
	for(var i = 0; i<100; i++){
		var entry = {
			"firstname" : data["firstname"] + i,
			"lastname" : data["lastname"] + i,
			"email" : data["email"] + i,
			"location" :data["location"] + i,
			"email" :data["phone"] + i,
			"batch" : data["batch"] + i,
			"address" : {
				"communication" : data["address"]["communication"] + i,
				"permanent" : data["address"]["permanent"] + i
				},
			"previous_employer" : data["previous_employer"]["google"] + data["previous_employer"]["facebook"] +data["previous_employer"]["linkedIn"]		
		};
		users.push(entry);
	}	
	localStorage.a_user = JSON.stringify(users);
}

function toCreateTable(data, length){
	if(users.length <= length){
		length = users.length;
	}
	//console.log ("hello" + users.length);
	var html = `<table id = "content_table" border="1" style="border-collapse:collapse;">
					<tr>
						<th>firstname</th>
						<th>lastname</th>
						<th>email</th>
						<th>batch</th>
						<th>address-comm</th>
						<th>address-per</th>
						<th></th>

					</tr>`;

	//var len = data.length;
	for(var i = 0; i<length; i++){
		html += `
			<tr id = "tr_${i}">
				<td>${data[i].firstname}</td>
				<td>${data[i].lastname}</td>
				<td>${data[i].email}</td>
				<td>${data[i].batch}</td>
				<td>${data[i].address.communication}</td>
				<td>${data[i].address.permanent}</td>
				<td>
					<button id="view_btn_${i}">View</button>
					<button id="edit_btn_${i}">Edit</button>
					<button id="del_btn_${i}">Delete</button>
				</td>
			</tr>
			`;
		}
		html += '</table>';
		jQuery('#div1').html(html);
}

jQuery(document).on('click', 'button[id^="view_btn_"]', function(){
	var view_id = jQuery(this).attr('id');
	toview(view_id);

});

jQuery(document).on('click', 'button[id^="del_btn_"]', function(){
	var tr_id = jQuery(this).attr('id').replace('del_btn_', 'tr_');
	var trr = jQuery(this).attr('id').replace('del_btn_', '');
	var hi = Number(trr);
	$('#'+tr_id).remove();
	users.splice(hi, 1);
	toCreateTable(users, length);
	localStorage.a_user = JSON.stringify(users);
});


jQuery(document).on('click', 'button[id^="edit_btn_"]', function(){
	var tr_id =jQuery(this).attr('id').replace('edit_btn_', 'tr_');
	var trr = jQuery(this).attr('id').replace('edit_btn_', '');
	var hi = Number(trr);
	var tempId = tr_id.replace('tr_', 'temp_');
	var err = jQuery('#'+ tempId).attr('id');
	if(err){
		$('#'+err).remove();
	}
	else{
		jQuery('#'+tr_id).after(`
		<tr id="temp_${hi}">
	       <td> <input type = "text" name='firstname' value = "${users[hi].firstname}"></td>
	       <td> <input type = "text" name='lastname'value = "${users[hi].lastname}"> </td>
	       <td> <input type = "text" name='email'value = "${users[hi].email}"> </td>
	       <td><input type = "text" name='batch'value = "${users[hi].batch}"> </td>
	       <td><input type = "text" name='communication' value = "${users[hi].address.communication}"> </td>
	       <td><input type = "text" name='permanent' value = "${users[hi].address.permanent}"> </td>
	       <td><input type = "text" name='previous_employer' value = "${users[hi].previous_employer}"> </td>
	       <td><button id="sub_btn_${hi}">Submit</button></td>
		</tr>`
		);			
	}
});

jQuery(document).on('click', 'button[id^="sub_btn_"]', function(){
	var input_id = jQuery(this).attr('id').replace('sub_btn_', 'temp_');
	var trr = jQuery(this).attr('id').replace('sub_btn_', '');
	var i = Number(trr);
	jQuery("#content_table tr#temp_"+ i + " td input" ).each(function(){
		var key = $(this).attr('name');
		if(key == "communication" || key == "permanent"){
  		 users[i]["address"][key] = $(this).val();
    	}
//users[0]["address"]["communication"]
		// users.address = subObj;
		else{
			users[i][key] = $(this).val();
		}		
	});
	localStorage.a_user = JSON.stringify(users);
	toCreateTable(users, length);
});


function toview(view_id){
	var tr_id =view_id.replace('view_btn_', 'tr_');
	var trr = view_id.replace('view_btn_', '');
	var hi = Number(trr);
	var tempId = tr_id.replace('tr_', 'temp_');
	var err = jQuery('#'+ tempId).attr('id');
	//console.log(users[hi]);
	if(err){
		$('#'+err).remove();
	}
	else{
		jQuery('#'+tr_id).after(`
		<tr id="temp_${hi}">
	       <td>${users[hi].firstname}</td>
	       <td>${users[hi].lastname}</td>
	       <td>${users[hi].email}</td>
	       <td>${users[hi].batch}</td>
	       <td>${users[hi].address.communication}</td>
	       <td>${users[hi].address.permanent}</td>
	       <td>
	       	${users[hi].previous_employer}
	       </td>
		</tr>`
		);			
	}
}

function myFunction() {
  // Declare variables 
  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("content_table");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td_1 = tr[i].getElementsByTagName("td")[0];
    td_2 = tr[i].getElementsByTagName("td")[1];
    td_3 = tr[i].getElementsByTagName("td")[3];
    td_4 = tr[i].getElementsByTagName("td")[4];
    if (td_1 || td_2 || td_3 || td_4) {
    	var cond_1 = td_1.innerHTML.toUpperCase().indexOf(filter) > -1;
    	var cond_2 = td_2.innerHTML.toUpperCase().indexOf(filter) > -1;
    	var cond_3 = td_3.innerHTML.toUpperCase().indexOf(filter) > -1;
    	var cond_4 = td_4.innerHTML.toUpperCase().indexOf(filter) > -1;
      if (cond_1 || cond_2 || cond_3 || cond_4) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    } 
  }
}